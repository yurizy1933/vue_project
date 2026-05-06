<template>
  <div class="execution-container unified-container">
    <el-card>
      <div class="action-bar unified-action-bar">
        <h3 class="card-title unified-card-title">用例执行</h3>
        <div style="flex:1"></div>
        <el-tag :type="statusTagType(execStatus)" size="medium" v-if="execStatus">{{ statusText(execStatus) }}</el-tag>
      </div>

      <div class="execution-body">
        <!-- 阶段一：配置确认 -->
        <div v-if="phase === 'config'" class="config-panel">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用例名称">{{ caseName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="用例类型">
              <el-tag type="primary" size="small">接口用例</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行步骤" :span="2">
              <pre class="config-pre">{{ steps || '-' }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="预期结果" :span="2">
              <div class="detail-text">{{ expected || '-' }}</div>
            </el-descriptions-item>
          </el-descriptions>
          <div class="config-url-section mt-2">
            <el-form>
              <el-form-item label="Base URL" required>
                <el-input v-model="baseUrl" placeholder="请输入API服务的Base URL，如 http://api.example.com">
                  <template #prepend>URL</template>
                </el-input>
              </el-form-item>
            </el-form>
          </div>
          <div class="action-section mt-2">
            <el-button type="primary" @click="startExecution" :disabled="!baseUrl">
              <i class="fa fa-play mr-1"></i>开始执行
            </el-button>
          </div>
        </div>

        <!-- 阶段二：执行中 -->
        <div v-if="phase === 'running'">
          <!-- 进度条 -->
          <div class="progress-section">
          <el-progress
            :percentage="progress.percent"
            :status="progress.status || undefined"
            :text-inside="false"
            :stroke-width="16"
          >
            <template #default>
              <span class="progress-text">{{ progress.message || '准备执行...' }}</span>
            </template>
          </el-progress>
          <div class="progress-label">{{ progress.message || '准备执行...' }}</div>
        </div>

        <!-- 依赖链 -->
        <el-card class="section-card mt-2" shadow="never" v-if="dependencies.length">
          <div slot="header" class="section-header">
            <span><i class="fa fa-link mr-1"></i>依赖链</span>
          </div>
          <div class="dependency-chain">
            <el-steps :active="currentDependencyIndex" direction="vertical" space="36px">
              <el-step
                v-for="(dep, idx) in dependencies"
                :key="idx"
                :title="dep.title || dep.name || (typeof dep === 'string' ? dep : '依赖节点')"
                :description="dep.description || ''"
                :status="dep.status === 'pass' ? 'success' : dep.status === 'fail' ? 'error' : dep.status === 'running' ? 'process' : 'wait'"
                :icon="dep.status === 'running' ? 'el-icon-loading' : ''"
              />
            </el-steps>
          </div>
        </el-card>

        <!-- 接口执行步骤 -->
        <el-card class="section-card mt-2" shadow="never">
          <div slot="header" class="section-header">
            <span><i class="fa fa-list-ol mr-1"></i>接口执行步骤</span>
          </div>
          <div class="steps-list">
            <div
              v-for="(step, idx) in apiSteps"
              :key="idx"
              class="step-item"
              :class="'step-' + step.status"
            >
              <div class="step-icon">
                <i v-if="step.status === 'pass'" class="fa fa-check-circle step-pass-icon"></i>
                <i v-else-if="step.status === 'fail'" class="fa fa-times-circle step-fail-icon"></i>
                <i v-else-if="step.status === 'running'" class="el-icon-loading step-running-icon"></i>
                <i v-else class="fa fa-circle-o step-pending-icon"></i>
              </div>
              <div class="step-content">
                <div class="step-title">
                  <span class="step-name">{{ step.name || ('步骤 ' + (idx + 1)) }}</span>
                  <el-tag
                    :type="step.status === 'pass' ? 'success' : step.status === 'fail' ? 'danger' : step.status === 'running' ? 'warning' : 'info'"
                    size="mini"
                  >
                    {{ stepStatusText(step.status) }}
                  </el-tag>
                </div>
                <div class="step-meta">
                  <span v-if="step.method || step.url" class="step-url">{{ step.method || '' }} {{ step.url || '' }}</span>
                  <span v-if="step.response_code" class="step-code">HTTP {{ step.response_code }}</span>
                  <span v-if="step.duration_ms != null" class="step-duration">{{ step.duration_ms }}ms</span>
                </div>
                <div class="step-message" v-if="step.message">{{ step.message }}</div>
              </div>
            </div>
            <!-- 空状态 -->
            <div v-if="!apiSteps.length" class="steps-empty">
              <i class="fa fa-inbox"></i>
              <span>等待接口执行...</span>
            </div>
          </div>
        </el-card>

        <!-- AI 校验结论 -->
        <el-card class="section-card mt-2" shadow="never" v-if="validation.conclusion">
          <div slot="header" class="section-header">
            <span><i class="fa fa-check-square-o mr-1"></i>AI 校验结论</span>
          </div>
          <el-alert
            :title="validation.conclusion === 'pass' ? '校验通过' : '校验未通过'"
            :type="validation.conclusion === 'pass' ? 'success' : 'error'"
            :description="validation.summary || ''"
            show-icon
            :closable="false"
          />
          <div class="validation-detail mt-2" v-if="validation.detail" v-html="validation.detail"></div>
        </el-card>

        <!-- 错误信息 -->
        <el-card class="section-card mt-2" shadow="never" v-if="errorMessage">
          <el-alert
            title="执行异常"
            :description="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />
        </el-card>

          <!-- 完成操作 -->
          <div class="action-section mt-3" v-if="execStatus === 'completed' || execStatus === 'failed'">
            <el-button type="primary" @click="viewFullReport" :disabled="!executionId">
              <i class="fa fa-file-text-o mr-1"></i>查看完整报告
            </el-button>
          </div>
        </div><!-- /running div -->
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'testCaseExecution',
  data () {
    return {
      phase: 'config', // config | running | done
      caseName: '',
      steps: '',
      expected: '',
      baseUrl: '',
      execStatus: '', // running | completed | failed
      executionId: null,
      progress: {
        percent: 0,
        status: '',
        message: '准备执行...'
      },
      currentDependencyIndex: -1,
      dependencies: [],
      apiSteps: [],
      validation: {
        conclusion: '',
        summary: '',
        detail: ''
      },
      errorMessage: '',
      abortController: null,
      buffer: '',
      caseId: null
    }
  },
  created () {
    const caseId = this.$route.query.case_id
    if (!caseId) {
      this.errorMessage = '缺少用例ID参数'
      return
    }
    this.caseName = this.$route.query.case_name || ''
    this.steps = this.$route.query.steps || ''
    this.expected = this.$route.query.expected || ''
    this.baseUrl = this.$route.query.base_url || ''
    this.caseId = caseId
  },
  beforeDestroy () {
    // 组件销毁时中断 fetch 请求
    if (this.abortController) {
      this.abortController.abort()
    }
  },
  methods: {
    startExecution () {
      if (!this.baseUrl) {
        this.$message.warning('请输入Base URL')
        return
      }
      this.phase = 'running'
      this.execStatus = 'running'
      this.abortController = new AbortController()

      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      }
      if (token) {
        headers['Authorization'] = 'Bearer ' + token
      }

      const body = {
        api_name: this.caseName,
        testpoint: this.steps,
        expectation: this.expected,
        base_url: this.baseUrl
      }

      fetch('/api/apicommon/apirun/execute', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        signal: this.abortController.signal
      }).then(response => {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ': ' + response.statusText)
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        this.buffer = ''

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              // 流结束，处理 buffer 中剩余数据
              if (this.buffer.trim()) {
                this.buffer += '\n\n'
                this.processBuffer()
              }
              return
            }
            const chunk = decoder.decode(value, { stream: true })
            this.buffer += chunk
            this.processBuffer()
            readStream()
          }).catch(err => {
            if (err.name !== 'AbortError') {
              console.error('Stream read error:', err)
              this.errorMessage = '读取执行流失败: ' + err.message
              this.execStatus = 'failed'
            }
          })
        }
        readStream()
      }).catch(err => {
        if (err.name === 'AbortError') {
          return
        }
        console.error('Execution request error:', err)
        this.errorMessage = '执行请求失败: ' + err.message
        this.execStatus = 'failed'
      })
    },

    processBuffer () {
      // 尝试多种 SSE 格式解析
      // 格式1（标准SSE）: event: xxx\ndata: {...}\n\n
      // 格式2（只有data）: data: {...}\n\n
      // 格式3（JSON行）: {...}\n
      const parts = this.buffer.split('\n\n')
      // 最后一个可能是不完整的，保留到下次处理
      this.buffer = parts.pop() || ''

      parts.forEach(part => {
        if (!part.trim()) return
        const lines = part.split('\n')
        let eventType = ''
        let dataStr = ''

        lines.forEach(line => {
          const trimmed = line.trim()
          if (trimmed.startsWith('event:')) {
            eventType = trimmed.substring(6).trim()
          } else if (trimmed.startsWith('data:')) {
            dataStr = trimmed.substring(5).trim()
          }
        })

        // 如果有 data 但没有 event，尝试从 JSON 中推断 event 类型
        if (dataStr && !eventType) {
          let data = null
          try {
            data = JSON.parse(dataStr)
          } catch (e) {
            // 不是 JSON，跳过
            return
          }
          // 优先使用 JSON 中的 event/type 字段（不用 data.status，因为值不匹配如 completed≠complete）
          eventType = data.event || data.type || ''
          if (!eventType && data.status === 'error') {
            eventType = 'error'
          }
          if (!eventType) {
            // 后端格式可能是 {type: 'step', data: {...}}，检查内层 data
            const inner = data.data || data
            // 从最具体的字段到最通用的字段推断事件类型
            if (inner.execution_id != null || inner.case_id != null) {
              eventType = 'complete'
            } else if (inner.conclusion) {
              eventType = 'validation'
            } else if (inner.chain || inner.current != null) {
              eventType = 'dependency'
            } else if (inner.api_name || inner.method || inner.url || inner.response_code != null || inner.duration_ms != null) {
              if (inner.response_code != null || inner.status === 'pass' || inner.status === 'fail') {
                eventType = 'interface_result'
              } else {
                eventType = 'interface_start'
              }
            } else if (inner.percent != null) {
              eventType = 'progress'
            } else if (inner.message) {
              eventType = 'progress'
            } else {
              console.log('Unknown SSE data format:', data)
              return
            }
          }
          this.handleEvent(eventType, data)
          return
        }

        if (!eventType || !dataStr) {
          // 尝试直接解析整段为 JSON（非标准 SSE 格式）
          const trimmedPart = part.trim()
          if (trimmedPart.startsWith('{')) {
            try {
              const data = JSON.parse(trimmedPart)
              eventType = data.event || data.type || ''
              if (eventType) {
                this.handleEvent(eventType, data)
              } else {
                console.log('Unknown SSE format (no event type):', trimmedPart.substring(0, 200))
              }
            } catch (e) {
              console.log('Non-JSON SSE chunk:', trimmedPart.substring(0, 200))
            }
          }
          return
        }

        let data = null
        try {
          data = JSON.parse(dataStr)
        } catch (e) {
          console.warn('SSE data parse error:', dataStr)
          return
        }

        this.handleEvent(eventType, data)
      })
    },

    handleEvent (eventType, data) {
      // 后端格式: {type: 'step', data: {message: '...'}}，实际数据在 data.data 中
      const payload = (data && data.data) || data
      switch (eventType) {
        case 'progress':
          this.progress.percent = payload.percent != null ? payload.percent : this.progress.percent
          this.progress.message = payload.message || this.progress.message
          if (payload.status) {
            this.progress.status = payload.status === 'error' ? 'exception' : ''
          }
          break

        case 'step':
          // 步骤消息: 更新进度条文字
          if (payload.message) {
            this.progress.message = payload.message
          }
          break

        case 'result':
          // 结果事件，分多种 phase: dependency / fill_data / 接口执行结果
          if (payload.phase === 'dependency' && payload.dependency) {
            // 依赖分析结果
            const dep = payload.dependency
            this.dependencies = Array.isArray(dep.chain) ? dep.chain : (Array.isArray(dep) ? dep : [dep])
            if (dep.current != null) {
              this.currentDependencyIndex = dep.current
            }
          } else if (payload.run_num != null && payload.api_name) {
            // 接口执行结果
            const step = {
              name: payload.api_name || '',
              method: payload.method || '',
              url: payload.api_url || payload.url || '',
              status: payload.success ? 'pass' : 'fail',
              response_code: payload.response_code != null ? payload.response_code : null,
              duration_ms: payload.duration_ms != null ? payload.duration_ms : null,
              message: payload.message || ''
            }
            // 按 run_num 索引更新，或追加
            const idx = payload.run_num - 1
            if (idx >= 0 && idx < this.apiSteps.length) {
              Object.assign(this.apiSteps[idx], step)
            } else {
              this.apiSteps.push(step)
            }
          } else if (payload.phase === 'fill_data') {
            this.progress.message = '测试数据填充完成'
          }
          break

        case 'step_complete':
          if (payload.message) {
            this.progress.message = payload.message
          }
          this.progress.percent = 100
          break

        case 'report':
          // 最终报告
          this.executionId = payload.case_id != null ? payload.case_id : (payload.execution_id != null ? payload.execution_id : null)
          this.execStatus = 'completed'
          this.progress.percent = 100
          this.progress.status = 'success'
          this.progress.message = '执行完成'
          // 用报告数据填充 apiSteps
          if (Array.isArray(payload.results)) {
            this.apiSteps = payload.results.map((r, i) => ({
              name: r.api_name || ('接口 ' + (i + 1)),
              method: r.method || '',
              url: r.api_url || r.url || '',
              status: r.success ? 'pass' : 'fail',
              response_code: r.response_code != null ? r.response_code : null,
              duration_ms: r.duration_ms != null ? r.duration_ms : null,
              message: r.message || r.error || ''
            }))
          }
          break

        case 'case_info':
          if (payload.name) {
            this.caseName = payload.name
          }
          break

        case 'dependency':
          this.dependencies = Array.isArray(payload.chain) ? payload.chain : (Array.isArray(payload) ? payload : [])
          if (payload.current != null) {
            this.currentDependencyIndex = payload.current
          }
          if (payload.current != null && this.dependencies[payload.current]) {
            this.dependencies[payload.current].status = 'running'
          }
          break

        case 'dependency_update':
          if (payload.index != null && this.dependencies[payload.index]) {
            Object.assign(this.dependencies[payload.index], payload)
          }
          break

        case 'interface_start':
          this.apiSteps.push({
            name: payload.name || '',
            method: payload.method || '',
            url: payload.url || '',
            status: 'running',
            response_code: null,
            duration_ms: null,
            message: ''
          })
          break

        case 'interface_result':
          if (payload.index != null && this.apiSteps[payload.index]) {
            Object.assign(this.apiSteps[payload.index], payload)
          } else {
            for (let i = this.apiSteps.length - 1; i >= 0; i--) {
              if (this.apiSteps[i].status === 'running') {
                Object.assign(this.apiSteps[i], payload)
                break
              }
            }
          }
          break

        case 'validation':
          this.validation = {
            conclusion: payload.conclusion || '',
            summary: payload.summary || '',
            detail: payload.detail || ''
          }
          break

        case 'complete':
          this.execStatus = payload.status || 'completed'
          this.executionId = payload.execution_id != null ? payload.execution_id : null
          this.progress.percent = 100
          this.progress.status = 'success'
          this.progress.message = '执行完成'
          break

        case 'error':
          this.errorMessage = payload.message || '执行过程发生错误'
          this.execStatus = 'failed'
          this.progress.status = 'exception'
          break

        default:
          // 尝试将未知事件数据展示到 apiSteps
          if (payload.name || payload.method || payload.url) {
            this.apiSteps.push({
              name: payload.name || '',
              method: payload.method || '',
              url: payload.url || '',
              status: payload.status || 'pending',
              response_code: payload.response_code != null ? payload.response_code : null,
              duration_ms: payload.duration_ms != null ? payload.duration_ms : null,
              message: payload.message || ''
            })
          }
          console.log('Unknown SSE event:', eventType, data)
      }
    },

    statusTagType (status) {
      if (status === 'completed') return 'success'
      if (status === 'running') return 'warning'
      if (status === 'failed') return 'danger'
      return 'info'
    },

    statusText (status) {
      const map = { running: '执行中', completed: '已完成', failed: '失败' }
      return map[status] || status
    },

    stepStatusText (status) {
      const map = { pass: '通过', fail: '失败', running: '执行中', pending: '等待' }
      return map[status] || (status || '等待')
    },

    viewFullReport () {
      if (this.executionId) {
        this.$router.push({ path: '/testCaseResult', query: { execution_id: this.executionId } })
      }
    }
  }
}
</script>

