<template>
  <div class="project-main-content">
    <el-card>
      <div class="action-bar">
        <h3 class="card-title">需求文档</h3>
        <div style="flex:1"></div>
        <el-button type="primary" @click="openUploadDialog">上传文档</el-button>
      </div>
      <!-- 文档搜索栏 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" label-width="80px" class="search-form form-inline">
          <el-form-item label="项目">
            <el-select v-model="searchForm.project_id" placeholder="请选择项目" clearable style="width: 260px" filterable :loading="searchProjectsLoading" :popper-append-to-body="true">
              <el-option v-for="(p, idx) in searchProjectOptions" :key="(p.value != null ? p.value : idx) + ''" :label="p.label" :value="p.value">
                {{ p.label }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="文档名称">
            <el-input v-model="searchForm.doc_name" placeholder="请输入文档名称" clearable style="width: 420px"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch" :loading="listLoading">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch" :disabled="listLoading">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 上传文档弹窗 -->
    <el-dialog :visible.sync="uploadDialogVisible" title="上传项目文档" width="520px" :append-to-body="true" :close-on-click-modal="false">
      <el-form label-width="88px">
        <el-form-item label="选择项目">
          <el-select v-model="selectedProjectId" placeholder="请选择项目" style="width: 100%" filterable :loading="projectsLoading" value-key="value" :popper-append-to-body="true">
            <el-option v-for="(p, idx) in projectOptions" :key="(p.value != null ? p.value : idx) + ''" :label="p.label" :value="p.value">
              {{ p.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本名">
          <el-input v-model="docVersion" placeholder="请输入版本名" clearable style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            class="upload-block"
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :file-list="fileList"
            accept=".doc,.docx"
            :on-change="onFileChange"
            :before-upload="beforeSelectDoc"
            :on-exceed="onExceed"
            :limit="1"
          >
            <el-button type="primary">选择 .doc / .docx 文件</el-button>
            <div slot="tip" class="el-upload__tip">仅支持 .doc 或 .docx 文件，最大 10MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false" :disabled="submitting">取 消</el-button>
        <el-button type="primary" @click="submitDoc" :loading="submitting">提 交</el-button>
      </span>
    </el-dialog>
      <!-- 文档列表 -->
      <div class="table-wrap">
        <el-table :data="paginatedDocs" style="width: 100%;" class="project-table" v-loading="listLoading">
          <el-table-column prop="id" label="ID" width="100"></el-table-column>
          <el-table-column prop="project_name" label="项目名称" min-width="200"></el-table-column>
          <el-table-column prop="doc_name" label="需求文档" min-width="300" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.doc_name || scope.row.filename || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="version" label="版本" width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.version || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="350">
            <template slot-scope="scope">
              <el-button type="text" @click="viewDoc(scope.row)"><i class="fa fa-eye mr-1"></i>查看详情</el-button>
              <el-button type="text" @click="downloadDoc(scope.row)" :loading="isDownloading(scope.row.id)" :disabled="isDownloading(scope.row.id)"><i class="fa fa-download mr-1"></i>下载</el-button>
              <el-button type="text" @click="generateCases(scope.row)" :loading="isGenerating(scope.row.id)" :disabled="isGenerating(scope.row.id)"><i class="fa fa-magic mr-1"></i>生成用例</el-button>
              <el-popconfirm title="确定删除该文档吗？" @confirm="deleteDoc(scope.row)" :disabled="isDeleting(scope.row.id)">
                <el-button slot="reference" type="text" :loading="isDeleting(scope.row.id)"><i class="fa fa-trash mr-1"></i>删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <div class="pagination-wrap">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalDocs">
          </el-pagination>
        </div>
      </div>

    <el-dialog
      :visible.sync="docDialogVisible"
      width="60%"
      custom-class="top-dialog"
      :modal="true"
      :append-to-body="true"
      :modal-append-to-body="true"
      :destroy-on-close="false"
      :lock-scroll="false">
      <div slot="title" class="dialog-title">{{ docTitle }}</div>
      <div v-if="currentDoc" class="doc-content">
        <div class="doc-body" v-html="formattedDocContent"></div>
      </div>
      <div v-if="currentDoc && (docHasPrev || docHasNext || docTotalPages > 1)" class="doc-pagination">
        <el-button size="small" @click="prevDocPage" :disabled="!docHasPrev">上一页</el-button>
        <span class="page-info">{{ docCurrentPage }} / {{ docTotalPages }} (共{{ docTotalLength }}字)</span>
        <el-button size="small" @click="nextDocPage" :disabled="!docHasNext">下一页</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'projectManagement',
  data () {
    return {
      projects: [],
      filteredProjects: [],
      searchTitle: '',
      // 文档列表
      docs: [],
      listLoading: false,
      deletingIds: [],
      generatingIds: [],
      downloadingIds: [],
      // 分页相关
      currentPage: 1,
      pageSize: 10,
      totalDocs: 0,
      // 搜索表单
      searchForm: {
        project_id: '',
        doc_name: ''
      },
      docDialogVisible: false,
      currentDoc: '',
      currentDocId: null,
      docTitle: '',
      // 文档查看分页相关
      docCurrentPage: 1,
      docPageSize: 5000, // 每页字符数（后端默认5000）
      docTotalPages: 0,
      docTotalLength: 0,
      docHasNext: false,
      docHasPrev: false,
      activeProjectId: null,
      // 搜索用的项目选项
      searchProjectOptions: [],
      searchProjectsLoading: false,
      // 新增：上传文档弹窗与数据
      uploadDialogVisible: false,
      projectOptions: [],
      projectsLoading: false,
      selectedProjectId: null,
      docVersion: '',
      fileList: [],
      submitting: false
    }
  },
  computed: {
    formattedDocContent () {
      if (!this.currentDoc) return ''
      // 将换行符转换为HTML换行
      return this.currentDoc.replace(/\n/g, '<br>')
    },
    paginatedDocs () {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.docs.slice(start, end)
    }
  },
  created () {
    this.fetchProjects()
    this.fetchDocs()
    this.loadSearchProjectOptions()
  },
  methods: {
    fetchDocs () {
      this.listLoading = true
      // 构建搜索参数
      const params = {
        doc_type: 'prd'
      }
      if (this.searchForm.project_id) {
        params.project_id = this.searchForm.project_id
      }
      if (this.searchForm.doc_name) {
        params.file_name = this.searchForm.doc_name
      }
      this.$axios.get('/api/common/doc/get', { params })
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.data) ? raw.data : (raw && Array.isArray(raw.list) ? raw.list : []))
          // 规范化
          this.docs = list.map(it => ({
            id: it.id != null ? it.id : it.doc_id,
            project_name: it.project_name || it.project || '',
            doc_name: it.file_name || it.filename || it.doc_name || it.name || '',
            version: it.version || ''
          }))
          // 设置总数
          this.totalDocs = this.docs.length
        })
        .catch(() => {
          this.$message.error('加载文档列表失败')
          this.docs = []
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    isDeleting (id) {
      return this.deletingIds.includes(id)
    },
    isGenerating (id) {
      return this.generatingIds.includes(id)
    },
    isDownloading (id) {
      return this.downloadingIds.includes(id)
    },
    generateCases (row) {
      const docId = row && (row.id != null ? row.id : row.doc_id)
      if (!docId) return
      if (!this.generatingIds.includes(docId)) this.generatingIds.push(docId)
      this.$axios.post('/api/ai_job/run', { doc_id: docId })
        .then(() => {
          this.$message.success('已提交生成任务，正在跳转...')
          // 跳转到 aitestcase 页面，并传递 doc_id 参数
          this.$router.push({
            path: '/aitestcase',
            query: { doc_id: docId }
          })
        })
        .catch((err) => {
          this.$message.error('生成任务提交失败' + (err && err.message ? `：${err.message}` : ''))
        })
        .finally(() => {
          this.generatingIds = this.generatingIds.filter(x => x !== docId)
        })
    },
    viewDoc (row) {
      const id = row.id
      if (!id) return
      this.fetchDocDetail(id, 1, this.docPageSize)
    },
    fetchDocDetail (id, page, pageSize) {
      this.currentDocId = id
      this.$axios.get('/api/common/doc/detail', { params: { id, page, page_size: pageSize } })
        .then(res => {
          const data = res && res.data && res.data.data
          console.log(data)
          if (data) {
            this.docTitle = data.file_name || data.filename || ''
            this.currentDoc = data.page_content || data.file_content || ''
            // 更新分页信息
            this.docCurrentPage = data.page || 1
            this.docPageSize = data.page_size || 5000
            this.docTotalPages = data.total_pages || 0
            this.docTotalLength = data.total_length || 0
            this.docHasNext = data.has_next || false
            this.docHasPrev = data.has_prev || false
          } else {
            this.docTitle = ''
            this.currentDoc = ''
          }
          this.docDialogVisible = true
        })
        .catch(() => {
          this.$message.error('获取文档详情失败')
        })
    },
    deleteDoc (row) {
      const docId = row.id
      if (!docId) return
      this.deletingIds.push(docId)
      this.$axios.post('/api/common/doc/delete', { doc_id: docId })
        .then(() => {
          this.$message.success('删除成功')
          this.fetchDocs()
        })
        .catch(() => {
          this.$message.error('删除失败')
        })
        .finally(() => {
          this.deletingIds = this.deletingIds.filter(x => x !== docId)
        })
    },
    downloadDoc (row) {
      const docId = row.id
      const docName = row.doc_name || row.file_name || row.filename || '文档.docx'
      if (!docId) return
      this.downloadingIds.push(docId)
      this.$axios.get('/api/common/doc/download', { params: { id: docId }, responseType: 'blob' })
        .then(res => {
          const blob = new Blob([res.data])
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = docName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          this.$message.success('下载成功')
        })
        .catch(() => {
          this.$message.error('下载失败')
        })
        .finally(() => {
          this.downloadingIds = this.downloadingIds.filter(x => x !== docId)
        })
    },
    handleSearch () {
      this.fetchDocs()
    },
    resetSearch () {
      this.searchForm.project_id = ''
      this.searchForm.doc_name = ''
      this.fetchDocs()
    },
    fetchProjects () {
      this.$axios.get('/api/project/get')
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
    openUploadDialog () {
      this.uploadDialogVisible = true
      this.selectedProjectId = null
      this.docVersion = ''
      this.fileList = []
      // 每次打开都刷新一次项目列表，避免下拉为空或数据过期
      this.$nextTick(() => {
        this.loadProjectOptions()
      })
    },
    loadSearchProjectOptions () {
      this.searchProjectsLoading = true
      this.$axios.get('/api/project/get')
        .then(res => {
          const raw = res && res.data
          let list = []
          if (Array.isArray(raw)) {
            list = raw
          } else if (raw && Array.isArray(raw.data)) {
            list = raw.data
          } else if (raw && Array.isArray(raw.list)) {
            list = raw.list
          } else {
            list = []
          }
          this.searchProjectOptions = Array.isArray(list)
            ? list.map(it => {
              const id = it.id != null ? it.id : (it.project_id != null ? it.project_id : it.ID)
              const name = it.project_name || it.name || `项目${id || ''}`
              return { value: id, label: name }
            })
            : []
          this.searchProjectOptions = this.searchProjectOptions.filter(it => it && (it.value != null) && it.label)
        })
        .catch(() => {
          this.$message.error('加载项目列表失败')
        })
        .finally(() => {
          this.searchProjectsLoading = false
        })
    },
    loadProjectOptions () {
      this.projectsLoading = true
      this.$axios.get('/api/project/get')
        .then(res => {
          const raw = res && res.data
          // 调试输出，帮助确认真实结构
          console.log('[loadProjectOptions] raw:', raw)
          let list = []
          if (Array.isArray(raw)) {
            list = raw
          } else if (raw && Array.isArray(raw.data)) {
            list = raw.data
          } else if (raw && Array.isArray(raw.list)) {
            list = raw.list
          } else {
            list = []
          }
          console.log('[loadProjectOptions] normalized list:', list)
          this.projectOptions = Array.isArray(list)
            ? list.map(it => {
              const id = it.id != null ? it.id : (it.project_id != null ? it.project_id : it.ID)
              const name = it.project_name || it.name || `项目${id || ''}`
              return { value: id, label: name }
            })
            : []
          this.projectOptions = this.projectOptions.filter(it => it && (it.value != null) && it.label)
          console.log('[loadProjectOptions] options:', this.projectOptions)
        })
        .catch(() => {
          this.$message.error('加载项目列表失败')
        })
        .finally(() => {
          this.projectsLoading = false
        })
    },
    beforeSelectDoc (file) {
      // 这里只作为占位，真正校验在 onFileChange 里
      return false
    },
    onExceed () {
      this.$message.warning('一次只能上传一个文件')
    },
    onFileChange (file, fileList) {
      const isDoc = file.raw && /\.(doc|docx)$/i.test(file.raw.name)
      if (!isDoc) {
        this.$message.error('仅支持 .doc 或 .docx 格式文件')
        this.fileList = []
        return
      }
      // 简单大小限制 10MB
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB')
        this.fileList = []
        return
      }
      this.fileList = fileList.slice(-1)
    },
    submitDoc () {
      if (!this.selectedProjectId) {
        this.$message.warning('请选择项目')
        return
      }
      if (!this.fileList.length) {
        this.$message.warning('请先选择 .doc 文件')
        return
      }
      if (!this.docVersion) {
        this.$message.warning('请输入版本名')
        return
      }
      const form = new FormData()
      // selectedProjectId 可能是值对象 value
      const pid = typeof this.selectedProjectId === 'object' && this.selectedProjectId !== null ? this.selectedProjectId.value : this.selectedProjectId
      form.append('project_id', pid)
      form.append('file', this.fileList[0].raw)
      // 添加 doc_type 参数
      form.append('doc_type', 'prd')
      // 添加 version 参数
      form.append('version', this.docVersion)
      // 从文件名中提取文件类型
      const fileName = this.fileList[0].raw.name
      const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1)
      form.append('file_type', fileExt)
      this.submitting = true
      this.$axios.post('/api/common/doc/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(() => {
          this.$message.success('上传成功')
          this.uploadDialogVisible = false
          this.selectedProjectId = null
          this.docVersion = ''
          this.fileList = []
          this.loadProjectOptions()
          this.fetchDocs()
        })
        .catch(() => {
          this.$message.error('上传失败')
        })
        .finally(() => {
          this.submitting = false
        })
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
    },
    // 分页处理方法
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    // 文档查看翻页处理方法
    prevDocPage () {
      if (this.docHasPrev) {
        const docId = this.currentDocId
        const prevPage = this.docCurrentPage - 1
        this.fetchDocDetail(docId, prevPage, this.docPageSize)
      }
    },
    nextDocPage () {
      if (this.docHasNext) {
        const docId = this.currentDocId
        const nextPage = this.docCurrentPage + 1
        this.fetchDocDetail(docId, nextPage, this.docPageSize)
      }
    }
  }
}
</script>

