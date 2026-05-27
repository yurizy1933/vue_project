<template>
  <div class="project-container unified-container">
    <!-- 顶部卡片 -->
    <el-card class="mb-6 unified-main-card">
      <div class="card-header unified-action-bar">
        <h3 class="card-title unified-card-title">项目管理</h3>
        <el-button type="primary" @click="openCreate()" :disabled="submitLoading">
          <i class="fa fa-plus mr-1"></i>新增项目
        </el-button>
      </div>

      <!-- 项目列表 -->
      <div class="table-wrap unified-table-wrap">
        <el-table :data="projects" stripe v-loading="listLoading" class="project-table unified-table" style="width: 100%">
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="project_name" label="项目名称" min-width="180"></el-table-column>
          <el-table-column prop="description" label="项目描述" min-width="250" show-overflow-tooltip></el-table-column>
          <el-table-column prop="owner" label="项目负责人" width="120"></el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="text" @click="openEdit(scope.row)"><i class="fa fa-edit mr-1"></i>编辑</el-button>
              <el-popconfirm title="确定删除该项目吗？" @confirm="removeProject(scope.row)" :disabled="isDeleting(scope.row.id)">
                <el-button slot="reference" type="text" :loading="isDeleting(scope.row.id)"><i class="fa fa-trash mr-1"></i>删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap unified-pagination-wrap">
          <el-pagination
            background
            layout="prev, pager, next, jumper"
            :total="projects.length"
            :page-size="pageSize"
            :current-page.sync="currentPage"
          />
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="editForm.id ? '编辑项目' : '新增项目'" :visible.sync="editVisible" width="600px" append-to-body :close-on-click-modal="false">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="项目名称" prop="project_name">
          <el-input v-model="editForm.project_name" placeholder="请输入项目名称" ref="nameInput" :disabled="!!editForm.id"></el-input>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input type="textarea" :rows="4" v-model="editForm.description" placeholder="请输入项目描述"></el-input>
        </el-form-item>
        <el-form-item label="项目负责人" prop="owner">
          <el-input v-model="editForm.owner" placeholder="请输入项目负责人"></el-input>
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
  name: 'projectManagement',
  data () {
    return {
      projects: [],
      currentPage: 1,
      pageSize: 10,
      editVisible: false,
      editForm: {
        id: null,
        project_name: '',
        description: '',
        owner: ''
      },
      listLoading: false,
      submitLoading: false,
      deletingIds: [],
      rules: {
        project_name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
        owner: [{ required: true, message: '请输入项目负责人', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.fetchProjects()
  },
  methods: {
    openCreate () {
      this.editForm = { id: null, project_name: '', description: '', owner: '' }
      this.editVisible = true
      this.$nextTick(() => {
        if (this.$refs.nameInput && this.$refs.nameInput.focus) {
          this.$refs.nameInput.focus()
        }
      })
    },
    openEdit (row) {
      this.editForm = { ...row }
      this.editVisible = true
    },
    submitEdit () {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return
        this.submitLoading = true
        const apiUrl = this.editForm.id ? '/api/project/update' : '/api/project/create'
        // 构建请求参数，编辑时传递project_id
        const params = {
          project_name: this.editForm.project_name,
          description: this.editForm.description,
          owner: this.editForm.owner
        }
        if (this.editForm.id) {
          params.project_id = this.editForm.id
        }
        this.$axios.post(apiUrl, params)
          .then(res => {
            this.$message.success(this.editForm.id ? '更新成功' : '创建成功')
            this.editVisible = false
            this.fetchProjects()
          })
          .catch(() => {
            this.$message.error('操作失败')
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
    removeProject (row) {
      this.deletingIds.push(row.id)
      this.$axios.post('/api/project/delete', { project_id: row.id })
        .then(() => {
          this.$message.success('删除成功')
          this.fetchProjects()
        })
        .catch(() => {
          this.$message.error('删除失败')
        })
        .finally(() => {
          this.deletingIds = this.deletingIds.filter(id => id !== row.id)
        })
    },
    isDeleting (id) {
      return this.deletingIds.includes(id)
    },
    fetchProjects () {
      this.listLoading = true
      this.$axios.get('/api/project/get')
        .then(res => {
          const list = res && res.data ? res.data : []
          this.projects = Array.isArray(list) ? list : []
        })
        .catch(() => {
          this.$message.error('加载项目列表失败')
          this.projects = []
        })
        .finally(() => {
          this.listLoading = false
        })
    }
  }
}
</script>

<style scoped>
.project-container {
  /* 使用 unified-container 的统一页面与表格布局 */
}

.project-container >>> .el-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.project-container >>> .el-card__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 20px 20px;
}

.project-container >>> .unified-table-wrap {
  flex: 1 1 auto;
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.mr-1 {
  margin-right: 6px;
}
</style>
