<template>
  <div class="testcase-container unified-container">
    <el-card class="unified-main-card">
      <div class="action-bar unified-action-bar">
        <h3 class="card-title unified-card-title">测试用例</h3>
        <div style="flex:1"></div>
        <el-button type="primary" @click="openEdit()" :disabled="submitLoading">
          <i class="fa fa-plus mr-1"></i>新建用例
        </el-button>
      </div>

      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" @tab-click="onTabClick">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="接口用例" name="api" />
        <el-tab-pane label="文档用例" name="doc" />
      </el-tabs>

      <!-- 搜索栏 -->
      <div class="search-container unified-search-container">
        <el-form :inline="true" :model="searchForm" class="unified-form-inline">
          <el-form-item label="用例名称">
            <el-input v-model="searchForm.keyword" placeholder="请输入名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用例列表 -->
      <div class="table-wrap unified-table-wrap">
        <el-table :data="filteredCases" stripe v-loading="listLoading"
          class="project-table unified-table" style="width: 100%">
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="name" label="用例名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="case_type" label="类型" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.case_type === 'api' ? 'primary' : 'warning'" size="small">
                {{ scope.row.case_type === 'api' ? '接口用例' : '文档用例' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="steps" label="执行步骤" min-width="200" show-overflow-tooltip />
          <el-table-column prop="level" label="等级" width="80">
            <template #default="scope">
              <el-tag :type="levelTagType(scope.row.level)" size="small">{{ scope.row.level || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'">{{ scope.row.status || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="scope">
              <el-button type="text" v-if="scope.row.case_type === 'api'"
                @click="executeCase(scope.row)"><i class="fa fa-play mr-1"></i>执行</el-button>
              <el-button type="text" @click="viewCase(scope.row)" :disabled="detailLoading"><i class="fa fa-eye mr-1"></i>查看</el-button>
              <el-button type="text" @click="openEdit(scope.row)"><i class="fa fa-edit mr-1"></i>编辑</el-button>
              <el-button type="text" @click="confirmDelete(scope.row)" :loading="isDeleting(scope.row.id)"><i class="fa fa-trash mr-1"></i>删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrap unified-pagination-wrap">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalCases"
            :page-size="pageSize"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 查看抽屉 -->
    <el-drawer :visible.sync="viewVisible" title="用例详情" size="60%"
      :close-on-click-modal="false" :append-to-body="true">
      <div class="drawer-content" v-loading="detailLoading">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用例名称">{{ currentCase.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用例类型">
            <el-tag :type="currentCase.case_type === 'api' ? 'primary' : 'warning'" size="small">
              {{ currentCase.case_type === 'api' ? '接口用例' : '文档用例' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="前置条件">
            <div class="detail-text">{{ currentCase.precondition || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="执行步骤">
            <div class="detail-text detail-steps">{{ currentCase.steps || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="预期结果">
            <div class="detail-text">{{ currentCase.expected || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="用例等级">
            <el-tag :type="levelTagType(currentCase.level)" size="medium">{{ currentCase.level || '-' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentCase.status === 'enabled' ? 'success' : 'info'" size="medium">
              {{ currentCase.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>

    <!-- 新建/编辑对话框 -->
    <el-dialog :title="editForm.id ? '编辑用例' : '新建用例'" :visible.sync="editVisible"
      width="680px" append-to-body :close-on-click-modal="false">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="96px">
        <el-form-item label="用例类型" prop="case_type">
          <el-radio-group v-model="editForm.case_type">
            <el-radio label="api">接口用例</el-radio>
            <el-radio label="doc">文档用例</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用例名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入用例名称" ref="nameInput" />
        </el-form-item>
        <el-form-item label="前置条件" prop="precondition">
          <el-input type="textarea" :rows="2" v-model="editForm.precondition" placeholder="请输入前置条件" />
        </el-form-item>
        <el-form-item label="执行步骤" prop="steps">
          <el-input type="textarea" :rows="4" v-model="editForm.steps" placeholder="请分步描述执行步骤" />
        </el-form-item>
        <el-form-item label="预期结果" prop="expected">
          <el-input type="textarea" :rows="2" v-model="editForm.expected" placeholder="请输入预期结果" />
        </el-form-item>
        <el-form-item label="用例等级" prop="level">
          <el-select v-model="editForm.level" placeholder="请选择等级" style="width: 100%">
            <el-option label="P0" value="P0" />
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false" :disabled="submitLoading">取 消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="submitLoading">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'testCaseManagement',
  data () {
    return {
      searchForm: {
        keyword: '',
        case_type: '',
        job_id: '',
        doc_id: '',
        api_interface_id: '',
        status: ''
      },
      activeTab: '',
      cases: [],
      currentPage: 1,
      pageSize: 10,
      totalCases: 0,
      viewVisible: false,
      editVisible: false,
      currentCase: {},
      editForm: {
        id: null,
        case_type: '',
        name: '',
        precondition: '',
        steps: '',
        expected: '',
        level: '',
        status: ''
      },
      listLoading: false,
      detailLoading: false,
      submitLoading: false,
      deletingIds: [],
      rules: {
        case_type: [{ required: true, message: '请选择用例类型', trigger: 'change' }],
        name: [{ required: true, message: '请输入用例名称', trigger: 'blur' }],
        steps: [{ required: true, message: '请输入执行步骤', trigger: 'blur' }],
        expected: [{ required: true, message: '请输入预期结果', trigger: 'blur' }]
      }
    }
  },
  created () {
    const hasQuery = this.$route.query.job_id || this.$route.query.doc_id || this.$route.query.api_interface_id
    if (hasQuery) {
      this.searchForm.job_id = this.$route.query.job_id || ''
      this.searchForm.doc_id = this.$route.query.doc_id || ''
      this.searchForm.api_interface_id = this.$route.query.api_interface_id || ''
      if (this.$route.query.case_type) {
        this.activeTab = this.$route.query.case_type
        this.searchForm.case_type = this.$route.query.case_type
      }
      this.fetchCases()
    } else {
      this.loadLatestJobCases()
    }
  },
  computed: {
    filteredCases () {
      return this.cases
    }
  },
  methods: {
    loadLatestJobCases () {
      this.$axios.get('/api/testcase/ai_job/get', { params: { page: 1, page_size: 1 } })
        .then(res => {
          const raw = res && res.data
          const arr = Array.isArray(raw) ? raw
            : (raw && Array.isArray(raw.data)) ? raw.data
              : (raw && Array.isArray(raw.list)) ? raw.list : []
          if (arr.length > 0) {
            const job = arr[0]
            this.searchForm.job_id = job.id || job.job_id || ''
            this.searchForm.doc_id = job.doc_id || ''
          }
          this.fetchCases()
        })
        .catch(() => { this.fetchCases() })
    },
    onTabClick (tab) {
      this.searchForm.case_type = tab.name
      this.currentPage = 1
      this.fetchCases()
    },
    handleSearch () {
      this.currentPage = 1
      this.fetchCases()
    },
    resetSearch () {
      this.searchForm.keyword = ''
      this.searchForm.case_type = this.activeTab
      this.currentPage = 1
      this.fetchCases()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchCases()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.fetchCases()
    },
    levelTagType (level) {
      if (level === 'P0') return 'danger'
      if (level === 'P1') return 'warning'
      return 'info'
    },
    executeCase (row) {
      this.$router.push({
        path: '/testCaseExecution',
        query: {
          case_id: row.id,
          case_name: row.name || '',
          steps: row.steps || '',
          expected: row.expected || '',
          base_url: row.base_url || ''
        }
      })
    },
    viewCase (row) {
      this.viewVisible = true
      this.detailLoading = true
      this.currentCase = {}
      this.$axios.get('/api/testcase/detail', { params: { id: row.id } })
        .then(res => {
          const raw = res && res.data
          const data = raw && (raw.data || raw.detail || raw)
          const status = data.status != null ? String(data.status) : ''
          const caseType = data.case_type || (data.doc_type === 'api' ? 'api' : '')
          this.currentCase = {
            id: data.id != null ? data.id : (data.case_id != null ? data.case_id : data.caseid),
            case_type: caseType || 'doc',
            name: data.title || data.name || data.case_name || '',
            precondition: data.precondition || data.pre || '',
            steps: data.test_steps || data.steps || data.step || '',
            expected: data.expected_result || data.expected || data.expect || '',
            level: data.priority != null ? String(data.priority) : (data.level != null ? String(data.level) : ''),
            status: status === 'active' ? 'enabled' : (status === 'inactive' ? 'disabled' : status)
          }
        })
        .catch(() => { this.$message.error('加载详情失败') })
        .finally(() => { this.detailLoading = false })
    },
    openEdit (row) {
      if (row) {
        const status = row.status != null ? String(row.status) : ''
        const caseType = row.case_type || (row.doc_type === 'api' ? 'api' : '')
        this.editForm = {
          id: row.id != null ? row.id : (row.case_id != null ? row.case_id : row.caseid) || null,
          case_type: caseType || 'doc',
          name: row.name || row.title || row.case_name || '',
          precondition: row.precondition || row.pre || '',
          steps: row.steps || row.test_steps || row.step || '',
          expected: row.expected || row.expected_result || row.expect || '',
          level: row.level != null ? String(row.level) : (row.priority != null ? String(row.priority) : ''),
          status: status === 'active' ? 'enabled' : (status === 'inactive' ? 'disabled' : status)
        }
      } else {
        this.editForm = { id: null, case_type: '', name: '', precondition: '', steps: '', expected: '', level: '', status: '' }
      }
      this.editVisible = true
      this.$nextTick(() => {
        if (this.$refs.nameInput && this.$refs.nameInput.focus) {
          this.$refs.nameInput.focus()
        }
      })
    },
    createCase () {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return
        this.submitLoading = true
        const payload = {
          title: this.editForm.name,
          test_steps: this.editForm.steps,
          expected_result: this.editForm.expected,
          precondition: this.editForm.precondition,
          priority: this.editForm.level,
          status: this.editForm.status,
          case_type: this.editForm.case_type
        }
        this.$axios.post('/api/testcase/create', payload)
          .then(() => { this.$message.success('创建成功'); this.editVisible = false; this.fetchCases() })
          .catch(() => { this.$message.error('创建失败') })
          .finally(() => { this.submitLoading = false })
      })
    },
    updateCase () {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return
        this.submitLoading = true
        const payload = {
          id: this.editForm.id,
          title: this.editForm.name,
          test_steps: this.editForm.steps,
          expected_result: this.editForm.expected,
          precondition: this.editForm.precondition,
          priority: this.editForm.level,
          status: this.editForm.status,
          case_type: this.editForm.case_type
        }
        this.$axios.post('/api/testcase/update', payload)
          .then(() => { this.$message.success('更新成功'); this.editVisible = false; this.fetchCases() })
          .catch(() => { this.$message.error('更新失败') })
          .finally(() => { this.submitLoading = false })
      })
    },
    submitEdit () {
      if (this.editForm.id) {
        this.updateCase()
      } else {
        this.createCase()
      }
    },
    confirmDelete (row) {
      this.$confirm('确定删除该用例吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => { this.removeCase(row) }).catch(() => {})
    },
    removeCase (row) {
      this.deletingIds.push(row.id)
      this.$axios.post('/api/testcase/delete', { id: row.id })
        .then(() => { this.$message.success('删除成功'); this.fetchCases() })
        .catch(() => { this.$message.error('删除失败') })
        .finally(() => { this.deletingIds = this.deletingIds.filter(id => id !== row.id) })
    },
    isDeleting (id) { return this.deletingIds.includes(id) },
    fetchCases () {
      this.listLoading = true
      const params = {
        page: this.currentPage,
        page_size: this.pageSize,
        project_id: this.searchForm.project_id || undefined,
        status: this.searchForm.status || undefined,
        job_id: this.searchForm.job_id || undefined,
        doc_id: this.searchForm.doc_id || undefined,
        api_interface_id: this.searchForm.api_interface_id || undefined,
        case_type: this.searchForm.case_type || undefined,
        keyword: this.searchForm.keyword || undefined
      }
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') delete params[key]
      })
      this.$axios.get('/api/testcase/get', { params })
        .then(res => {
          const raw = res && res.data
          const arr = Array.isArray(raw) ? raw
            : (raw && Array.isArray(raw.data)) ? raw.data
              : (raw && Array.isArray(raw.list)) ? raw.list : []
          const total = (raw && raw.pagination && typeof raw.pagination.total === 'number')
            ? raw.pagination.total
            : (raw && typeof raw.total === 'number') ? raw.total : arr.length
          this.totalCases = total
          this.cases = arr.map(it => {
            const status = it.status != null ? String(it.status) : ''
            const caseType = it.case_type || (it.doc_type === 'api' ? 'api' : '')
            return {
              id: it.id != null ? it.id : (it.case_id != null ? it.case_id : it.caseid),
              case_type: caseType || 'doc',
              name: it.name || it.title || it.case_name || '',
              precondition: it.precondition || it.pre || '',
              steps: it.steps || it.test_steps || it.step || '',
              expected: it.expected || it.expected_result || it.expect || '',
              level: it.level != null ? String(it.level) : (it.priority != null ? String(it.priority) : ''),
              status: status === 'active' ? 'enabled' : (status === 'inactive' ? 'disabled' : status),
              doc_id: it.doc_id || '',
              api_interface_id: it.api_interface_id || '',
              base_url: it.base_url || ''
            }
          })
        })
        .catch(() => { this.$message.error('加载列表失败'); this.cases = [] })
        .finally(() => { this.listLoading = false })
    }
  }
}
</script>

<style scoped>
.testcase-container {}

.mr-1 { margin-right: 6px; }

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.drawer-content {
  padding: 0;
  min-height: 200px;
}

.detail-text {
  line-height: 1.8;
  color: #303133;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.detail-steps {
  white-space: pre-wrap;
  line-height: 2;
}
</style>
