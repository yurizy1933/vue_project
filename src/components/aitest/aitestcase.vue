<template>
  <div class="aitestcase-container">
    <el-card>
      <div class="action-bar unified-action-bar">
        <h3 class="card-title unified-card-title">AI 测试用例文档</h3>
      </div>
      <div class="search-container unified-search-container">
        <el-form :inline="true" :model="searchForm" label-width="80px" class="search-form unified-form-inline">
          <el-form-item label="项目名称">
            <el-input v-model="searchForm.project_id" placeholder="请输入项目名称" clearable style="width: 260px"></el-input>
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

    <div class="table-wrap unified-table-wrap">
        <el-table :data="docs" stripe v-loading="listLoading" class="project-table unified-table" style="width: 100%">
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="project_name" label="项目名称" min-width="220" />
          <el-table-column prop="doc_name" label="需求文档" min-width="320" show-overflow-tooltip />
          <el-table-column prop="job_status" label="任务状态" width="120">
            <template slot-scope="scope">
              <el-tag :type="getStatusTagType(scope.row.job_status)" size="small">
                {{ getStatusText(scope.row.job_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="goToTestCaseManagement(scope.row)"
                :disabled="!isJobCompleted(scope.row.job_status)"
                :loading="isNavigating(scope.row.id)">
                <i class="fa fa-eye mr-1"></i>查看用例
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap unified-pagination-wrap">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="docs.length">
          </el-pagination>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'aitestcase',
  data () {
    return {
      searchForm: {
        project_id: '',
        doc_name: ''
      },
      listLoading: false,
      docs: [],
      navigatingIds: [],
      refreshTimer: null,
      currentPage: 1,
      pageSize: 10
    }
  },
  created () {
    this.fetchDocs()
    // 如果从路由参数中获取到 doc_id，则自动筛选
    if (this.$route.query.doc_id) {
      // 可以在这里添加逻辑，比如高亮显示对应的任务
    }
    // 启动定时刷新，每5秒检查一次任务状态
    this.startAutoRefresh()
  },
  beforeDestroy () {
    // 组件销毁前清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  watch: {
    // 监听路由参数变化，自动刷新数据
    '$route.query.doc_id' () {
      this.fetchDocs()
    }
  },
  methods: {
    handleSearch () {
      this.fetchDocs()
    },
    resetSearch () {
      this.searchForm.project_id = ''
      this.searchForm.doc_name = ''
      this.fetchDocs()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    fetchDocs () {
      this.listLoading = true
      const params = {
        project_id: this.searchForm.project_id || undefined,
        doc_name: this.searchForm.doc_name || undefined
      }
      // 如果路由中有 doc_id 参数，也传递给接口
      if (this.$route.query.doc_id) {
        params.doc_id = this.$route.query.doc_id
      }
      // 调用后端接口：/api/ai_job/get，并携带搜索参数
      this.$axios.get('/api/testcase/ai_job/get', { params })
        .then(res => {
          const raw = res && res.data
          // 兼容多种返回结构：数组或 {data: []} 或 {list: []}
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data))
              ? raw.data
              : (raw && Array.isArray(raw.list))
                ? raw.list
                : []
          // 规范化字段，包含任务状态和 job_id
          this.docs = list.map(it => ({
            id: it.id != null ? it.id : (it.job_id != null ? it.job_id : it.doc_id),
            job_id: it.job_id != null ? it.job_id : (it.id != null ? it.id : null),
            doc_id: it.doc_id != null ? it.doc_id : (it.id != null ? it.id : null),
            project_name: it.project_name || it.project || it.projectName || '',
            doc_name: it.doc_name || it.filename || it.name || '',
            // job_status: 0=待处理, 1=处理中, 2=已完成
            job_status: it.job_status != null ? it.job_status : (it.status != null ? it.status : null)
          }))
        })
        .catch(() => {
          this.$message.error('加载任务列表失败')
          this.docs = []
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    getStatusTagType (status) {
      // 后端返回的数字状态：0=待处理, 1=处理中, 2=已完成
      const statusNum = status != null ? Number(status) : -1
      if (statusNum === 2) {
        return 'success' // 已完成 - 绿色
      } else if (statusNum === 1) {
        return 'warning' // 处理中 - 黄色
      } else if (statusNum === 0) {
        return 'info' // 待处理 - 灰色
      }
      return 'info'
    },
    getStatusText (status) {
      // 后端返回的数字状态：0=待处理, 1=处理中, 2=已完成
      const statusNum = status != null ? Number(status) : -1
      const statusMap = {
        0: '待处理',
        1: '处理中',
        2: '已完成'
      }
      return statusMap[statusNum] || '未知'
    },
    isJobCompleted (status) {
      // 只有状态为 2（已完成）时才能跳转
      const statusNum = status != null ? Number(status) : -1
      return statusNum === 2
    },
    isNavigating (id) {
      return this.navigatingIds.includes(id)
    },
    goToTestCaseManagement (row) {
      if (!this.isJobCompleted(row.job_status)) {
        this.$message.warning('任务尚未完成，无法查看用例')
        return
      }
      const jobId = row.job_id || row.id
      const docId = row.doc_id
      if (!jobId && !docId) {
        this.$message.error('缺少任务ID，无法跳转')
        return
      }
      // 构建查询参数
      const query = {}
      if (jobId) {
        query.job_id = jobId
      }
      if (docId) {
        query.doc_id = docId
      }
      // 使用 router.resolve 生成完整路径，然后在新窗口打开
      const routeData = this.$router.resolve({
        path: '/testCaseManagement',
        query: query
      })
      // 在新标签页中打开
      window.open(routeData.href, '_blank')
    },
    startAutoRefresh () {
      // 每5秒自动刷新一次任务状态
      this.refreshTimer = setInterval(() => {
        // 只刷新未完成的任务
        const hasIncompleteJobs = this.docs.some(doc => !this.isJobCompleted(doc.job_status))
        if (hasIncompleteJobs && !this.listLoading) {
          this.fetchDocs()
        }
      }, 5000)
    }
  }
}
</script>

<style scoped>
.aitestcase-container {
  flex: 1;
  min-width: 0;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

.aitestcase-container >>> .el-card {
  margin-bottom: 0;
}

.aitestcase-container >>> .el-card__body {
  padding: 16px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mr-1 {
  margin-right: 6px;
}
</style>