<style scoped>
.execution-container {
  /* 使用 unified-container 类 */
}

.mr-1 {
  margin-right: 6px;
}

.mt-2 {
  margin-top: 16px;
}

.mt-3 {
  margin-top: 24px;
}

.execution-body {
  padding: 8px 0;
}

.case-info {
  padding: 12px 0;
  font-size: 15px;
}

.info-label {
  color: #606266;
}

.info-value {
  color: #303133;
  font-weight: 600;
}

.progress-section {
  padding: 16px 0;
}

.progress-text {
  font-size: 13px;
  color: #606266;
}

.progress-label {
  text-align: center;
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
}

.section-card {
  border: 1px solid #EBEEF5;
}

.section-card >>> .el-card__header {
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #EBEEF5;
}

.section-header {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

/* Dependency chain */
.dependency-chain {
  padding: 8px 0;
}

/* API Steps */
.steps-list {
  padding: 8px 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.step-item:last-child {
  border-bottom: none;
}

.step-item:hover {
  background: #fafbfc;
}

.step-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 12px;
  margin-top: 2px;
}

.step-pass-icon {
  color: #67C23A;
  font-size: 20px;
}

.step-fail-icon {
  color: #F56C6C;
  font-size: 20px;
}

.step-running-icon {
  color: #E6A23C;
  font-size: 20px;
}

.step-pending-icon {
  color: #C0C4CC;
  font-size: 18px;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.step-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.step-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.step-url {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  color: #606266;
  word-break: break-all;
}

.step-code {
  color: #409EFF;
}

.step-duration {
  color: #909399;
}

.step-message {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.steps-empty {
  text-align: center;
  padding: 32px 0;
  color: #C0C4CC;
  font-size: 14px;
}

.steps-empty i {
  display: block;
  font-size: 36px;
  margin-bottom: 8px;
}

/* Validation */
.validation-detail {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

/* Config panel */
.config-panel {
  padding: 8px 0;
}

.config-pre {
  margin: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
  color: #303133;
}

.detail-text {
  line-height: 1.8;
  color: #303133;
}

.config-url-section {
  padding: 8px 0;
}

/* Action section */
.action-section {
  text-align: center;
  padding: 16px 0;
}
</style>
