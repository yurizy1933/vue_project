<template>
  <div class="api-interface-container">
    <el-card>
      <div class="action-bar">
        <h3 class="card-title">接口管理</h3>
        <div style="flex:1"></div>
        <el-button type="primary" @click="openTestDataDialog(null)">
          <i class="fa fa-plus mr-1"></i>新增测试数据
        </el-button>
      </div>

      <!-- 接口搜索栏 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" label-width="80px" class="search-form form-inline">
          <el-form-item label="API名称">
            <el-input v-model="searchForm.api_name" placeholder="请输入API名称" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="API路径">
            <el-input v-model="searchForm.api_path" placeholder="请输入API路径" clearable style="width: 260px"></el-input>
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input v-model="searchForm.project_name" placeholder="请输入项目名称" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="文档名称">
            <el-input v-model="searchForm.api_doc_name" placeholder="请输入文档名称" clearable style="width: 260px"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch" :loading="listLoading">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch" :disabled="listLoading">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 接口列表 -->
    <div class="table-wrap">
      <el-table :data="paginatedInterfaces" stripe v-loading="listLoading" class="project-table" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="project_name" label="项目名称" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="api_doc_name" label="接口文档" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="api_name" label="API名称" min-width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="method" label="请求方法" width="90">
          <template slot-scope="scope">
            <el-tag :type="getMethodTagType(scope.row.method)" size="small">{{ scope.row.method || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="api_path" label="API路径" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="request_params" label="请求参数" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="response_params" label="响应参数" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="generateTestCases(scope.row)"
              :loading="isGenerating(scope.row.id)"
              :disabled="isGenerating(scope.row.id)">
              <i class="fa fa-magic mr-1"></i>生成测试用例
            </el-button>
            <el-button
              type="text"
              @click="openTestDataDialog(scope.row)">
              <i class="fa fa-cogs mr-1"></i>配置数据
            </el-button>
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
          :total="totalInterfaces">
        </el-pagination>
      </div>
    </div>

    <!-- 测试数据配置弹窗 -->
    <el-dialog
      :visible.sync="testDataDialogVisible"
      :title="currentInterface ? `配置测试数据 - ${currentInterface.api_name || ''}` : '新增测试数据'"
      width="700px"
      :append-to-body="true"
      :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="接口信息">
          <el-input v-model="selectedInterfaceInfo" disabled></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="testDataDescription" type="textarea" :rows="2" placeholder="请输入测试数据描述"></el-input>
        </el-form-item>
        <el-form-item label="测试数据">
          <div class="test-data-list">
            <div v-for="(item, index) in testDataList" :key="index" class="test-data-item">
              <el-input v-model="item.key" placeholder="参数名" style="width: 200px"></el-input>
              <span class="separator">:</span>
              <el-input v-model="item.value" placeholder="参数值" style="width: 200px"></el-input>
              <el-button type="text" icon="el-icon-delete" @click="removeTestDataItem(index)" class="remove-btn"></el-button>
            </div>
            <el-button type="dashed" icon="el-icon-plus" @click="addTestDataItem" class="add-btn">添加参数</el-button>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testDataDialogVisible = false" :disabled="submitting">取 消</el-button>
        <el-button type="primary" @click="submitTestData" :loading="submitting">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ApiInterfaceManagement',
  data () {
    return {
      // 搜索表单
      searchForm: {
        api_name: '',
        api_path: '',
        project_name: '',
        api_doc_name: ''
      },
      // 接口列表
      interfaces: [],
      listLoading: false,
      generatingIds: [],
      // 分页相关
      currentPage: 1,
      pageSize: 10,
      totalInterfaces: 0,
      // 测试数据弹窗
      testDataDialogVisible: false,
      currentInterface: null,
      testDataList: [],
      testDataDescription: '',
      selectedInterfaceInfo: '',
      submitting: false
    }
  },
  computed: {
    paginatedInterfaces () {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.interfaces.slice(start, end)
    }
  },
  created () {
    this.fetchInterfaces()
  },
  methods: {
    isGenerating (id) {
      return this.generatingIds.includes(id)
    },
    fetchInterfaces () {
      this.listLoading = true
      const params = {}
      if (this.searchForm.api_name) {
        params.api_name = this.searchForm.api_name
      }
      if (this.searchForm.api_path) {
        params.api_path = this.searchForm.api_path
      }
      if (this.searchForm.project_name) {
        params.project_name = this.searchForm.project_name
      }
      if (this.searchForm.api_doc_name) {
        params.api_doc_name = this.searchForm.api_doc_name
      }
      this.$axios.get('/api/api_interface/get', { params })
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          this.interfaces = list.map(it => ({
            id: it.id,
            api_name: it.api_name || '',
            api_path: it.api_path || '',
            method: it.method || 'GET',
            request_params: it.request_params || '',
            response_params: it.response_params || '',
            remark: it.remark || '',
            project_name: it.project_name || '',
            api_doc_name: it.api_doc_name || ''
          }))
          this.totalInterfaces = this.interfaces.length
        })
        .catch(() => {
          this.$message.error('加载接口列表失败')
          this.interfaces = []
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    handleSearch () {
      this.currentPage = 1
      this.fetchInterfaces()
    },
    resetSearch () {
      this.searchForm.api_name = ''
      this.searchForm.api_path = ''
      this.searchForm.project_name = ''
      this.searchForm.api_doc_name = ''
      this.currentPage = 1
      this.fetchInterfaces()
    },
    getMethodTagType (method) {
      const m = (method || '').toUpperCase()
      if (m === 'GET') return 'success'
      if (m === 'POST') return 'primary'
      if (m === 'PUT') return 'warning'
      if (m === 'DELETE') return 'danger'
      return 'info'
    },
    generateTestCases (row) {
      const id = row.id
      if (!id) return
      if (!this.generatingIds.includes(id)) this.generatingIds.push(id)
      this.$axios.post('/api/api_test_cases/generate', { api_interface_id: id })
        .then(res => {
          this.$message.success('测试用例生成成功')
          this.generatingIds = this.generatingIds.filter(x => x !== id)
        })
        .catch(() => {
          this.$message.error('测试用例生成失败')
          this.generatingIds = this.generatingIds.filter(x => x !== id)
        })
        .finally(() => {
          this.generatingIds = this.generatingIds.filter(x => x !== id)
        })
    },
    openTestDataDialog (row) {
      this.currentInterface = row
      this.testDataList = row && row.id ? [] : [{ key: '', value: '' }]
      this.testDataDescription = ''
      if (row) {
        this.selectedInterfaceInfo = `${row.project_name || ''} / ${row.api_doc_name || ''} / ${row.api_name || ''} (${row.method || ''}) ${row.api_path || ''}`
      } else {
        this.selectedInterfaceInfo = ''
      }
      this.testDataDialogVisible = true
    },
    addTestDataItem () {
      this.testDataList.push({ key: '', value: '' })
    },
    removeTestDataItem (index) {
      if (this.testDataList.length > 1) {
        this.testDataList.splice(index, 1)
      }
    },
    submitTestData () {
      if (!this.currentInterface || !this.currentInterface.id) {
        this.$message.warning('请选择要配置的接口')
        return
      }

      // 过滤掉空的key-value对
      const validItems = this.testDataList.filter(item => item.key && item.key.trim())
      if (validItems.length === 0) {
        this.$message.warning('请至少填写一个有效的测试数据')
        return
      }

      // 组装成JSON对象
      const testDataJson = {}
      validItems.forEach(item => {
        testDataJson[item.key] = item.value
      })

      this.submitting = true
      this.$axios.post('/api/test_data/create', {
        api_interface_id: this.currentInterface.id,
        test_data_json: JSON.stringify(testDataJson),
        description: this.testDataDescription || ''
      })
        .then(() => {
          this.$message.success('测试数据保存成功')
          this.testDataDialogVisible = false
        })
        .catch(() => {
          this.$message.error('测试数据保存失败')
        })
        .finally(() => {
          this.submitting = false
        })
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    }
  }
}
</script>

<style scoped>
.api-interface-container {
  flex: 1;
  min-width: 0;
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.api-interface-container >>> .el-card {
  margin-bottom: 0;
}

.api-interface-container >>> .el-card__body {
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

/* 测试数据列表样式 */
.test-data-list {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 12px;
}

.test-data-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.test-data-item:last-of-type {
  margin-bottom: 0;
}

.separator {
  margin: 0 12px;
  color: #909399;
  font-weight: 500;
}

.remove-btn {
  margin-left: 8px;
  color: #f56c6c;
}

.remove-btn:hover {
  color: #f78989;
}

.add-btn {
  width: 100%;
  border-style: dashed;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
