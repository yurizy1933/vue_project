<template>
  <div class="login-bg">
    <div class="login-container">
      <div class="login-header">
        <!-- <img src="@/assets/logo.png" class="login-logo" alt="logo" /> -->
        <span class="login-title">AI测试平台</span>
      </div>
      <el-card class="login-card">
        <div slot="header" class="clearfix">
          <h3 class="text-center">用户登录</h3>
        </div>
        <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="0">
          <el-form-item prop="username">
            <el-input
              prefix-icon="el-icon-user"
              v-model="loginForm.username"
              placeholder="请输入用户名"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" placeholder="请输入密码" show-password>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" class="w-full login-btn"  @click.native.prevent="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-alert
        v-if="errorMessage"
        :title="errorTitle"
        type="error"
        show-icon
        :closable="false"
        class="mt-4"
      >
        <template #content>
          <p>{{ errorMessage }}</p>
        </template>
      </el-alert>
      <div class="login-footer">© 2025 AI测试平台</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        username: '',
        password: '',
        remember: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      },
      loading: false,
      errorMessage: '',
      errorTitle: '登录失败'
    }
  },
  methods: {
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$axios.post('/api/login', this.loginForm)
            .then(response => {
              localStorage.setItem('auth_token', response.data.token)
              this.$message.success('登录成功')
              this.$router.push({ name: 'Home' })
            })
            .catch(error => {
              console.log(error)
              this.errorMessage = '登录请求失败'
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
<style scoped>
.login-bg {
  min-height: 100vh;
  min-width: 100vw;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}
.login-logo {
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
}
.login-title {
  font-size: 22px;
  font-weight: bold;
  color: #409EFF;
  letter-spacing: 2px;
}
.login-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  width: 100%;
  margin-bottom: 16px;
}
.el-form-item {
  margin-bottom: 22px;
}
.login-btn {
  width: 100%;
  font-size: 16px;
  height: 40px;
  border-radius: 20px;
}
.login-footer {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 24px;
}
.mt-4 {
  margin-top: 16px;
}
.text-center {
  text-align: center;
}
@media (max-width: 500px) {
  .login-container {
    max-width: 95vw;
    padding: 24px 4vw 12px 4vw;
  }
  .login-card {
    padding: 0 2vw;
  }
}
</style>
