<template>
  <div class="project-main-content">
    <el-card>
      <div class="action-bar">
        <el-input
          v-model="searchTitle"
          placeholder="按项目标题搜索"
          class="search-input"
          clearable
          @input="filterProjects"
        />
        <div style="flex:1"></div>
        <el-button type="primary" @click="dialogVisible = true">创建项目</el-button>
      </div>

      <!-- 项目列表 -->
      <el-table :data="filteredProjects" style="width: 100%; margin-top: 20px;" class="project-table">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <div :data-project-id="scope.row.id"></div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="项目名称" width="200">
          <template slot-scope="scope">
            <span class="cell-content">{{ scope.row.name || 'NO DATA' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" min-width="200" max-width="300">
          <template slot-scope="scope">
            <div class="cell-content desc-cell ellipsis-cell">
              {{ scope.row.desc || 'NO DATA' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="需求文档" min-width="400" max-width="800">
          <template slot-scope="scope">
            <span class="cell-content doc-cell ellipsis-cell">{{ scope.row.docContent ? scope.row.docContent : '无文档' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-upload
              :action="uploadUrl(scope.row.id)"
              :show-file-list="false"
              :on-success="(res) => handleUploadSuccess(res, scope.row.id)"
              :before-upload="beforeUploadTable"
              accept=".docx"
            >
              <a class="action-link upload-link" href="javascript:void(0)">
                <i class="el-icon-upload"></i> 上传文档
              </a>
            </el-upload>
            <a class="action-link view-link" href="javascript:void(0)" @click="showDoc(scope.row)" :class="{disabled: !scope.row.docContent}" :style="!scope.row.docContent ? 'pointer-events:none;color:#bbb;' : ''">
              <i class="el-icon-document"></i> 查看文档
            </a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建项目弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="创建项目" width="500px" :modal-append-to-body="false" :append-to-body="true" custom-class="project-dialog">
      <el-form :model="projectForm" :rules="rules" ref="projectForm" label-width="80px" class="project-form">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="projectForm.desc" placeholder="请输入项目描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createProject">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="docDialogVisible" width="60%" title="需求文档内容"  custom-class="top-dialog"
  :modal-append-to-body="false"
  :append-to-body="true">
      <pre v-if="currentDoc" class="doc-content">{{ currentDoc }}</pre>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'projectManagement',
  data () {
    return {
      dialogVisible: false,
      projectForm: { name: '', desc: '' },
      rules: {
        name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
      },
      projects: [],
      filteredProjects: [],
      searchTitle: '',
      docDialogVisible: false,
      currentDoc: '',
      activeProjectId: null
    }
  },
  created () {
    this.fetchProjects()
  },
  methods: {
    fetchProjects () {
      this.$axios.get('/api/get/projects')
        .then(res => {
          this.projects = res.data
          this.filteredProjects = res.data
        })
        .catch(err => {
          this.$message.error('获取项目列表失败: ' + ((err.response && err.response.data && err.response.data.message) || err.message || '未知错误'))
          console.log(err)
        })
    },
    filterProjects () {
      const keyword = this.searchTitle.trim().toLowerCase()
      if (!keyword) {
        this.filteredProjects = this.projects
      } else {
        this.filteredProjects = this.projects.filter(p => p.name.toLowerCase().includes(keyword))
      }
    },
    scrollToProject (id) {
      this.$nextTick(() => {
        const row = document.querySelector(`[data-project-id='${id}']`)
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' })
          row.classList.add('row-highlight')
          setTimeout(() => row.classList.remove('row-highlight'), 1200)
        }
      })
    },
    createProject () {
      this.$refs.projectForm.validate(valid => {
        if (!valid) return
        this.$axios.post('/api/create/project', this.projectForm)
          .then(() => {
            this.$message.success('项目创建成功')
            this.projectForm = { name: '', desc: '' }
            this.dialogVisible = false
            this.fetchProjects()
          })
          .catch(err => {
            this.$message.error('创建项目失败: ' + ((err.response && err.response.data && err.response.data.message) || err.message || '未知错误'))
          })
      })
    },
    showDoc (row) {
      this.currentDoc = row.docContent
      this.docDialogVisible = true
    },
    uploadUrl (projectId) {
      return `/api/projects/${projectId}/upload-doc`
    },
    beforeUploadTable (file) {
      if (!file.name.endsWith('.docx')) {
        this.$message.error('只支持docx格式')
        return false
      }
      return true
    },
    handleUploadSuccess (response, projectId) {
      this.$message.success('上传成功')
      this.fetchProjects()
    }
  }
}
</script>

<style scoped>
.project-main-content {
  flex: 1;
  /* margin: 32px 32px 32px 24px; */
  min-width: 0;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.action-bar {
  margin: 16px 0 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-input {
  width: 260px;
}
.row-highlight {
  animation: highlightRow 1.2s;
  background: #fffde7 !important;
}
@keyframes highlightRow {
  0% { background: #fffde7; }
  100% { background: none; }
}
.project-form {
  margin-bottom: 0;
  background: #f8fafc;
  padding: 16px 24px 0 0;
  border-radius: 8px;
}
.el-dialog__body {
  padding: 20px 20px 20px 20px;
}
.doc-content {
  /* width: 100%; */
  min-height: 300px;
  font-family: inherit;
  font-size: 15px;
  white-space: pre-wrap;
  background: #f8fafc;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
}
.doc-preview {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.content-body {
  background: #fff;
  border-radius: 16px;
  padding: 0 !important;
  box-shadow: 0 4px 24px rgba(33,150,243,0.10);
  min-height: 300px;
  transition: box-shadow 0.2s;
}
.content-body:hover {
  box-shadow: 0 8px 32px rgba(33,150,243,0.16);
}
.project-dialog {
  z-index: 3000 !important;
}
.el-dialog__wrapper {
  z-index: 3000 !important;
}
.v-modal {
  z-index: 2999 !important;
}
.project-table {
  min-width: 800px;
  max-width: 1200px;
  min-height: 350px;
  max-height: 1200px;
}
.cell-content {
  word-break: break-word;
  overflow-wrap: break-word;
}
.desc-cell {
  max-width: 600px;
  overflow: auto;
  white-space: pre-wrap;
  max-height: 100px;
}
.desc-cell::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.desc-cell::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.desc-cell::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.desc-cell::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
.ellipsis-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
}
.doc-cell {
  max-width: 800px;
}
.action-link {
  margin-right: 16px;
  color: #ACB6E5;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}
.action-link:last-child {
  margin-right: 0;
}
.action-link i {
  margin-right: 4px;
  font-size: 16px;
}
.action-link:hover {
  color: #7b8db0;
  text-decoration: underline;
}
.view-link.disabled {
  color: #bbb !important;
  cursor: not-allowed;
  text-decoration: none;
}
</style>
