<template>
  <div class="result-container unified-container">
    <el-card>
      <div class="action-bar unified-action-bar">
        <h3 class="card-title unified-card-title">执行结果</h3>
        <div style="flex:1"></div>
        <el-button type="primary" size="small" @click="goBack">
          <i class="fa fa-arrow-left mr-1"></i>返回历史
        </el-button>
      </div>

      <div v-loading="loading">
        <!-- 执行概要 -->
        <el-card class="summary-card mt-2" shadow="never">
          <div slot="header" class="summary-header">
            <span class="summary-title">执行概要</span>
            <el-tag :type="conclusionTagType(resultData.conclusion)" size="medium">
              {{ conclusionText(resultData.conclusion) }}
            </el-tag>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用例名称">{{ resultData.case_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="执行时间">{{ resultData.created_at || '-' }}</el-descriptions-item>
            <el-descriptions-item label="总耗时">{{ resultData.duration_display || (resultData.duration_ms != null ? resultData.duration_ms + 'ms' : '-') }}</el-descriptions-item>
            <el-descriptions-item label="接口数量">{{ resultData.interfaces ? resultData.interfaces.length : 0 }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 依赖链 -->
        <el-card class="dependency-card mt-2" shadow="never" v-if="resultData.dependency_chain && resultData.dependency_chain.length">
          <div slot="header" class="summary-header">
            <span class="summary-title">依赖链</span>
          </div>
          <div class="dependency-chain">
            <el-steps :active="resultData.dependency_chain.length" direction="vertical" space="40px">
              <el-step
                v-for="(dep, idx) in resultData.dependency_chain"
                :key="idx"
                :title="dep.name || dep"
                :description="dep.description || ''"
                :status="dep.status === 'pass' ? 'success' : dep.status === 'fail' ? 'error' : 'process'"
              />
            </el-steps>
          </div>
        </el-card>

        <!-- AI 校验结论 -->
        <el-card class="validation-card mt-2" shadow="never" v-if="resultData.validation">
          <div slot="header" class="summary-header">
            <span class="summary-title">AI 校验结论</span>
            <el-tag :type="resultData.validation.conclusion === 'pass' ? 'success' : 'danger'" size="small">
              {{ resultData.validation.conclusion === 'pass' ? '通过' : '未通过' }}
            </el-tag>
          </div>
          <div class="validation-content">
            <div class="validation-summary">{{ resultData.validation.summary || '-' }}</div>
            <div class="validation-detail" v-if="resultData.validation.detail" v-html="resultData.validation.detail"></div>
          </div>
        </el-card>

        <!-- 接口执行详情 -->
        <el-card class="interfaces-card mt-2" shadow="never">
          <div slot="header" class="summary-header">
            <span class="summary-title">接口执行详情</span>
          </div>
          <el-table :data="resultData.interfaces" border stripe size="small" class="project-table unified-table" style="width: 100%">
            <el-table-column type="index" width="60" label="#" />
            <el-table-column prop="name" label="接口名称" min-width="180" show-overflow-tooltip></el-table-column>
            <el-table-column prop="method" label="方法" width="80"></el-table-column>
            <el-table-column prop="url" label="URL" min-width="220" show-overflow-tooltip></el-table-column>
            <el-table-column prop="response_code" label="响应码" width="100"></el-table-column>
            <el-table-column prop="duration_display" label="耗时" width="100">
              <template #default="scope">
                {{ scope.row.duration_display || (scope.row.duration_ms != null ? scope.row.duration_ms + 'ms' : '-') }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'pass' ? 'success' : 'danger'" size="small">
                  {{ scope.row.status === 'pass' ? '通过' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button type="text" @click="viewInterfaceDetail(scope.row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-card>

    <!-- 接口详情抽屉 -->
    <el-drawer
      :visible.sync="drawerVisible"
      :title="drawerTitle"
      size="60%"
      :close-on-click-modal="false"
      :append-to-body="true"
      class="interface-detail-drawer">
      <div class="drawer-body">
        <el-card shadow="never" class="detail-section">
          <div slot="header"><strong>请求信息</strong></div>
          <div class="json-block" v-if="currentInterface.request">
            <div class="json-header">
              <span class="json-label">{{ currentInterface.method || '-' }} {{ currentInterface.url || '-' }}</span>
            </div>
            <pre class="json-content">{{ formatJson(currentInterface.request_headers) }}</pre>
            <div class="json-subtitle" v-if="currentInterface.request_body">请求体</div>
            <pre class="json-content" v-if="currentInterface.request_body">{{ formatJson(currentInterface.request_body) }}</pre>
          </div>
          <div v-else class="empty-text">无请求数据</div>
        </el-card>
        <el-card shadow="never" class="detail-section mt-2">
          <div slot="header"><strong>响应信息</strong></div>
          <div class="json-block" v-if="currentInterface.response">
            <div class="json-header">
              <span class="json-label">HTTP {{ currentInterface.response_code }}</span>
              <span class="json-duration">{{ currentInterface.duration_display || (currentInterface.duration_ms != null ? currentInterface.duration_ms + 'ms' : '') }}</span>
            </div>
            <div class="json-subtitle">响应头</div>
            <pre class="json-content">{{ formatJson(currentInterface.response_headers) }}</pre>
            <div class="json-subtitle">响应体</div>
            <pre class="json-content">{{ formatJson(currentInterface.response_body) }}</pre>
          </div>
          <div v-else class="empty-text">无响应数据</div>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'testCaseResult',
  data () {
    return {
      resultData: {
        case_name: '',
        created_at: '',
        duration_ms: null,
        duration_display: '',
        conclusion: '',
        interfaces: [],
        dependency_chain: [],
        validation: null
      },
      loading: false,
      drawerVisible: false,
      drawerTitle: '',
      currentInterface: {}
    }
  },
  created () {
    this.fetchResult()
  },
  methods: {
    conclusionTagType (conclusion) {
      if (conclusion === 'pass' || conclusion === 'completed') return 'success'
      if (conclusion === 'fail' || conclusion === 'failed') return 'danger'
      return 'info'
    },
    conclusionText (conclusion) {
      const map = { pass: '测试通过', fail: '测试失败', completed: '已完成', failed: '失败' }
      return map[conclusion] || conclusion || '-'
    },
    goBack () {
      this.$router.push('/testCaseHistory')
    },
    viewInterfaceDetail (row) {
      this.currentInterface = row
      this.drawerTitle = (row.name || '接口') + ' 详情'
      this.drawerVisible = true
    },
    formatJson (data) {
      if (!data) return '-'
      try {
        const obj = typeof data === 'string' ? JSON.parse(data) : data
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        return String(data)
      }
    },
    fetchResult () {
      const executionId = this.$route.query.execution_id
      if (!executionId) {
        this.$message.error('缺少执行ID')
        return
      }
      this.loading = true
      this.$axios.get('/api/apicommon/apirun/get', { params: { execution_id: executionId } })
        .then(res => {
          const raw = res && res.data
          const data = raw && (raw.data || raw)

          // 接口执行结果列表
          const execResults = data.execution_results || {}
          const results = Array.isArray(execResults.results) ? execResults.results : []

          // 校验结果
          const validationRaw = data.validation_result || null

          // 推断结论
          let conclusion = data.status || ''
          if (conclusion === 'completed') {
            conclusion = validationRaw && validationRaw.passed ? 'pass' : 'fail'
          }

          this.resultData = {
            id: data.id,
            case_name: data.case_name || '-',
            created_at: data.create_time || data.created_at || '-',
            duration_ms: data.duration_seconds != null ? Math.round(data.duration_seconds * 1000) : null,
            duration_display: data.duration_seconds != null ? data.duration_seconds.toFixed(2) + 's' : '-',
            conclusion: conclusion,
            // 接口列表规范化
            interfaces: results.map(function (item) {
              return {
                name: item.api_name || item.name || '-',
                method: item.method || '',
                url: item.api_url || item.url || '',
                response_code: item.status_code != null ? item.status_code : (item.response_code != null ? item.response_code : '-'),
                duration_ms: item.duration_ms,
                duration_display: item.duration_ms != null ? (item.duration_ms / 1000).toFixed(2) + 's' : '-',
                status: item.success ? 'pass' : 'fail',
                request: item.request || null,
                response: item.response || null,
                request_headers: item.request ? item.request.headers : null,
                request_body: item.request ? item.request.body : null,
                response_headers: item.response ? item.response.headers : null,
                response_body: item.response ? item.response.body : null
              }
            }),
            // 统计信息
            total_interfaces: data.total_interfaces || execResults.total || results.length,
            success_count: data.success_count || execResults.success || 0,
            failed_count: data.failed_count || execResults.failed || 0,
            // 校验结果
            validation: validationRaw ? {
              conclusion: validationRaw.passed ? 'pass' : 'fail',
              summary: validationRaw.reason || '',
              detail: Array.isArray(validationRaw.failed_checks)
                ? validationRaw.failed_checks.map(function (c) { return '【' + c.api_name + '】预期: ' + c.expected + '；实际: ' + c.actual }).join('\n\n')
                : ''
            } : null,
            dependency_chain: Array.isArray(data.dependency_chain) ? data.dependency_chain : []
          }
        })
        .catch(() => {
          this.$message.error('加载执行结果失败')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.result-container {
  /* 使用 unified-container 类 */
}

.mr-1 {
  margin-right: 6px;
}

.mt-2 {
  margin-top: 16px;
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.summary-card,
.dependency-card,
.validation-card,
.interfaces-card {
  border: 1px solid #EBEEF5;
}

.validation-content {
  padding: 8px 0;
}

.validation-summary {
  font-size: 14px;
  color: #303133;
  line-height: 1.8;
}

.validation-detail {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.dependency-chain {
  padding: 16px 0;
}

/* Drawer styles */
.interface-detail-drawer >>> .el-drawer__body {
  padding: 20px;
  overflow-y: auto;
}

.drawer-body {
  padding: 0;
}

.detail-section {
  border: 1px solid #EBEEF5;
}

.detail-section >>> .el-card__header {
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #EBEEF5;
}

.detail-section >>> .el-card__body {
  padding: 16px;
}

.json-block {
  font-size: 13px;
}

.json-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.json-label {
  font-weight: 600;
  color: #409EFF;
}

.json-duration {
  color: #909399;
  font-size: 12px;
}

.json-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  margin: 12px 0 4px 0;
  padding-left: 4px;
  border-left: 3px solid #409EFF;
}

.json-content {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
}

.empty-text {
  text-align: center;
  color: #909399;
  padding: 32px 0;
  font-size: 14px;
}
</style>
