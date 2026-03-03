<template>
  <div class="api-doc-container">
    <el-card>
      <div class="action-bar">
        <h3 class="card-title">接口文档</h3>
        <div style="flex:1"></div>
        <el-button type="primary" @click="openUploadDialog">上传文档</el-button>
      </div>
      <!-- 文档搜索栏 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" label-width="80px" class="search-form form-inline">
          <el-form-item label="项目ID">
            <el-input v-model="searchForm.project_id" placeholder="请输入项目ID" clearable style="width: 260px"></el-input>
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
    <el-dialog :visible.sync="uploadDialogVisible" title="上传接口文档" width="520px" :append-to-body="true" :close-on-click-modal="false">
      <el-form label-width="88px" ref="uploadFormRef">
        <el-form-item label="选择项目">
          <el-select v-model="uploadForm.project_id" placeholder="请选择项目" style="width: 100%" filterable :loading="projectsLoading" value-key="value" :popper-append-to-body="false">
            <el-option v-for="(p, idx) in projectOptions" :key="(p.value != null ? p.value : idx) + ''" :label="p.label" :value="p.value">
              {{ p.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="uploadForm.version" placeholder="请输入版本号" clearable></el-input>
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            class="upload-block"
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :file-list="fileList"
            accept=".html"
            :on-change="onFileChange"
            :before-upload="beforeSelectDoc"
            :on-exceed="onExceed"
            :limit="1"
          >
            <el-button type="primary">选择 .doc / .docx 文件</el-button>
            <div slot="tip" class="el-upload__tip">仅支持 .html 文件，最大 10MB</div>
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
      <el-table :data="paginatedDocs" stripe v-loading="listLoading" class="project-table" style="width: 100%">
        <el-table-column prop="id" label="ID" width="100"></el-table-column>
        <el-table-column prop="project_name" label="项目名称" min-width="200"></el-table-column>
        <el-table-column prop="doc_name" label="文档名称" min-width="220" show-overflow-tooltip></el-table-column>
        <el-table-column prop="version" label="版本号" width="120"></el-table-column>
        <el-table-column label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="text" @click="viewDoc(scope.row)"><i class="fa fa-eye mr-1"></i>查看接口</el-button>
            <el-button type="text" @click="parseDoc(scope.row)" :loading="isParsing(scope.row.id)" :disabled="isParsing(scope.row.id)"><i class="fa fa-cogs mr-1"></i>解析</el-button>
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

    <!-- 文档详情对话框（接口列表） -->
    <el-dialog
      :visible.sync="docDialogVisible"
      width="70%"
      custom-class="top-dialog"
      :modal="true"
      :append-to-body="true"
      :modal-append-to-body="true"
      :destroy-on-close="false"
      :lock-scroll="false">
      <div slot="title" class="dialog-title">{{ docTitle }}</div>
      <div class="doc-content">
        <el-table :data="interfaces" v-loading="interfaceLoading" stripe class="interface-table" style="width: 100%">
          <el-table-column prop="id" label="ID" width="60"></el-table-column>
          <el-table-column prop="api_name" label="接口名称" min-width="180" show-overflow-tooltip></el-table-column>
          <el-table-column prop="method" label="请求方法" width="100">
            <template slot-scope="scope">
              <el-tag :type="getMethodTagType(scope.row.method)" size="small">{{ scope.row.method || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="api_path" label="接口路径" min-width="250" show-overflow-tooltip></el-table-column>
          <el-table-column prop="request_params" label="请求参数" min-width="150" show-overflow-tooltip></el-table-column>
          <el-table-column prop="response_params" label="响应参数" min-width="150" show-overflow-tooltip></el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip></el-table-column>
        </el-table>
        <div v-if="!interfaceLoading && interfaces.length === 0" class="doc-empty">暂无接口数据</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ApiDocManagement',
  data () {
    return {
      // 搜索表单
      searchForm: {
        project_id: '',
        doc_name: ''
      },
      // 文档列表
      docs: [],
      listLoading: false,
      deletingIds: [],
      parsingIds: [],
      // 分页相关
      currentPage: 1,
      pageSize: 10,
      totalDocs: 0,
      // 上传弹窗
      uploadDialogVisible: false,
      uploadForm: {
        project_id: null,
        version: '',
        file: null
      },
      projectOptions: [],
      projectsLoading: false,
      fileList: [],
      submitting: false,
      // 文档详情（接口列表）
      docDialogVisible: false,
      interfaces: [],
      interfaceLoading: false,
      docTitle: ''
    }
  },
  computed: {
    paginatedDocs () {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.docs.slice(start, end)
    }
  },
  created () {
    this.fetchDocs()
    this.fetchProjects()
  },
  methods: {
    isDeleting (id) {
      return this.deletingIds.includes(id)
    },
    isParsing (id) {
      return this.parsingIds.includes(id)
    },
    fetchDocs () {
      this.listLoading = true
      const params = {}
      if (this.searchForm.project_id) {
        params.project_id = this.searchForm.project_id
      }
      if (this.searchForm.doc_name) {
        params.doc_name = this.searchForm.doc_name
      }
      this.$axios.get('/api/api_doc/get', { params })
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          this.docs = list.map(it => ({
            id: it.id != null ? it.id : it.api_doc_id,
            project_name: it.project_name || it.project || '',
            doc_name: it.doc_name || it.filename || it.name || '',
            version: it.version || ''
          }))
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
    handleSearch () {
      this.currentPage = 1
      this.fetchDocs()
    },
    resetSearch () {
      this.searchForm.project_id = ''
      this.searchForm.doc_name = ''
      this.currentPage = 1
      this.fetchDocs()
    },
    openUploadDialog () {
      this.uploadDialogVisible = true
      this.uploadForm.project_id = null
      this.uploadForm.version = ''
      this.fileList = []
      this.$nextTick(() => {
        this.loadProjectOptions()
      })
    },
    fetchProjects () {
      this.projectsLoading = true
      this.$axios.get('/api/project/get')
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          this.projectOptions = Array.isArray(list)
            ? list.map(it => {
              const id = it.id != null ? it.id : (it.project_id != null ? it.project_id : it.ID)
              const name = it.project_name || it.name || `项目${id || ''}`
              return { value: id, label: name }
            })
            : []
          this.projectOptions = this.projectOptions.filter(it => it && (it.value != null) && it.label)
        })
        .catch(() => {
          this.$message.error('加载项目列表失败')
          this.projectOptions = []
        })
        .finally(() => {
          this.projectsLoading = false
        })
    },
    loadProjectOptions () {
      this.projectsLoading = true
      this.$axios.get('/api/project/get')
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          this.projectOptions = Array.isArray(list)
            ? list.map(it => {
              const id = it.id != null ? it.id : (it.project_id != null ? it.project_id : it.ID)
              const name = it.project_name || it.name || `项目${id || ''}`
              return { value: id, label: name }
            })
            : []
          this.projectOptions = this.projectOptions.filter(it => it && (it.value != null) && it.label)
        })
        .catch(() => {
          this.$message.error('加载项目列表失败')
          this.projectOptions = []
        })
        .finally(() => {
          this.projectsLoading = false
        })
    },
    beforeSelectDoc (file) {
      return false
    },
    onExceed () {
      this.$message.warning('一次只能上传一个文件')
    },
    onFileChange (file, fileList) {
      const isHtml = file.raw && /\.html$/i.test(file.raw.name)
      if (!isHtml) {
        this.$message.error('仅支持 .html 格式文件')
        this.fileList = []
        return
      }
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB')
        this.fileList = []
        return
      }
      this.uploadForm.file = file.raw
      this.fileList = fileList.slice(-1)
    },
    submitDoc () {
      if (!this.uploadForm.project_id) {
        this.$message.warning('请选择项目')
        return
      }
      if (!this.fileList.length) {
        this.$message.warning('请先选择文件')
        return
      }
      const form = new FormData()
      const pid = typeof this.uploadForm.project_id === 'object' && this.uploadForm.project_id !== null
        ? this.uploadForm.project_id.value
        : this.uploadForm.project_id
      form.append('project_id', pid)
      form.append('version', this.uploadForm.version || '')
      form.append('file', this.uploadForm.file)
      this.submitting = true
      this.$axios.post('/api/api_doc/create', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(() => {
          this.$message.success('上传成功')
          this.uploadDialogVisible = false
          this.uploadForm.project_id = null
          this.uploadForm.version = ''
          this.fileList = []
          this.fetchDocs()
        })
        .catch(() => {
          this.$message.error('上传失败')
        })
        .finally(() => {
          this.submitting = false
        })
    },
    viewDoc (row) {
      const id = row.id
      if (!id) return
      this.docTitle = row.doc_name || row.filename || '接口列表'
      this.interfaceLoading = true
      this.interfaces = []
      this.$axios.get('/api/api_interface/get', { params: { api_doc_id: id } })
        .then(res => {
          console.log('接口列表响应:', res)
          const raw = res && res.data
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          // 根据后端返回格式映射字段
          this.interfaces = list.map(it => ({
            id: it.id,
            api_name: it.api_name || '',
            api_path: it.api_path || '',
            method: it.method || 'GET',
            request_params: it.request_params || '',
            response_params: it.response_params || '',
            remark: it.remark || ''
          }))
          console.log('接口列表:', this.interfaces)
          this.docDialogVisible = true
        })
        .catch(err => {
          console.error('获取接口列表失败:', err)
          const errMsg = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message
          this.$message.error('获取接口列表失败: ' + errMsg)
          this.interfaces = []
        })
        .finally(() => {
          this.interfaceLoading = false
        })
    },
    parseDoc (row) {
      const id = row.id
      if (!id) return
      if (!this.parsingIds.includes(id)) this.parsingIds.push(id)
      this.$axios.post('/api/api_doc/parse', { doc_id: id })
        .then(() => {
          this.$message.success('文档解析成功')
          this.parsingIds = this.parsingIds.filter(x => x !== id)
          this.fetchDocs()
        })
        .catch(() => {
          this.$message.error('文档解析失败')
          this.parsingIds = this.parsingIds.filter(x => x !== id)
        })
        .finally(() => {
          this.parsingIds = this.parsingIds.filter(x => x !== id)
        })
    },
    deleteDoc (row) {
      const id = row.id
      if (!id) return
      this.deletingIds.push(id)
      this.$axios.post('/api/api_doc/delete', { doc_id: id })
        .then(() => {
          this.$message.success('删除成功')
          this.fetchDocs()
        })
        .catch(() => {
          this.$message.error('删除失败')
        })
        .finally(() => {
          this.deletingIds = this.deletingIds.filter(x => x !== id)
        })
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    getMethodTagType (method) {
      const m = (method || '').toUpperCase()
      if (m === 'GET') return 'success'
      if (m === 'POST') return 'primary'
      if (m === 'PUT') return 'warning'
      if (m === 'DELETE') return 'danger'
      return 'info'
    }
  }
}
</script>

<style scoped>
.api-doc-container {
  flex: 1;
  min-width: 0;
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.api-doc-container >>> .el-card {
  margin-bottom: 0;
}

.api-doc-container >>> .el-card__body {
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

.mr-1 {
  margin-right: 6px;
}

/* 表格容器 */
.table-wrap {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
}

/* 统一表格样式 */
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

/* 弹窗直角样式 */
.top-dialog {
  z-index: 9999 !important;
}

.top-dialog >>> .el-dialog {
  border-radius: 0 !important;
}

.doc-content {
  min-height: 200px;
  font-family: inherit;
  background: #ffffff;
  border: none;
  border-radius: 0;
  padding: 0;
}

/* 接口表格样式 */
.interface-table {
  width: 100%;
  border-radius: 0;
  overflow: hidden;
  font-size: 14px;
}

.interface-table >>> .el-table__header {
  background: #f5f7fa;
}

.interface-table >>> .el-table__header th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #ebeef5;
}

.interface-table >>> .el-table__body td {
  font-size: 14px;
  color: #303133;
}

.interface-table >>> .el-table__body tr:hover {
  background: #f5f7fa;
}

.doc-empty {
  text-align: center;
  color: #909399;
  padding: 60px 20px;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
