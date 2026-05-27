<template>
  <div class="doc-container unified-container">
    <el-card class="unified-main-card">
      <div class="action-bar unified-action-bar">
        <h3 class="card-title unified-card-title">文档管理</h3>
        <div style="flex:1"></div>
        <el-button type="primary" @click="openUploadDialog">上传文档</el-button>
      </div>

      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" class="unified-fill-tabs" @tab-click="onTabClick">
        <el-tab-pane label="需求文档" name="prd">
          <!-- 搜索栏 -->
          <div class="search-container unified-search-container">
            <el-form :inline="true" :model="searchForm" label-width="80px" class="unified-form-inline">
              <el-form-item label="项目">
                <el-select v-model="searchForm.project_id" placeholder="请选择项目" clearable filterable
                  :loading="searchProjectsLoading" :popper-append-to-body="true" style="width: 220px">
                  <el-option v-for="(p, idx) in searchProjectOptions" :key="idx" :label="p.label" :value="p.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="文档名称">
                <el-input v-model="searchForm.doc_name" placeholder="请输入文档名称" clearable style="width: 280px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch" :loading="listLoading">查询</el-button>
                <el-button @click="resetSearch" :disabled="listLoading">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 表格 -->
          <div class="table-wrap unified-table-wrap">
            <el-table :data="paginatedDocs" stripe v-loading="listLoading" class="project-table unified-table" style="width: 100%">
              <el-table-column type="index" width="60" label="#" />
              <el-table-column prop="project_name" label="项目名称" min-width="150" />
              <el-table-column prop="doc_name" label="需求文档" min-width="220" show-overflow-tooltip />
              <el-table-column prop="version" label="版本" width="120" />
              <el-table-column label="操作" width="320">
                <template #default="scope">
                  <el-button type="text" @click="viewPrdDoc(scope.row)"><i class="fa fa-eye mr-1"></i>查看</el-button>
                  <el-button type="text" @click="downloadDoc(scope.row)" :loading="isDownloading(scope.row.id)" :disabled="isDownloading(scope.row.id)"><i class="fa fa-download mr-1"></i>下载</el-button>
                  <el-button type="text" @click="generatePrdCases(scope.row)" :loading="isGenerating(scope.row.id)" :disabled="isGenerating(scope.row.id)"><i class="fa fa-magic mr-1"></i>生成用例</el-button>
                  <el-popconfirm title="确定删除该文档吗？" @confirm="deleteDoc(scope.row)" :disabled="isDeleting(scope.row.id)">
                    <el-button slot="reference" type="text" :loading="isDeleting(scope.row.id)"><i class="fa fa-trash mr-1"></i>删除</el-button>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrap unified-pagination-wrap">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalDocs"
                :page-size="pageSize"
                :current-page.sync="currentPage"
                :page-sizes="[10, 20, 50, 100]"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="接口文档" name="api">
          <!-- 搜索栏 -->
          <div class="search-container unified-search-container">
            <el-form :inline="true" :model="searchForm" label-width="80px" class="unified-form-inline">
              <el-form-item label="项目">
                <el-select v-model="searchForm.project_id" placeholder="请选择项目" clearable filterable
                  :loading="searchProjectsLoading" :popper-append-to-body="true" style="width: 220px">
                  <el-option v-for="(p, idx) in searchProjectOptions" :key="idx" :label="p.label" :value="p.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="文档名称">
                <el-input v-model="searchForm.doc_name" placeholder="请输入文档名称" clearable style="width: 280px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch" :loading="listLoading">查询</el-button>
                <el-button @click="resetSearch" :disabled="listLoading">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 表格 -->
          <div class="table-wrap unified-table-wrap">
            <el-table :data="paginatedDocs" stripe v-loading="listLoading" class="project-table unified-table" style="width: 100%">
              <el-table-column type="index" width="60" label="#" />
              <el-table-column prop="project_name" label="项目名称" min-width="140" />
              <el-table-column prop="doc_name" label="文档名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="version" label="版本号" width="120" />
              <el-table-column label="操作" width="380">
                <template #default="scope">
                  <el-button type="text" @click="viewApiDoc(scope.row)"><i class="fa fa-eye mr-1"></i>查看接口</el-button>
                  <el-button type="text" @click="downloadDoc(scope.row)" :loading="isDownloading(scope.row.id)" :disabled="isDownloading(scope.row.id)"><i class="fa fa-download mr-1"></i>下载</el-button>
                  <el-button type="text" @click="parseDoc(scope.row)" :loading="isParsing(scope.row.id)" :disabled="isParsing(scope.row.id)"><i class="fa fa-cogs mr-1"></i>解析</el-button>
                  <el-button type="text" @click="openApiGenerateDialog(scope.row)" :disabled="isGenerating(scope.row.id)"><i class="fa fa-magic mr-1"></i>生成用例</el-button>
                  <el-popconfirm title="确定删除该文档吗？" @confirm="deleteDoc(scope.row)" :disabled="isDeleting(scope.row.id)">
                    <el-button slot="reference" type="text" :loading="isDeleting(scope.row.id)"><i class="fa fa-trash mr-1"></i>删除</el-button>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrap unified-pagination-wrap">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalDocs"
                :page-size="pageSize"
                :current-page.sync="currentPage"
                :page-sizes="[10, 20, 50, 100]"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 上传弹窗 -->
    <el-dialog :visible.sync="uploadDialogVisible" :title="activeTab === 'api' ? '上传接口文档' : '上传需求文档'"
      width="520px" :append-to-body="true" :close-on-click-modal="false">
      <el-form label-width="88px">
        <el-form-item label="选择项目">
          <el-select v-model="uploadSelectedProject" placeholder="请选择项目" style="width: 100%" filterable
            :loading="projectsLoading" value-key="value" :popper-append-to-body="true">
            <el-option v-for="(p, idx) in uploadProjectOptions" :key="idx" :label="p.label" :value="p.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本名">
          <el-input v-model="uploadVersion" placeholder="请输入版本名" clearable />
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload class="upload-block" action="#" :auto-upload="false" :show-file-list="true"
            :file-list="fileList" :accept="activeTab === 'api' ? '.html' : '.doc,.docx'"
            :on-change="onFileChange" :before-upload="beforeSelectDoc" :on-exceed="onExceed" :limit="1">
            <el-button type="primary">选择 {{ activeTab === 'api' ? '.html' : '.doc / .docx' }} 文件</el-button>
            <div slot="tip" class="el-upload__tip">
              仅支持 {{ activeTab === 'api' ? '.html' : '.doc / .docx' }} 文件，最大 10MB
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false" :disabled="submitting">取 消</el-button>
        <el-button type="primary" @click="submitDoc" :loading="submitting">提 交</el-button>
      </span>
    </el-dialog>

    <!-- PRD 文档查看弹窗 -->
    <el-dialog :visible.sync="prdDialogVisible" width="60%" :append-to-body="true" :close-on-click-modal="false">
      <div slot="title" class="dialog-title">{{ prdDocTitle }}</div>
      <div v-if="currentPrdContent" class="doc-content">
        <div class="doc-body" v-html="formattedPrdContent"></div>
      </div>
      <div v-if="prdHasPrev || prdHasNext || prdTotalPages > 1" class="doc-pagination">
        <el-button size="small" @click="prevPrdPage" :disabled="!prdHasPrev">上一页</el-button>
        <span class="page-info">{{ prdCurrentPage }} / {{ prdTotalPages }} (共{{ prdTotalLength }}字)</span>
        <el-button size="small" @click="nextPrdPage" :disabled="!prdHasNext">下一页</el-button>
      </div>
    </el-dialog>

    <!-- API 文档接口查看弹窗 -->
    <el-dialog :visible.sync="apiDialogVisible" width="70%" :append-to-body="true" :close-on-click-modal="false">
      <div slot="title" class="dialog-title">{{ apiDocTitle }}</div>
      <div class="doc-content">
        <el-table :data="apiInterfaces" v-loading="apiInterfaceLoading" stripe class="interface-table" style="width: 100%">
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="api_name" label="接口名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="method" label="方法" width="100">
            <template #default="scope">
              <el-tag :type="getMethodTagType(scope.row.method)" size="small">{{ scope.row.method || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="api_path" label="接口路径" min-width="250" show-overflow-tooltip />
          <el-table-column prop="request_params" label="请求参数" min-width="150" show-overflow-tooltip />
        </el-table>
        <div v-if="!apiInterfaceLoading && apiInterfaces.length === 0" class="doc-empty">暂无接口数据</div>
      </div>
    </el-dialog>

    <!-- API 生成用例接口选择弹窗 -->
    <el-dialog :visible.sync="apiGenerateVisible" title="生成测试用例" width="650px"
      :append-to-body="true" :close-on-click-modal="false">
      <div class="generate-dialog">
        <div class="generate-info">
          <span class="info-label">文档：</span>
          <span class="info-value">{{ apiGenerateDocName }}</span>
        </div>
        <div class="generate-search mt-2">
          <el-input v-model="apiGenerateSearch" placeholder="搜索接口名称或路径" clearable prefix-icon="el-icon-search" />
        </div>
        <div class="generate-table mt-2">
          <el-table :data="filteredApiInterfaces" stripe v-loading="apiGenerateLoading"
            @selection-change="onApiSelectionChange" ref="apiSelectTable" style="width: 100%" max-height="360">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="api_name" label="接口名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="method" label="方法" width="90">
              <template #default="scope">
                <el-tag :type="getMethodTagType(scope.row.method)" size="small">{{ scope.row.method || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="api_path" label="接口路径" min-width="240" show-overflow-tooltip />
          </el-table>
        </div>
        <div class="generate-footer mt-2">
          <el-button type="text" @click="selectAllApis">全选</el-button>
          <el-button type="text" @click="deselectAllApis">取消全选</el-button>
          <span class="selected-count">已选 {{ selectedApis.length }} 个接口</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="apiGenerateVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitApiGenerate" :loading="apiGenerateSubmitting"
          :disabled="!selectedApis.length">生成测试用例</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DocManagement',
  data () {
    return {
      activeTab: 'prd',
      // 搜索
      searchForm: { project_id: '', doc_name: '' },
      // 文档列表
      docs: [],
      listLoading: false,
      deletingIds: [],
      generatingIds: [],
      downloadingIds: [],
      parsingIds: [],
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalDocs: 0,
      // 上传弹窗（共用）
      uploadDialogVisible: false,
      uploadSelectedProject: null,
      uploadVersion: '',
      fileList: [],
      submitting: false,
      uploadProjectOptions: [],
      projectsLoading: false,
      // 搜索项目选项
      searchProjectOptions: [],
      searchProjectsLoading: false,
      // PRD 文档查看
      prdDialogVisible: false,
      currentPrdContent: '',
      currentPrdDocId: null,
      prdDocTitle: '',
      prdCurrentPage: 1,
      prdPageSize: 5000,
      prdTotalPages: 0,
      prdTotalLength: 0,
      prdHasNext: false,
      prdHasPrev: false,
      // API 文档查看
      apiDialogVisible: false,
      apiDocTitle: '',
      apiInterfaces: [],
      apiInterfaceLoading: false,
      // API 生成用例弹窗
      apiGenerateVisible: false,
      apiGenerateDocId: null,
      apiGenerateDocName: '',
      apiGenerateSearch: '',
      apiGenerateInterfaces: [],
      apiGenerateLoading: false,
      apiGenerateSubmitting: false,
      selectedApis: []
    }
  },
  computed: {
    paginatedDocs () {
      const start = (this.currentPage - 1) * this.pageSize
      return this.docs.slice(start, start + this.pageSize)
    },
    formattedPrdContent () {
      return this.currentPrdContent ? this.currentPrdContent.replace(/\n/g, '<br>') : ''
    },
    filteredApiInterfaces () {
      if (!this.apiGenerateSearch) return this.apiGenerateInterfaces
      const keyword = this.apiGenerateSearch.toLowerCase()
      return this.apiGenerateInterfaces.filter(it =>
        (it.api_name && it.api_name.toLowerCase().includes(keyword)) ||
        (it.api_path && it.api_path.toLowerCase().includes(keyword))
      )
    }
  },
  created () {
    this.fetchDocs()
    this.loadSearchProjectOptions()
  },
  methods: {
    // === 公共方法 ===
    onTabClick () {
      this.currentPage = 1
      this.fetchDocs()
    },
    fetchDocs () {
      this.listLoading = true
      const params = { doc_type: this.activeTab }
      if (this.searchForm.project_id) params.project_id = this.searchForm.project_id
      if (this.searchForm.doc_name) params.file_name = this.searchForm.doc_name
      this.$axios.get('/api/common/doc/get', { params })
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw) ? raw
            : (raw && Array.isArray(raw.data)) ? raw.data
              : (raw && Array.isArray(raw.list)) ? raw.list : []
          this.docs = list.map(it => ({
            id: it.id != null ? it.id : (it.doc_id != null ? it.doc_id : it.api_doc_id),
            project_name: it.project_name || it.project || '',
            doc_name: it.file_name || it.filename || it.doc_name || it.name || '',
            version: it.version || ''
          }))
          this.totalDocs = this.docs.length
        })
        .catch(() => {
          this.$message.error('加载文档列表失败')
          this.docs = []
        })
        .finally(() => { this.listLoading = false })
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
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    isDeleting (id) { return this.deletingIds.includes(id) },
    isGenerating (id) { return this.generatingIds.includes(id) },
    isDownloading (id) { return this.downloadingIds.includes(id) },
    isParsing (id) { return this.parsingIds.includes(id) },

    // === 上传 ===
    openUploadDialog () {
      this.uploadDialogVisible = true
      this.uploadSelectedProject = null
      this.uploadVersion = ''
      this.fileList = []
      this.$nextTick(() => { this.loadUploadProjectOptions() })
    },
    loadUploadProjectOptions () {
      this.projectsLoading = true
      this.$axios.get('/api/project/get')
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw) ? raw
            : (raw && Array.isArray(raw.data)) ? raw.data
              : (raw && Array.isArray(raw.list)) ? raw.list : []
          this.uploadProjectOptions = list.map(it => {
            const id = it.id != null ? it.id : (it.project_id != null ? it.project_id : it.ID)
            return { value: id, label: it.project_name || it.name || ('项目' + (id || '')) }
          }).filter(it => it && it.value != null && it.label)
        })
        .catch(() => { this.$message.error('加载项目列表失败') })
        .finally(() => { this.projectsLoading = false })
    },
    loadSearchProjectOptions () {
      this.searchProjectsLoading = true
      this.$axios.get('/api/project/get')
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw) ? raw
            : (raw && Array.isArray(raw.data)) ? raw.data
              : (raw && Array.isArray(raw.list)) ? raw.list : []
          this.searchProjectOptions = list.map(it => {
            const id = it.id != null ? it.id : (it.project_id != null ? it.project_id : it.ID)
            return { value: id, label: it.project_name || it.name || ('项目' + (id || '')) }
          }).filter(it => it && it.value != null && it.label)
        })
        .catch(() => { this.$message.error('加载项目列表失败') })
        .finally(() => { this.searchProjectsLoading = false })
    },
    beforeSelectDoc () { return false },
    onExceed () { this.$message.warning('一次只能上传一个文件') },
    onFileChange (file, fileList) {
      this.fileList = fileList.slice(-1)
    },
    submitDoc () {
      if (!this.uploadSelectedProject) { this.$message.warning('请选择项目'); return }
      if (!this.fileList.length) { this.$message.warning('请先选择文件'); return }
      const raw = this.fileList[0].raw
      // 文件类型校验
      if (this.activeTab === 'prd') {
        if (!/\.(doc|docx)$/i.test(raw.name)) { this.$message.error('仅支持 .doc / .docx 文件'); return }
      } else {
        if (!/\.html$/i.test(raw.name)) { this.$message.error('仅支持 .html 文件'); return }
      }
      if (raw.size / 1024 / 1024 > 10) { this.$message.error('文件大小不能超过 10MB'); return }
      const form = new FormData()
      const pid = typeof this.uploadSelectedProject === 'object' && this.uploadSelectedProject !== null
        ? this.uploadSelectedProject.value : this.uploadSelectedProject
      form.append('project_id', pid)
      form.append('doc_type', this.activeTab)
      form.append('version', this.uploadVersion || '')
      form.append('file', raw)
      const ext = raw.name.substring(raw.name.lastIndexOf('.') + 1)
      form.append('file_type', ext)
      this.submitting = true
      this.$axios.post('/api/common/doc/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(() => {
          this.$message.success('上传成功')
          this.uploadDialogVisible = false
          this.uploadSelectedProject = null
          this.uploadVersion = ''
          this.fileList = []
          this.fetchDocs()
        })
        .catch(() => { this.$message.error('上传失败') })
        .finally(() => { this.submitting = false })
    },

    // === 下载 / 删除 ===
    downloadDoc (row) {
      const docId = row.id
      const docName = row.doc_name || '文档'
      if (!docId) return
      this.downloadingIds.push(docId)
      this.$axios.get('/api/common/doc/download', { params: { id: docId }, responseType: 'blob' })
        .then(res => {
          const blob = new Blob([res.data])
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url; link.download = docName
          document.body.appendChild(link); link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        })
        .catch(() => { this.$message.error('下载失败') })
        .finally(() => { this.downloadingIds = this.downloadingIds.filter(x => x !== docId) })
    },
    deleteDoc (row) {
      const docId = row.id
      if (!docId) return
      this.deletingIds.push(docId)
      this.$axios.post('/api/common/doc/delete', { doc_id: docId })
        .then(() => { this.$message.success('删除成功'); this.fetchDocs() })
        .catch(() => { this.$message.error('删除失败') })
        .finally(() => { this.deletingIds = this.deletingIds.filter(x => x !== docId) })
    },

    // === PRD 文档操作 ===
    generatePrdCases (row) {
      const docId = row.id
      if (!docId) return
      this.generatingIds.push(docId)
      this.$axios.post('/api/ai_job/run', { doc_id: docId })
        .then(() => {
          this.$message.success('已提交生成任务，请到用例任务查看进度')
          this.$router.push({ path: '/aitestcase', query: { doc_id: docId } })
        })
        .catch(() => { this.$message.error('生成任务提交失败') })
        .finally(() => { this.generatingIds = this.generatingIds.filter(x => x !== docId) })
    },
    viewPrdDoc (row) {
      const id = row.id
      if (!id) return
      this.currentPrdDocId = id
      this.fetchPrdDetail(id, 1, this.prdPageSize)
    },
    fetchPrdDetail (id, page, pageSize) {
      this.$axios.get('/api/common/doc/detail', { params: { id, page, page_size: pageSize } })
        .then(res => {
          const data = res && res.data && res.data.data
          if (data) {
            this.prdDocTitle = data.file_name || data.filename || ''
            this.currentPrdContent = data.page_content || data.file_content || ''
            this.prdCurrentPage = data.page || 1
            this.prdTotalPages = data.total_pages || 0
            this.prdTotalLength = data.total_length || 0
            this.prdHasNext = data.has_next || false
            this.prdHasPrev = data.has_prev || false
          }
          this.prdDialogVisible = true
        })
        .catch(() => { this.$message.error('获取文档详情失败') })
    },
    prevPrdPage () {
      if (this.prdHasPrev && this.currentPrdDocId) {
        this.fetchPrdDetail(this.currentPrdDocId, this.prdCurrentPage - 1, this.prdPageSize)
      }
    },
    nextPrdPage () {
      if (this.prdHasNext && this.currentPrdDocId) {
        this.fetchPrdDetail(this.currentPrdDocId, this.prdCurrentPage + 1, this.prdPageSize)
      }
    },

    // === API 文档操作 ===
    parseDoc (row) {
      const id = row.id
      if (!id) return
      this.parsingIds.push(id)
      this.$axios.post('/api/common/api/parse/sync', { doc_id: id })
        .then(() => { this.$message.success('文档解析成功'); this.fetchDocs() })
        .catch(() => { this.$message.error('文档解析失败') })
        .finally(() => { this.parsingIds = this.parsingIds.filter(x => x !== id) })
    },
    viewApiDoc (row) {
      if (!row.id) return
      this.apiDocTitle = row.doc_name || '接口列表'
      this.apiInterfaceLoading = true
      this.apiInterfaces = []
      this.$axios.get('/api/apicommon/api_interface/get', { params: { api_doc_id: row.id } })
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw) ? raw
            : (raw && Array.isArray(raw.data)) ? raw.data
              : (raw && Array.isArray(raw.list)) ? raw.list : []
          this.apiInterfaces = list.map(it => ({
            id: it.id,
            api_name: it.api_name || '',
            api_path: it.api_path || '',
            method: it.method || 'GET',
            request_params: it.request_params || '',
            response_params: it.response_params || ''
          }))
          this.apiDialogVisible = true
        })
        .catch(() => { this.$message.error('获取接口列表失败') })
        .finally(() => { this.apiInterfaceLoading = false })
    },
    getMethodTagType (method) {
      const m = (method || '').toUpperCase()
      if (m === 'GET') return 'success'
      if (m === 'POST') return 'primary'
      if (m === 'PUT') return 'warning'
      if (m === 'DELETE') return 'danger'
      return 'info'
    },

    // === API 生成用例弹窗 ===
    openApiGenerateDialog (row) {
      this.apiGenerateDocId = row.id
      this.apiGenerateDocName = row.doc_name || ''
      this.apiGenerateSearch = ''
      this.selectedApis = []
      this.apiGenerateLoading = true
      this.apiGenerateInterfaces = []
      this.$axios.get('/api/apicommon/api_interface/get', { params: { api_doc_id: row.id } })
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw) ? raw
            : (raw && Array.isArray(raw.data)) ? raw.data
              : (raw && Array.isArray(raw.list)) ? raw.list : []
          this.apiGenerateInterfaces = list.map(it => ({
            id: it.id,
            api_name: it.api_name || '',
            api_path: it.api_path || '',
            method: it.method || 'GET'
          }))
          this.apiGenerateVisible = true
        })
        .catch(() => { this.$message.error('获取接口列表失败') })
        .finally(() => { this.apiGenerateLoading = false })
    },
    onApiSelectionChange (selection) {
      this.selectedApis = selection
    },
    selectAllApis () {
      this.$refs.apiSelectTable.clearSelection()
      this.filteredApiInterfaces.forEach(row => {
        this.$refs.apiSelectTable.toggleRowSelection(row, true)
      })
    },
    deselectAllApis () {
      this.$refs.apiSelectTable.clearSelection()
    },
    submitApiGenerate () {
      if (!this.selectedApis.length) return
      this.apiGenerateSubmitting = true
      const docId = this.apiGenerateDocId
      // 逐个调用生成接口
      const promises = this.selectedApis.map(api =>
        this.$axios.post('/api/testcase/api/case/generate', {
          api_interface_id: api.id,
          doc_id: docId
        }).catch(() => {})
      )
      Promise.all(promises)
        .then(() => {
          this.$message.success(`已提交 ${this.selectedApis.length} 个接口的生成任务，请到用例任务查看进度`)
          this.apiGenerateVisible = false
          this.selectedApis = []
          this.$router.push({ path: '/aitestcase' })
        })
        .catch(() => { this.$message.error('部分生成任务提交失败') })
        .finally(() => { this.apiGenerateSubmitting = false })
    }
  }
}
</script>

<style scoped>
.doc-container {
  /* unified-container */
}

.mr-1 { margin-right: 6px; }
.mt-2 { margin-top: 16px; }

/* Dialog */
.dialog-title {
  text-align: center;
  font-weight: 600;
  font-size: 18px;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Upload */
.upload-block {
  width: 100%;
}

/* PRD doc content */
.doc-content {
  min-height: 200px;
  padding: 18px 20px;
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
}

.doc-empty {
  text-align: center;
  color: #909399;
  padding: 60px 20px;
}

/* API generate dialog */
.generate-dialog {
  padding: 0;
}

.generate-info {
  font-size: 14px;
}

.generate-info .info-label {
  color: #606266;
}

.generate-info .info-value {
  color: #303133;
  font-weight: 600;
}

.generate-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  flex: 1;
  text-align: right;
  color: #909399;
  font-size: 13px;
}

.generate-table >>> .el-table {
  font-size: 13px;
}
</style>
