<template>
  <div class="test-data-container">
    <el-card>
      <div class="action-bar">
        <h3 class="card-title">测试数据管理</h3>
        <div style="flex:1"></div>
        <el-button type="primary" @click="openEditDialog()">
          <i class="fa fa-plus mr-1"></i>新增测试数据
        </el-button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" label-width="80px" class="search-form form-inline">
          <el-form-item label="数据类型">
            <el-select v-model="searchForm.is_public" placeholder="请选择类型" clearable style="width: 150px">
              <el-option label="全部" :value="null"></el-option>
              <el-option label="公共参数" :value="true"></el-option>
              <el-option label="接口参数" :value="false"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="searchForm.description" placeholder="请输入描述" clearable style="width: 300px"></el-input>
          </el-form-item>
          <el-form-item label="接口名称">
            <el-input v-model="searchForm.api_name" placeholder="请输入接口名称" clearable style="width: 260px"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch" :loading="listLoading">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch" :disabled="listLoading">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 测试数据列表 -->
    <div class="table-wrap">
      <el-table :data="paginatedData" stripe v-loading="listLoading" class="project-table" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="is_public" label="数据类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.is_public ? 'success' : 'primary'" size="small">
              {{ scope.row.is_public ? '公共参数' : '接口参数' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="api_name" label="接口名称" min-width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="api_path" label="接口路径" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="test_data" label="测试数据" min-width="300" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="test-data-preview">{{ formatTestData(scope.row.test_data_json) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="openEditDialog(scope.row)">
              <i class="fa fa-edit mr-1"></i>编辑
            </el-button>
            <el-popconfirm title="确定删除该测试数据吗？" @confirm="deleteTestData(scope.row)" :disabled="isDeleting(scope.row.id)">
              <el-button slot="reference" type="text" :loading="isDeleting(scope.row.id)">
                <i class="fa fa-trash mr-1"></i>删除
              </el-button>
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
          :total="totalData">
        </el-pagination>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :visible.sync="editDialogVisible"
      :title="editForm.id ? '编辑测试数据' : '新增测试数据'"
      width="750px"
      :append-to-body="true"
      :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="数据类型">
          <el-radio-group v-model="editForm.is_public">
            <el-radio :label="true">公共参数</el-radio>
            <el-radio :label="false">接口参数</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择接口" v-if="!editForm.is_public">
          <el-select
            v-model="editForm.api_interface_id"
            placeholder="请选择接口"
            filterable
            clearable
            style="width: 100%"
            :loading="interfacesLoading">
            <el-option
              v-for="item in interfaceOptions"
              :key="item.id"
              :label="`${item.api_name} (${item.method}) ${item.api_path}`"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="2" placeholder="请输入描述"></el-input>
        </el-form-item>
        <el-form-item label="测试数据">
          <div class="test-data-list">
            <div v-for="(item, index) in editForm.testDataItems" :key="index" class="test-data-item">
              <el-input v-model="item.key" placeholder="参数名" style="width: 200px"></el-input>
              <span class="separator">:</span>
              <el-input v-model="item.value" placeholder="参数值" style="width: 220px"></el-input>
              <el-button type="text" icon="el-icon-delete" @click="removeTestDataItem(index)" class="remove-btn"></el-button>
            </div>
            <el-button type="dashed" icon="el-icon-plus" @click="addTestDataItem" class="add-btn">添加参数</el-button>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false" :disabled="submitting">取 消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="submitting">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TestDataManagement',
  data () {
    return {
      // 搜索表单
      searchForm: {
        is_public: null,
        description: '',
        api_name: ''
      },
      // 测试数据列表
      testDataList: [],
      listLoading: false,
      deletingIds: [],
      // 分页相关
      currentPage: 1,
      pageSize: 10,
      totalData: 0,
      // 新增/编辑弹窗
      editDialogVisible: false,
      editForm: {
        id: null,
        is_public: false,
        api_interface_id: null,
        description: '',
        testDataItems: [{ key: '', value: '' }]
      },
      interfaceOptions: [],
      interfacesLoading: false,
      submitting: false
    }
  },
  computed: {
    paginatedData () {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.testDataList.slice(start, end)
    }
  },
  created () {
    this.fetchTestData()
    this.fetchInterfaces()
  },
  methods: {
    isDeleting (id) {
      return this.deletingIds.includes(id)
    },
    fetchTestData () {
      this.listLoading = true
      const params = {}
      if (this.searchForm.is_public !== null) {
        params.is_public = this.searchForm.is_public
      }
      if (this.searchForm.description) {
        params.description = this.searchForm.description
      }
      if (this.searchForm.api_name) {
        params.api_name = this.searchForm.api_name
      }
      this.$axios.get('/api/test_data/get', { params })
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          this.testDataList = list.map(it => ({
            id: it.id,
            is_public: it.is_public === true || it.is_public === 'true',
            api_interface_id: it.api_interface_id,
            api_name: it.api_name || '',
            api_path: it.api_path || '',
            test_data_json: it.test_data_json || '',
            description: it.description || ''
          }))
          this.totalData = this.testDataList.length
        })
        .catch(() => {
          this.$message.error('加载测试数据列表失败')
          this.testDataList = []
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    fetchInterfaces () {
      this.interfacesLoading = true
      this.$axios.get('/api/api_interface/get')
        .then(res => {
          const raw = res && res.data
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          this.interfaceOptions = list.map(it => ({
            id: it.id,
            api_name: it.api_name || '',
            api_path: it.api_path || '',
            method: it.method || 'GET'
          }))
        })
        .catch(() => {
          this.$message.error('加载接口列表失败')
          this.interfaceOptions = []
        })
        .finally(() => {
          this.interfacesLoading = false
        })
    },
    handleSearch () {
      this.currentPage = 1
      this.fetchTestData()
    },
    resetSearch () {
      this.searchForm.is_public = null
      this.searchForm.description = ''
      this.searchForm.api_name = ''
      this.currentPage = 1
      this.fetchTestData()
    },
    formatTestData (jsonStr) {
      try {
        const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
        return Object.entries(obj)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      } catch (err) {
        return jsonStr || ''
      }
    },
    openEditDialog (row) {
      if (row) {
        // 编辑模式
        this.editForm.id = row.id
        this.editForm.is_public = row.is_public
        this.editForm.api_interface_id = row.api_interface_id
        this.editForm.description = row.description
        // 解析test_data_json为key-value数组
        try {
          const obj = typeof row.test_data_json === 'string'
            ? JSON.parse(row.test_data_json)
            : row.test_data_json
          this.editForm.testDataItems = Object.entries(obj)
            .map(([key, value]) => ({ key, value }))
        } catch (e) {
          this.editForm.testDataItems = [{ key: '', value: '' }]
        }
      } else {
        // 新增模式
        this.editForm.id = null
        this.editForm.is_public = false
        this.editForm.api_interface_id = null
        this.editForm.description = ''
        this.editForm.testDataItems = [{ key: '', value: '' }]
      }
      this.editDialogVisible = true
    },
    addTestDataItem () {
      this.editForm.testDataItems.push({ key: '', value: '' })
    },
    removeTestDataItem (index) {
      if (this.editForm.testDataItems.length > 1) {
        this.editForm.testDataItems.splice(index, 1)
      }
    },
    submitEdit () {
      // 验证：如果是接口参数，必须选择接口
      if (!this.editForm.is_public && !this.editForm.api_interface_id) {
        this.$message.warning('请选择接口')
        return
      }

      // 过滤掉空的key-value对
      const validItems = this.editForm.testDataItems.filter(item => item.key && item.key.trim())
      if (validItems.length === 0) {
        this.$message.warning('请至少填写一个有效的测试数据')
        return
      }

      // 组装成JSON对象
      const testDataJson = {}
      validItems.forEach(item => {
        testDataJson[item.key] = item.value
      })

      const params = {
        test_data_json: JSON.stringify(testDataJson),
        description: this.editForm.description || '',
        is_public: this.editForm.is_public
      }

      // 如果不是公共参数，添加api_interface_id
      if (!this.editForm.is_public) {
        params.api_interface_id = this.editForm.api_interface_id
      }

      const apiUrl = this.editForm.id ? '/api/test_data/update' : '/api/test_data/create'

      // 如果是编辑，添加id
      if (this.editForm.id) {
        params.id = this.editForm.id
      }

      this.submitting = true
      this.$axios.post(apiUrl, params)
        .then(() => {
          this.$message.success(this.editForm.id ? '更新成功' : '保存成功')
          this.editDialogVisible = false
          this.fetchTestData()
        })
        .catch(() => {
          this.$message.error(this.editForm.id ? '更新失败' : '保存失败')
        })
        .finally(() => {
          this.submitting = false
        })
    },
    deleteTestData (row) {
      const id = row.id
      if (!id) return
      this.deletingIds.push(id)
      this.$axios.post('/api/test_data/delete', { id })
        .then(() => {
          this.$message.success('删除成功')
          this.fetchTestData()
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
    }
  }
}
</script>

<style scoped>
.test-data-container {
  flex: 1;
  min-width: 0;
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.test-data-container >>> .el-card {
  margin-bottom: 0;
}

.test-data-container >>> .el-card__body {
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

/* 测试数据预览样式 */
.test-data-preview {
  color: #606266;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
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
