<template>
  <div class="testcase-container">
    <!-- 顶部搜索卡片 -->
    <el-card class="mb-6">
      <div class="card-header">
        <h3 class="card-title">测试用例</h3>
        <el-button type="primary" @click="openEdit()" :disabled="submitLoading">
          <i class="fa fa-plus mr-1"></i>新建用例
        </el-button>
      </div>
      <div class="card-body">
        <el-form :inline="true" :model="searchForm" label-width="90px" class="search-form">
          <el-form-item label="项目ID">
            <el-input v-model="searchForm.project_id" placeholder="请输入项目ID" clearable style="width: 220px"></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 220px">
              <el-option label="全部" :value="''"></el-option>
              <el-option label="启用" value="enabled"></el-option>
              <el-option label="禁用" value="disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch" :loading="listLoading">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch" :disabled="listLoading">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 用例列表 -->
    <el-card>
      <div class="card-body1">
        <el-table :data="filteredCases" border stripe size="small" v-loading="listLoading">
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
        <div class="table-footer">
          <el-pagination
            background
            layout="prev, pager, next, jumper"
            :total="filteredCases.length"
            :page-size="pageSize"
            :current-page.sync="currentPage"
          />
        </div>
      </div>
    </el-card>

    <!-- 查看抽屉 -->
    <el-drawer :visible.sync="viewVisible" title="用例详情" size="50%">
      <div class="drawer-content" v-loading="detailLoading">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用例名称">{{ currentCase.name }}</el-descriptions-item>
          <el-descriptions-item label="前置条件">{{ currentCase.precondition }}</el-descriptions-item>
          <el-descriptions-item label="执行步骤">{{ currentCase.steps }}</el-descriptions-item>
          <el-descriptions-item label="预期结果">{{ currentCase.expected }}</el-descriptions-item>
          <el-descriptions-item label="用例等级">
            <el-tag :type="levelTagType(currentCase.level)">{{ currentCase.level }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentCase.status || '-' }}</el-descriptions-item>
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
        status: ''
      },
      cases: [],
      currentPage: 1,
      pageSize: 10,
      viewVisible: false,
      editVisible: false,
      currentCase: {},
      editForm: {
        id: null,
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
          const data = res && res.data ? res.data : {}
          this.currentCase = data || {}
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
        this.editForm = { ...row }
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
        status: this.searchForm.status || undefined
      }
      this.$axios.get('/api/testcase/get', { params })
        .then(res => {
          const list = res && res.data ? res.data : []
          this.cases = Array.isArray(list) ? list : []
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
  /* padding: 8px; */
}
.mb-6 {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.card-body {
  padding-top: 8px;
}
.card-body1 {
  padding-top: 8px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
}
.mr-1 {
  margin-right: 6px;
}
.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.drawer-content {
  padding-right: 16px;
}
</style>
