<template>
  <div class="testcase-container">
    <el-card>
      <div class="action-bar">
        <h3 class="card-title">测试用例</h3>
        <div style="flex:1"></div>
        <el-button type="primary" @click="openEdit()" :disabled="submitLoading">
          <i class="fa fa-plus mr-1"></i>新建用例
        </el-button>
      </div>

      <!-- 用例列表 -->
      <div class="table-wrap">
        <el-table :data="filteredCases" border stripe size="small" v-loading="listLoading" class="project-table" style="width: 100%">
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="name" label="用例名称" min-width="200"></el-table-column>
          <el-table-column prop="precondition" label="前置条件" min-width="220" show-overflow-tooltip></el-table-column>
          <el-table-column prop="steps" label="执行步骤" min-width="260" show-overflow-tooltip></el-table-column>
          <el-table-column prop="expected" label="预期结果" min-width="220" show-overflow-tooltip></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'">{{ scope.row.status || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="用例等级" width="100">
            <template #default="scope">
              <el-tag :type="levelTagType(scope.row.level)">{{ scope.row.level }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <el-button type="text" @click="viewCase(scope.row)" :disabled="detailLoading"><i class="fa fa-eye mr-1"></i>查看</el-button>
              <el-button type="text" @click="openEdit(scope.row)"><i class="fa fa-edit mr-1"></i>编辑</el-button>
              <el-popconfirm title="确定删除该用例吗？" @onConfirm="removeCase(scope.row)" :disabled="isDeleting(scope.row.id)">
                <el-button slot="reference" type="text" :loading="isDeleting(scope.row.id)"><i class="fa fa-trash mr-1"></i>删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <div class="pagination-wrap">
          <el-pagination
            background
            layout="total, prev, pager, next, jumper"
            :total="filteredCases.length"
            :page-size="pageSize"
            :current-page.sync="currentPage"
          />
        </div>
      </div>
    </el-card>

    <!-- 查看抽屉 -->
    <el-drawer
      :visible.sync="viewVisible"
      title="用例详情"
      size="60%"
      :close-on-press-escape="true"
      :close-on-click-modal="false"
      :modal="true"
      :modal-append-to-body="true"
      :append-to-body="true"
      class="case-detail-drawer">
      <div class="drawer-content" v-loading="detailLoading">
        <el-descriptions :column="1" border class="case-detail-descriptions">
          <el-descriptions-item label="用例名称" :span="1">
            <div class="detail-text">{{ currentCase.name || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="前置条件" :span="1">
            <div class="detail-text">{{ currentCase.precondition || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="执行步骤" :span="1">
            <div class="detail-text detail-steps">{{ currentCase.steps || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="预期结果" :span="1">
            <div class="detail-text">{{ currentCase.expected || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="用例等级" :span="1">
            <el-tag :type="levelTagType(currentCase.level)" size="medium">{{ currentCase.level || '-' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态" :span="1">
            <el-tag :type="currentCase.status === 'enabled' ? 'success' : 'info'" size="medium">
              {{ currentCase.status === 'enabled' ? '启用' : (currentCase.status === 'disabled' ? '禁用' : (currentCase.status || '-')) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="editForm.id ? '编辑用例' : '新建用例'" :visible.sync="editVisible" width="680px" append-to-body :close-on-click-modal="false">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="96px">
        <el-form-item label="用例名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入用例名称" ref="nameInput"></el-input>
        </el-form-item>
        <el-form-item label="前置条件" prop="precondition">
          <el-input type="textarea" :rows="2" v-model="editForm.precondition" placeholder="请输入前置条件"></el-input>
        </el-form-item>
        <el-form-item label="执行步骤" prop="steps">
          <el-input type="textarea" :rows="4" v-model="editForm.steps" placeholder="请分步描述执行步骤"></el-input>
        </el-form-item>
        <el-form-item label="预期结果" prop="expected">
          <el-input type="textarea" :rows="2" v-model="editForm.expected" placeholder="请输入预期结果"></el-input>
        </el-form-item>
        <el-form-item label="用例等级" prop="level">
          <el-select v-model="editForm.level" placeholder="请选择等级" style="width: 100%">
            <el-option label="P0" value="P0"></el-option>
            <el-option label="P1" value="P1"></el-option>
            <el-option label="P2" value="P2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="enabled"></el-option>
            <el-option label="禁用" value="disabled"></el-option>
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
        project_id: '',
        status: '',
        job_id: '',
        doc_id: ''
      },
      cases: [],
      currentPage: 1,
      pageSize: 10,
      viewVisible: false,
      editVisible: false,
      currentCase: {},
      editForm: {
        caseid: null,
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
        name: [{ required: true, message: '请输入用例名称', trigger: 'blur' }],
        precondition: [{ required: true, message: '请输入前置条件', trigger: 'blur' }],
        steps: [{ required: true, message: '请输入执行步骤', trigger: 'blur' }],
        expected: [{ required: true, message: '请输入预期结果', trigger: 'blur' }],
        level: [{ required: true, message: '请选择用例等级', trigger: 'change' }]
      }
    }
  },
  created () {
    // 如果路由中有 job_id 或 doc_id 参数，自动设置到搜索表单中
    if (this.$route.query.job_id) {
      // 如果有 job_id，可能需要通过接口获取对应的 doc_id 或 project_id
      // 这里先尝试直接使用 job_id 作为筛选条件
      this.searchForm.job_id = this.$route.query.job_id
    }
    if (this.$route.query.doc_id) {
      // 如果有 doc_id，可能需要通过接口获取对应的 project_id
      // 这里先尝试直接使用 doc_id 作为筛选条件
      this.searchForm.doc_id = this.$route.query.doc_id
    }
    this.fetchCases()
  },
  computed: {
    filteredCases () {
      // 列表已由后端过滤，这里直接返回
      return this.cases
    }
  },
  methods: {
    handleSearch () {
      this.currentPage = 1
      this.fetchCases()
    },
    resetSearch () {
      this.searchForm.project_id = ''
      this.searchForm.status = ''
      this.currentPage = 1
      this.fetchCases()
    },
    levelTagType (level) {
      if (level === 'P0') return 'danger'
      if (level === 'P1') return 'warning'
      return 'info'
    },
    viewCase (row) {
      this.viewVisible = true
      this.detailLoading = true
      this.currentCase = {}
      this.$axios.get('/api/testcase/detail', { params: { caseid: row.id } })
        .then(res => {
          const raw = res && res.data
          const data = raw && (raw.data || raw.detail || raw)
          const status = data.status != null ? String(data.status) : ''
          this.currentCase = {
            id: data.id != null ? data.id : (data.case_id != null ? data.case_id : data.caseid),
            name: data.title || data.name || data.case_name || '',
            precondition: data.precondition || data.pre || '',
            steps: data.test_steps || data.steps || data.step || '',
            expected: data.expected_result || data.expected || data.expect || '',
            level: data.priority != null ? String(data.priority) : (data.level != null ? String(data.level) : ''),
            status: status === 'active' ? 'enabled' : (status === 'inactive' ? 'disabled' : status)
          }
        })
        .catch(() => {
          this.$message.error('加载详情失败')
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    openEdit (row) {
      if (row) {
        const status = row.status != null ? String(row.status) : ''
        this.editForm = {
          id: row.id != null ? row.id : (row.case_id != null ? row.case_id : row.caseid) || null,
          name: row.name || row.title || row.case_name || '',
          precondition: row.precondition || row.pre || '',
          steps: row.steps || row.test_steps || row.step || '',
          expected: row.expected || row.expected_result || row.expect || '',
          level: row.level != null ? String(row.level) : (row.priority != null ? String(row.priority) : ''),
          status: status === 'active' ? 'enabled' : (status === 'inactive' ? 'disabled' : status)
        }
      } else {
        this.editForm = { id: null, name: '', precondition: '', steps: '', expected: '', level: '', status: '' }
      }
      this.editVisible = true
      this.$nextTick(() => {
        if (this.$refs.nameInput && this.$refs.nameInput.focus) {
          this.$refs.nameInput.focus()
        }
      })
    },
    submitEdit () {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return
        this.submitLoading = true
        this.$axios.post('/api/testcase/update', { ...this.editForm })
          .then(res => {
            this.$message.success('保存成功')
            this.editVisible = false
            this.fetchCases()
          })
          .catch(() => {
            this.$message.error('保存失败')
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
    removeCase (row) {
      this.$confirm('确定删除该用例吗？', '提示', { type: 'warning' })
        .then(() => {
          this.deletingIds.push(row.id)
          this.$axios.post('/api/testcase/delete', { caseid: row.id })
            .then(() => {
              this.$message.success('删除成功')
              this.fetchCases()
            })
            .catch(() => {
              this.$message.error('删除失败')
            })
            .finally(() => {
              this.deletingIds = this.deletingIds.filter(id => id !== row.id)
            })
        })
        .catch(() => {})
    },
    isDeleting (id) {
      return this.deletingIds.includes(id)
    },
    fetchCases () {
      this.listLoading = true
      const params = {
        project_id: this.searchForm.project_id || undefined,
        status: this.searchForm.status || undefined,
        job_id: this.searchForm.job_id || undefined,
        doc_id: this.searchForm.doc_id || undefined
      }
      // 移除 undefined 值
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key]
        }
      })
      this.$axios.get('/api/testcase/get', { params })
        .then(res => {
          const raw = res && res.data
          const arr = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          // 规范化列表项，保证表格与编辑表单字段一致
          this.cases = arr.map(it => {
            const status = it.status != null ? String(it.status) : ''
            return {
              id: it.id != null ? it.id : (it.case_id != null ? it.case_id : it.caseid),
              name: it.name || it.title || it.case_name || '',
              precondition: it.precondition || it.pre || '',
              steps: it.steps || it.test_steps || it.step || '',
              expected: it.expected || it.expected_result || it.expect || '',
              level: it.level != null ? String(it.level) : (it.priority != null ? String(it.priority) : ''),
              status: status === 'active' ? 'enabled' : (status === 'inactive' ? 'disabled' : status)
            }
          })
        })
        .catch(() => {
          this.$message.error('加载列表失败')
          this.cases = []
        })
        .finally(() => {
          this.listLoading = false
        })
    }
  }
}
</script>

<style scoped>
.testcase-container {
  flex: 1;
  min-width: 0;
}

.testcase-container >>> .el-card {
  margin-bottom: 0;
}

.testcase-container >>> .el-card__body {
  padding: 16px 20px;
}

.action-bar {
  margin: 16px 0 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 搜索容器样式 */
.search-container {
  margin: 16px 0;
  padding: 20px 24px;
  background: #f8f9fb;
  border-radius: 8px;
  border: none;
}

/* inline 表单样式 */
.form-inline {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.form-inline .el-form-item {
  margin-bottom: 0;
}

.form-inline .el-form-item__label {
  line-height: 40px;
  padding-right: 12px;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
}

.form-inline .el-input__inner,
.form-inline .el-select .el-input__inner {
  height: 40px;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.form-inline .el-input__inner:focus,
.form-inline .el-select .el-input__inner:focus {
  border-color: #409eff;
}

.form-inline .el-button {
  height: 40px;
  padding: 0 24px;
  border-radius: 6px;
  font-weight: 500;
}

/* 表格容器 */
.table-wrap {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
}

.project-table {
  width: 100%;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-size: 14px;
}

.project-table >>> .el-table__header {
  background: #f5f7fa;
}

.project-table >>> .el-table__header th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #ebeef5;
}

.project-table >>> .el-table__body td {
  font-size: 14px;
  color: #303133;
}

.project-table >>> .el-table__body tr:hover {
  background: #f5f7fa;
}

/* 分页样式 */
.pagination-wrap {
  margin-top: 16px;
  padding: 8px 0;
  text-align: right;
}

.mr-1 {
  margin-right: 6px;
}

/* 详情抽屉样式 */
.case-detail-drawer {
  z-index: 3000 !important;
}

.case-detail-drawer >>> .el-drawer {
  z-index: 3000;
}

.case-detail-drawer >>> .el-drawer__header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.case-detail-drawer >>> .el-drawer__title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.case-detail-drawer >>> .el-drawer__body {
  padding: 24px;
  overflow-y: auto;
}

.drawer-content {
  padding: 0;
  min-height: 200px;
}

/* 详情描述列表样式 */
.case-detail-descriptions {
  width: 100%;
}

.case-detail-descriptions >>> .el-descriptions__label {
  width: 120px;
  font-weight: 600;
  color: #606266;
  background-color: #f5f7fa;
  text-align: right;
  padding: 12px 16px;
}

.case-detail-descriptions >>> .el-descriptions__content {
  padding: 12px 16px;
  color: #303133;
}

.detail-text {
  line-height: 1.8;
  color: #303133;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
}

.detail-steps {
  white-space: pre-wrap;
  line-height: 2;
}
</style>
