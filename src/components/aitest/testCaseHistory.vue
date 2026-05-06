<template>
  <div class="history-container unified-container">
    <el-card>
      <div class="action-bar unified-action-bar">
        <h3 class="card-title unified-card-title">执行历史</h3>
        <div style="flex:1"></div>
      </div>

      <!-- 搜索区 -->
      <div class="search-container unified-search-container">
        <el-form :inline="true" :model="searchForm" class="unified-form-inline">
          <el-form-item label="用例名称">
            <el-input v-model="searchForm.case_name" placeholder="请输入用例名称" clearable @clear="handleSearch" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="执行状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable @change="handleSearch" style="width: 150px">
              <el-option label="全部" value=""></el-option>
              <el-option label="执行中" value="running"></el-option>
              <el-option label="已完成" value="completed"></el-option>
              <el-option label="失败" value="failed"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 历史列表 -->
      <div class="table-wrap unified-table-wrap">
        <el-table :data="list" border stripe size="small" v-loading="listLoading" class="project-table unified-table" style="width: 100%">
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="case_name" label="用例名称" min-width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="created_at" label="执行时间" width="180"></el-table-column>
          <el-table-column prop="duration_display" label="耗时" width="100"></el-table-column>
          <el-table-column prop="case_type" label="用例类型" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.case_type === 'api' ? 'primary' : 'warning'" size="small">
                {{ scope.row.case_type === 'api' ? '接口用例' : '文档用例' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="statusTagType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button type="text" @click="viewResult(scope.row)"><i class="fa fa-eye mr-1"></i>查看结果</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination-wrap unified-pagination-wrap">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'testCaseHistory',
  data () {
    return {
      searchForm: {
        case_name: '',
        status: ''
      },
      list: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      listLoading: false
    }
  },
  created () {
    this.fetchList()
  },
  methods: {
    statusTagType (status) {
      if (status === 'completed') return 'success'
      if (status === 'running') return 'warning'
      if (status === 'failed') return 'danger'
      return 'info'
    },
    statusText (status) {
      const map = { running: '执行中', completed: '已完成', failed: '失败' }
      return map[status] || status || '-'
    },
    handleSearch () {
      this.currentPage = 1
      this.fetchList()
    },
    resetSearch () {
      this.searchForm.case_name = ''
      this.searchForm.status = ''
      this.currentPage = 1
      this.fetchList()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchList()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.fetchList()
    },
    viewResult (row) {
      this.$router.push({ path: '/testCaseResult', query: { execution_id: row.id } })
    },
    fetchList () {
      this.listLoading = true
      const params = {
        page: this.currentPage,
        page_size: this.pageSize,
        case_name: this.searchForm.case_name || undefined,
        status: this.searchForm.status || undefined
      }
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key]
        }
      })
      this.$axios.get('/api/apicommon/apirun/list', { params })
        .then(res => {
          const raw = res && res.data
          const arr = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          const total = (raw && raw.pagination && typeof raw.pagination.total === 'number')
            ? raw.pagination.total
            : (raw && typeof raw.total === 'number')
              ? raw.total
              : arr.length
          this.total = total
          this.list = arr.map(it => {
            const status = it.status != null ? String(it.status) : ''
            return {
              id: it.id != null ? it.id : (it.execution_id != null ? it.execution_id : ''),
              case_name: it.case_name || it.name || '-',
              case_type: it.case_type || '',
              created_at: it.created_at || it.executed_at || '-',
              duration_display: it.duration_display || (it.duration_ms != null ? (it.duration_ms + 'ms') : '-'),
              status: status
            }
          })
        })
        .catch(() => {
          this.$message.error('加载执行历史失败')
          this.list = []
        })
        .finally(() => {
          this.listLoading = false
        })
    }
  }
}
</script>

<style scoped>
.history-container {
  /* 使用 unified-container 类 */
}

.mr-1 {
  margin-right: 6px;
}
</style>
