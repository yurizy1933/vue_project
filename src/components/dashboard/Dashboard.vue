<template>
  <div class="dashboard-page" v-loading="loading">
    <section class="dashboard-hero">
      <div>
        <div class="hero-label">AI Test Platform</div>
        <h2>测试平台总览</h2>
        <p>集中查看项目、文档、AI生成任务、测试用例和接口执行情况。</p>
      </div>
      <div class="hero-actions">
        <span class="today-text">{{ todayText }}</span>
        <el-button type="primary" icon="el-icon-refresh" size="small" @click="fetchDashboard" :loading="loading">
          刷新
        </el-button>
      </div>
    </section>

    <el-alert
      v-if="errors.length"
      class="dashboard-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="'部分数据加载失败：' + errors.join('、')"
    />

    <section class="metric-grid">
      <div v-for="item in mainMetrics" :key="item.key" class="metric-card">
        <div class="metric-icon" :class="item.className">
          <i :class="item.icon"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">{{ item.label }}</div>
          <div class="metric-value">{{ displayNumber(item.value) }}</div>
        </div>
      </div>
    </section>

    <section class="dashboard-grid">
      <div class="panel-card overview-panel">
        <div class="panel-header">
          <div>
            <h3>运营概览</h3>
            <p>接口、执行与通过率</p>
          </div>
        </div>
        <div class="sub-metric-list">
          <div v-for="item in operationMetrics" :key="item.key" class="sub-metric">
            <div class="sub-metric-main">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div class="sub-metric-note">{{ item.note }}</div>
          </div>
        </div>
      </div>

      <div class="panel-card task-panel">
        <div class="panel-header">
          <div>
            <h3>AI任务状态</h3>
            <p>最近任务状态分布</p>
          </div>
          <el-tag size="small" type="info">共 {{ displayNumber(stats.jobCount) }} 个</el-tag>
        </div>
        <div class="job-status-list">
          <div v-for="item in jobStatusItems" :key="item.key" class="job-status-row">
            <div class="status-row-title">
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </div>
            <el-progress
              :percentage="item.percent"
              :stroke-width="8"
              :show-text="false"
              :color="item.color"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-grid lower-grid">
      <div class="panel-card recent-panel">
        <div class="panel-header">
          <div>
            <h3>最近执行</h3>
            <p>最新 5 条接口执行记录</p>
          </div>
          <el-button type="text" @click="go('/testCaseHistory')">查看全部</el-button>
        </div>
        <el-table
          v-if="executions.length"
          :data="executions"
          size="small"
          class="dashboard-table"
          @row-click="openExecution"
        >
          <el-table-column prop="case_name" label="用例名称" min-width="180" show-overflow-tooltip />
          <el-table-column label="状态" width="90">
            <template slot-scope="scope">
              <el-tag :type="executionTagType(scope.row.status, scope.row.failed_count)" size="small">
                {{ executionStatusText(scope.row.status, scope.row.failed_count) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration_display" label="耗时" width="90" />
          <el-table-column prop="create_time" label="执行时间" width="160" />
        </el-table>
        <el-empty v-else description="暂无执行记录" :image-size="88" />
      </div>

      <div class="panel-card quick-panel">
        <div class="panel-header">
          <div>
            <h3>快捷入口</h3>
            <p>常用工作台</p>
          </div>
        </div>
        <div class="quick-grid">
          <button v-for="item in quickActions" :key="item.path" class="quick-action" @click="go(item.path)">
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data () {
    return {
      loading: false,
      errors: [],
      stats: {
        projectCount: null,
        docCount: null,
        jobCount: null,
        testcaseCount: null,
        interfaceCount: null,
        executionCount: null
      },
      jobs: [],
      executions: [],
      quickActions: [
        { label: '项目管理', path: '/projectManagement', icon: 'fa fa-sliders' },
        { label: '文档管理', path: '/docManagement', icon: 'fa fa-file-text-o' },
        { label: '用例任务', path: '/aitestcase', icon: 'fa fa-tasks' },
        { label: '测试用例', path: '/testCaseManagement', icon: 'fa fa-list-alt' },
        { label: '接口管理', path: '/apiInterfaceManagement', icon: 'fa fa-cogs' },
        { label: '执行历史', path: '/testCaseHistory', icon: 'fa fa-history' }
      ]
    }
  },
  computed: {
    todayText () {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return year + '-' + month + '-' + day
    },
    mainMetrics () {
      return [
        { key: 'project', label: '项目数', value: this.stats.projectCount, icon: 'fa fa-folder-open-o', className: 'metric-blue' },
        { key: 'doc', label: '文档数', value: this.stats.docCount, icon: 'fa fa-file-text-o', className: 'metric-green' },
        { key: 'job', label: 'AI任务数', value: this.stats.jobCount, icon: 'fa fa-magic', className: 'metric-orange' },
        { key: 'case', label: '测试用例数', value: this.stats.testcaseCount, icon: 'fa fa-list-alt', className: 'metric-red' }
      ]
    },
    passRate () {
      if (!this.executions.length) return '--'
      const passed = this.executions.filter(item => {
        const failedCount = Number(item.failed_count || 0)
        return failedCount === 0 && item.status === 'completed'
      }).length
      return Math.round((passed / this.executions.length) * 100) + '%'
    },
    operationMetrics () {
      return [
        { key: 'interface', label: '接口数量', value: this.displayNumber(this.stats.interfaceCount), note: '已解析接口总数' },
        { key: 'execution', label: '执行记录', value: this.displayNumber(this.stats.executionCount), note: '累计接口执行次数' },
        { key: 'passRate', label: '最近通过率', value: this.passRate, note: '基于最近 5 条执行记录' }
      ]
    },
    jobStatusItems () {
      const counts = { 0: 0, 1: 0, 2: 0 }
      this.jobs.forEach(job => {
        const status = Number(job.job_status)
        if (counts[status] !== undefined) counts[status] += 1
      })
      const total = this.jobs.length || 0
      return [
        { key: 'pending', label: '待处理', count: counts[0], color: '#909399' },
        { key: 'processing', label: '处理中', count: counts[1], color: '#faad14' },
        { key: 'completed', label: '已完成', count: counts[2], color: '#52c41a' }
      ].map(item => {
        item.percent = total ? Math.round((item.count / total) * 100) : 0
        return item
      })
    }
  },
  created () {
    this.fetchDashboard()
  },
  methods: {
    fetchDashboard () {
      this.loading = true
      this.errors = []
      Promise.all([
        this.safeGet('/api/project/get', {}, '项目'),
        this.safeGet('/api/common/doc/get', {}, '文档'),
        this.safeGet('/api/testcase/ai_job/get', { page: 1, page_size: 100 }, 'AI任务'),
        this.safeGet('/api/testcase/get', { page: 1, page_size: 1 }, '测试用例'),
        this.safeGet('/api/apicommon/api_interface/get', { page: 1, page_size: 1 }, '接口'),
        this.safeGet('/api/apicommon/apirun/list', { page: 1, page_size: 5 }, '执行记录')
      ]).then(results => {
        this.applyDashboardData(results)
      }).finally(() => {
        this.loading = false
      })
    },
    safeGet (url, params, label) {
      return this.$axios.get(url, { params }).then(res => {
        return { ok: true, label: label, raw: res && res.data }
      }).catch(() => {
        return { ok: false, label: label, raw: null }
      })
    },
    applyDashboardData (results) {
      const projectResult = results[0]
      const docResult = results[1]
      const jobResult = results[2]
      const testcaseResult = results[3]
      const interfaceResult = results[4]
      const executionResult = results[5]

      this.errors = results.filter(item => !item.ok).map(item => item.label)

      const projects = this.extractList(projectResult.raw)
      const docs = this.extractList(docResult.raw)
      const jobs = this.extractList(jobResult.raw)
      const executions = this.extractList(executionResult.raw)

      this.jobs = jobResult.ok ? jobs : []
      this.executions = executionResult.ok ? executions : []
      this.stats.projectCount = projectResult.ok ? projects.length : null
      this.stats.docCount = docResult.ok ? this.extractTotal(docResult.raw, docs) : null
      this.stats.jobCount = jobResult.ok ? this.extractTotal(jobResult.raw, jobs) : null
      this.stats.testcaseCount = testcaseResult.ok ? this.extractTotal(testcaseResult.raw, this.extractList(testcaseResult.raw)) : null
      this.stats.interfaceCount = interfaceResult.ok ? this.extractTotal(interfaceResult.raw, this.extractList(interfaceResult.raw)) : null
      this.stats.executionCount = executionResult.ok ? this.extractTotal(executionResult.raw, executions) : null
    },
    extractList (raw) {
      if (Array.isArray(raw)) return raw
      if (raw && Array.isArray(raw.data)) return raw.data
      if (raw && Array.isArray(raw.list)) return raw.list
      return []
    },
    extractTotal (raw, list) {
      if (raw && raw.pagination && typeof raw.pagination.total === 'number') return raw.pagination.total
      if (raw && typeof raw.total === 'number') return raw.total
      return list.length
    },
    displayNumber (value) {
      return value === null || value === undefined ? '--' : value
    },
    executionTagType (status, failedCount) {
      if (status === 'completed' && Number(failedCount || 0) === 0) return 'success'
      if (status === 'failed' || Number(failedCount || 0) > 0) return 'danger'
      if (status === 'running') return 'warning'
      return 'info'
    },
    executionStatusText (status, failedCount) {
      if (status === 'completed' && Number(failedCount || 0) === 0) return '通过'
      if (status === 'failed' || Number(failedCount || 0) > 0) return '失败'
      if (status === 'running') return '执行中'
      return status || '-'
    },
    openExecution (row) {
      if (row && row.id) {
        this.$router.push({ path: '/testCaseResult', query: { execution_id: row.id } })
      }
    },
    go (path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  min-width: 0;
  text-align: left;
  color: var(--text-primary);
  padding: 4px;
}

.dashboard-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 26px 28px;
  background: linear-gradient(135deg, #172033 0%, #1e3a5f 68%, #0f766e 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.dashboard-hero::after {
  content: '';
  position: absolute;
  right: -80px;
  bottom: -120px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 42px solid rgba(255, 255, 255, 0.07);
}

.dashboard-hero > div {
  position: relative;
  z-index: 1;
}

.hero-label {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  color: #bfdbfe;
  background: rgba(255, 255, 255, 0.1);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 10px;
}

.dashboard-hero h2 {
  margin: 0;
  color: #fff;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 700;
}

.dashboard-hero p {
  margin: 8px 0 0;
  color: #dbeafe;
  font-size: 14px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.today-text {
  color: #e0f2fe;
  font-size: 14px;
  padding: 7px 10px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.1);
}

.dashboard-alert {
  margin-top: 16px;
  border-radius: var(--radius-lg);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.metric-card,
.panel-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

.metric-card::before,
.panel-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), #0f766e);
}

.metric-card {
  display: flex;
  align-items: center;
  min-height: 112px;
  padding: 20px;
  gap: 16px;
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: #cfe0f4;
  box-shadow: var(--shadow-lg);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.metric-blue { color: #337ecc; background: #ecf5ff; }
.metric-green { color: #529b2e; background: #f0f9eb; }
.metric-orange { color: #cf9236; background: #fdf6ec; }
.metric-red { color: #dd6161; background: #fef0f0; }

.metric-content {
  min-width: 0;
}

.metric-label {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  font-weight: 600;
}

.metric-value {
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  gap: 16px;
  margin-top: 16px;
}

.lower-grid {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
}

.panel-card {
  padding: 20px;
  min-width: 0;
}

.overview-panel {
  background:
    linear-gradient(180deg, rgba(248, 251, 255, 0.88) 0%, #fff 100%),
    linear-gradient(90deg, rgba(37, 99, 235, 0.06), rgba(15, 118, 110, 0.06));
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
}

.panel-header p {
  margin: 4px 0 0;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.5;
}

.sub-metric-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.sub-metric {
  padding: 16px;
  border-radius: var(--radius-lg);
  background: #f6f9fd;
  border: 1px solid var(--border-color-light);
}

.sub-metric-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sub-metric-main span,
.sub-metric-note {
  color: var(--text-secondary);
  font-size: 13px;
}

.sub-metric-main strong {
  color: #172033;
  font-size: 22px;
  line-height: 1.2;
}

.sub-metric-note {
  margin-top: 10px;
  color: var(--text-tertiary);
}

.job-status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-row-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.job-status-row {
  padding: 12px;
  border-radius: var(--radius-lg);
  background: #f7faff;
  border: 1px solid var(--border-color-light);
}

.status-row-title strong {
  color: var(--text-primary);
}

.dashboard-table {
  width: 100%;
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.dashboard-table >>> .el-table__row {
  cursor: pointer;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.quick-action {
  height: 76px;
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-lg);
  background: #f7faff;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: 13px;
}

.quick-action i {
  color: var(--primary-color);
  font-size: 20px;
}

.quick-action:hover {
  border-color: var(--primary-color);
  background: #eef5ff;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid,
  .lower-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .dashboard-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .metric-grid,
  .sub-metric-list,
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
