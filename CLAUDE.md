# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Start development server (runs on localhost:8080)
npm run dev
# or
npm start

# Production build
npm run build

# Production build with bundle analyzer
npm run build --report

# Run E2E tests
npm run e2e
# or
npm test

# Lint source code
npm run lint
```

## Project Architecture

This is a **Vue 2.x** application using the Options API (not Composition API).

### Tech Stack
- **Vue 2.5.2** - Frontend framework
- **Element UI 2.15.14** - UI component library
- **Vue Router 3.0.1** - Routing
- **Axios 0.19.2** - HTTP client (mounted globally as `this.$axios`)
- **Webpack 3.6.0** - Build tool

### Directory Structure
```
src/
├── components/
│   ├── aitest/          # AI testing features
│   │   ├── projectPrdManagement.vue       # Requirements document management
│   │   ├── apiDocManagement.vue          # API document management
│   │   ├── apiInterfaceManagement.vue     # API interface management
│   │   ├── testDataManagement.vue        # Test data management (public vs interface-specific)
│   │   ├── aitestcase.vue               # AI test case job management
│   │   └── testCaseManagement.vue        # Test case management
│   ├── login/           # Authentication & layout
│   │   ├── loginPage.vue                # Login page
│   │   └── homePage.vue                 # Main layout with sidebar navigation
│   └── system/          # System administration
│       └── projectManagement.vue           # Project management
├── router/
│   ├── index.js         # Main router configuration
│   └── permission.js    # (exists, check if used)
└── main.js            # Application entry point
```

### API Architecture
- All API calls use the `/api/` prefix
- Development proxy: `/api/*` → `http://127.0.0.1:8000` (configured in `config/index.js`)
- Common API pattern: `this.$axios.get('/api/endpoint', { params })` and `this.$axios.post('/api/endpoint', data)`

### Response Format Handling
API responses vary in structure. Components handle multiple patterns:
1. Direct array: `Array.isArray(res.data)`
2. Nested data: `res.data.data` or `res.data.list`
3. Object with code/message: `res.data.code`, `res.data.message`, `res.data.data`

Common pattern used across components:
```javascript
const raw = res && res.data
const list = Array.isArray(raw)
  ? raw
  : (raw && Array.isArray(raw.data))
    ? raw.data
    : (raw && Array.isArray(raw.list))
      ? raw.list
      : []
```

## Code Conventions

### Linting & Style
- ESLint with `babel-eslint` parser
- Extends: `plugin:vue/essential` and `standard`
- **Important**: Optional chaining operator `?.` is **NOT supported** - use conditional checks instead

### ESLint Gotchas
The project has `no-shadow-restricted-names` rule which prevents using certain names as variables:
- `name`, `length`, `prototype`, and other JavaScript reserved names
- In catch blocks, always include an error parameter: `} catch (err) { ... }`
- Avoid using these as variable names in any scope

### Component Structure
- Single-file components (`.vue`)
- Scoped styles for each component
- Consistent table styling using `.project-table` class

### Common Component Patterns

#### Table with Search & Pagination
Most list pages follow this pattern:
- Search form with inline layout (`.form-inline`)
- `.project-table` class for consistent styling
- Pagination component with size/page/jumper controls

#### Form Validation
- Element UI form with rules object
- Validation: `this.$refs.formRef.validate(valid => { ... })`

#### Dialog/Drawer Patterns
- Use `:visible.sync` for two-way binding
- `:append-to-body="true"` for proper z-index
- `:close-on-click-modal="false"` to prevent accidental closes

## API Endpoints Reference

| Endpoint | Method | Purpose | Params |
|-----------|--------|---------|---------|
| `/api/project/get` | GET | Get projects list |
| `/api/doc/get` | GET | Get requirements docs |
| `/api/doc/create` | POST | Upload doc (multipart/form-data) |
| `/api/doc/delete` | POST | Delete doc (doc_id) |
| `/api/doc/detail` | GET | Get doc content (id) |
| `/api/ai_job/run` | POST | Generate test cases (doc_id) |
| `/api/ai_job/get` | GET | Get AI job list |
| `/api/api_doc/get` | GET | Get API docs |
| `/api/api_doc/create` | POST | Upload API doc (multipart/form-data) |
| `/api/api_doc/delete` | POST | Delete API doc (doc_id) |
| `/api/api_doc/parse` | POST | Parse API doc (doc_id) |
| `/api/api_doc/detail` | GET | Get API doc content (id) |
| `/api/api_interface/get` | GET | Get API interfaces (optional: api_doc_id) |
| `/api/api_test_cases/generate` | POST | Generate test cases (api_interface_id) |
| `/api/test_data/get` | GET | Get test data |
| `/api/test_data/create` | POST | Create test data (test_data_json, description, optional: api_interface_id) |
| `/api/test_data/update` | POST | Update test data |
| `/api/test_data/delete` | POST | Delete test data (id) |
| `/api/testcase/get` | GET | Get test cases |
| `/api/testcase/detail` | GET | Get test case detail (caseid) |
| `/api/testcase/update` | POST | Update test case |
| `/api/testcase/delete` | POST | Delete test case (caseid) |

## Important Notes

### Authentication
- Token stored in `localStorage.getItem('token')`
- 401 response auto-redirects to `/login` (configured in router/index.js interceptor)

### Test Data Architecture
Test data has two types:
- **Public parameters** (`is_public: true`): Global, reusable, no `api_interface_id` required
- **Interface parameters** (`is_public: false`): Specific to one API, `api_interface_id` required

### File Upload
- Use `FormData` for multipart uploads
- Content-Type header: `'multipart/form-data'`
- Element UI `el-upload` with `:auto-upload="false"` and manual submit

### Error Handling Pattern
```javascript
.catch(() => {
  this.$message.error('操作失败')
})
.finally(() => {
  // cleanup loading states
  this.someLoading = false
})
```

## Development Workflow

When adding new features:
1. Create component in `src/components/aitest/` (or appropriate folder)
2. Add route in `src/router/index.js` with HomePage as parent
3. Add menu item in `src/components/login/homePage.vue`
4. Add page title in `setPageTitle` method
5. Use consistent styling patterns (tables, forms, dialogs)
