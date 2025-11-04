<template>
  <div class="aitestcase-container">
    <el-card class="mb-6">
      <div class="card-header">
        <h3 class="card-title">AI 测试用例文档</h3>
      </div>
      <div class="card-body">
        <el-form :inline="true" :model="searchForm" label-width="96px" class="search-form">
          <el-form-item label="项目名称">
            <el-input v-model="searchForm.project_name" placeholder="请输入项目名称" clearable style="width: 260px" />
          </el-form-item>
          <el-form-item label="文档名称">
            <el-input v-model="searchForm.doc_name" placeholder="请输入需求文档名" clearable style="width: 360px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch" :loading="listLoading">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetSearch" :disabled="listLoading">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card>
      <div class="card-body1">
        <el-table :data="docs" stripe size="small" v-loading="listLoading" style="width: 100%">
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="project_name" label="项目名称" min-width="220" />
          <el-table-column prop="doc_name" label="需求文档" min-width="320" show-overflow-tooltip />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'aitestcase',
  data () {
    return {
      searchForm: {
        project_name: '',
        doc_name: ''
      },
      listLoading: false,
      docs: []
    }
  },
  created () {
    this.fetchDocs()
  },
  methods: {
    handleSearch () {
      this.fetchDocs()
    },
    resetSearch () {
      this.searchForm.project_name = ''
      this.searchForm.doc_name = ''
      this.fetchDocs()
    },
    fetchDocs () {
      this.listLoading = true
      const params = {
        project_name: this.searchForm.project_name || undefined,
        doc_name: this.searchForm.doc_name || undefined
      }
      // 调用后端接口：/api/doc/aitestcase=1，并携带搜索参数
      this.$axios.get('/api/ai_job/get', { params })
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
          // 规范化字段
          this.docs = list.map(it => ({
            project_name: it.project_name || it.project || it.projectName || '',
            doc_name: it.doc_name || it.filename || it.name || ''
          }))
        })
        .catch(() => {
          this.$message.error('加载文档失败')
          this.docs = []
        })
        .finally(() => {
          this.listLoading = false
        })
    }
  }
}
</script>

<style scoped>
.mb-6 {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.card-body {
  padding-top: 8px;
}
.card-body1 {
  padding-top: 8px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
}
</style>