<style scoped>
.project-main-content {
  flex: 1;
  min-width: 0;
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.project-main-content >>> .el-card {
  margin-bottom: 0;
}

.project-main-content >>> .el-card__body {
  padding: 16px 20px;
}

.action-bar {
  margin: 16px 0 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-container {
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
.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.row-highlight {
  animation: highlightRow 1.2s;
  background: #fffde7 !important;
}
@keyframes highlightRow {
  0% { background: #fffde7; }
  100% { background: none; }
}
/* removed project-form dialog styles as create-project feature is deleted */
.doc-content {
  /* width: 100%; */
  min-height: 300px;
  font-family: inherit;
  background: #ffffff;
  border: none;
  border-radius: 0;
  padding: 18px 20px;
  box-shadow: 0 4px 20px rgba(33,150,243,0.08);
}
.doc-body {
  font-size: 15px;
  line-height: 1.75;
  color: #333;
}
.doc-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px 0 0 0;
  margin-top: 16px;
  border-top: 1px solid #ebeef5;
}
.doc-pagination .page-info {
  font-size: 14px;
  color: #606266;
  min-width: 60px;
  text-align: center;
}
.doc-preview {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.content-body {
  background: #fff;
  border-radius: 0;
  padding: 0 !important;
  box-shadow: 0 4px 24px rgba(33,150,243,0.10);
  min-height: 300px;
  transition: box-shadow 0.2s;
}
.content-body:hover {
  box-shadow: 0 8px 32px rgba(33,150,243,0.16);
}
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

.pagination-wrap {
  margin-top: 16px;
  padding: 8px 0;
  text-align: right;
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
  border-radius: 0;
}
.desc-cell::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 0;
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

.upload-block {
  width: 100%;
}

/* 弹窗标题样式 */
.dialog-title {
  text-align: center;
  font-weight: bold;
  font-size: 18px;
  color: #303133;
  margin: 0;
  padding: 0;
}

/* 确保弹窗在遮罩层之上 */
.top-dialog {
  z-index: 9999 !important;
}
/* 弹窗直角样式 */
.top-dialog >>> .el-dialog {
  border-radius: 0 !important;
}

.top-dialog .el-dialog__wrapper {
  z-index: 9999 !important;
}

.top-dialog .v-modal {
  z-index: 9998 !important;
}

/* 强制弹窗内容显示 */
.top-dialog .el-dialog {
  z-index: 10000 !important;
  position: relative !important;
}

.top-dialog .el-dialog__body {
  z-index: 10001 !important;
  position: relative !important;
}

/* 防止弹窗导致页面变宽 */
body {
  overflow-y: scroll !important;
}

.top-dialog .el-dialog__wrapper {
  padding-right: 0 !important;
}
</style>

<style>
/* 全局样式：弹窗直角（因为弹窗是 append-to-body） */
.top-dialog .el-dialog {
  border-radius: 0 !important;
}
</style>
