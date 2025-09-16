<template>
  <div class="project-management-container">
    <el-card class="mb-6">
        <div class="card-header">
          <h3 class="card-title">需求文档管理</h3>
          <el-button type="primary" @click="createProjectDialogVisible = true">
            <i class="fa fa-plus mr-1"></i>新建需求
          </el-button>
        </div>
        <div class="card-body">
          <el-table
            :data="projects"
            border
            stripe
            size="small"
            @row-click="handleRowClick"
          >
            <el-table-column prop="name" label="文档名称"></el-table-column>
            <el-table-column prop="description" label="文档内容"></el-table-column>
            <el-table-column prop="created_by.username" label="创建人"></el-table-column>
            <el-table-column prop="created_at" label="创建时间">
              <template #default="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="text" size="small" @click="uploadDocument(scope.row)">
                  <i class="fa fa-upload mr-1"></i>上传需求文档
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <!-- 新建项目对话框 -->
      <el-dialog :visible.sync="createProjectDialogVisible" title="新建项目">
        <el-form :model="newProject" :rules="projectRules" ref="projectForm" label-width="120px">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="newProject.name"></el-input>
          </el-form-item>
          <el-form-item label="项目描述" prop="description">
            <el-input type="textarea" v-model="newProject.description" :rows="4"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="createProjectDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="createProject">保存</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 上传文档对话框 -->
      <el-dialog :visible.sync="uploadDialogVisible" title="上传需求文档">
        <el-form :model="uploadForm" ref="uploadFormRef" label-width="120px">
          <el-form-item label="项目名称">
            <el-input v-model="currentProject.name" disabled></el-input>
          </el-form-item>
          <el-form-item label="文档标题" prop="title">
            <el-input v-model="uploadForm.title"></el-input>
          </el-form-item>
          <el-form-item label="需求文档" prop="file">
            <el-upload
              class="upload-demo"
              drag
              :action="uploadUrl"
              :headers="headers"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              ref="uploadRef"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">点击或拖拽文件到这里上传</div>
              <div class="el-upload__tip" slot="tip">支持docx格式文件</div>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="uploadDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitUpload">上传</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 文档内容查看对话框 -->
      <el-dialog :visible.sync="documentViewDialogVisible" title="需求文档内容">
        <div class="document-content">
          <h3 class="document-title">{{ currentDocument.title }}</h3>
          <div class="document-body">
            <pre v-for="(section, index) in documentSections" :key="index" class="document-section">
  {{ section.content }}</pre>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="documentViewDialogVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
</template>
<script>
export default {
  name: 'docManagement',
  data () {
    return {
      projects: [],
      newProject: {
        name: '',
        description: ''
      },
      projectRules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ]
      },
      createProjectDialogVisible: false,
      uploadDialogVisible: false,
      documentViewDialogVisible: false,
      currentProject: {},
      uploadForm: {
        title: '',
        file: null
      },
      currentDocument: {},
      documentSections: [],
      uploadUrl: '/api/documents/',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    }
  },
  mounted () {
    this.fetchProjects()
  },
  methods: {
    // 获取项目列表
    async fetchProjects () {
      try {
        const response = await this.$axios.get('/api/projects/')
        this.projects = response.data
      } catch (error) {
        this.$message.error('获取项目列表失败')
        console.error(error)
      }
    },
    // 创建项目
    async createProject () {
      this.$refs.projectForm.validate(valid => {
        if (valid) {
          this.$axios.post('/api/projects/', this.newProject)
            .then(() => {
              this.$message.success('项目创建成功')
              this.createProjectDialogVisible = false
              this.newProject = { name: '', description: '' }
              this.fetchProjects()
            })
            .catch(error => {
              this.$message.error('项目创建失败')
              console.error(error)
            })
        }
      })
    },
    // 上传文档
    uploadDocument (project) {
      this.currentProject = project
      this.uploadForm.title = `${project.name}需求文档`
      this.uploadDialogVisible = true
    },
    // 上传前检查
    beforeUpload (file) {
      const isDocx = file.name.endsWith('.docx')
      if (!isDocx) {
        this.$message.error('请上传docx格式的文档')
      }
      return isDocx
    },
    // 处理上传成功
    handleUploadSuccess (response, file, fileList) {
      this.$message.success('文档上传成功')
      this.uploadDialogVisible = false
      this.fetchProjects()
    },
    // 处理上传失败
    handleUploadError (error, file, fileList) {
      this.$message.error('文档上传失败')
      console.error(error)
    },
    // 提交上传
    submitUpload () {
      this.$refs.uploadRef.submit()
    },
    // 查看文档内容
    viewDocument (document) {
      this.currentDocument = document
      this.fetchDocumentSections(document.id)
      this.documentViewDialogVisible = true
    },
    // 获取文档段落
    async fetchDocumentSections (documentId) {
      try {
        const response = await this.$axios.get(`/api/documents/${documentId}/sections/`)
        this.documentSections = response.data
      } catch (error) {
        this.$message.error('获取文档内容失败')
        console.error(error)
      }
    },
    // 格式化日期
    formatDate (dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    // 行点击事件
    handleRowClick (row) {
      // 获取该项目的文档列表
      this.$axios.get(`/api/documents/?project=${row.id}`)
        .then(response => {
          if (response.data.length > 0) {
            this.viewDocument(response.data[0])
          } else {
            this.$message.info('该项目暂无需求文档')
          }
        })
        .catch(error => {
          this.$message.error('获取文档列表失败')
          console.error(error)
        })
    }
  }
}
</script>
<style scoped>
  .project-management-container {
    padding: 20px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .card-title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
  }
  .document-content {
    padding: 20px;
    max-height: 600px;
    overflow-y: auto;
  }
  .document-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
  }
  .document-section {
    white-space: pre-wrap;
    margin-bottom: 15px;
    padding: 10px;
    border-left: 3px solid #409EFF;
    background-color: #f9fafc;
    font-family: 'Source Code Pro', monospace;
    font-size: 14px;
  }
</style>
