<template>
    <div class="home-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-flex">
          <div class="logo">
            <i class="fa fa-robot text-primary mr-2"></i>
            <span>AI生成测试平台</span>
          </div>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <img src="https://picsum.photos/32/32" alt="用户头像" class="avatar">
                <span class="username">管理员</span>
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <!-- 主体内容 -->
      <div class="main-content">
        <!-- 侧边栏 -->
        <el-aside class="sidebar" width="220px">
          <el-menu
            :default-active="activeMenu"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            router
          >
            <el-menu-item index="/homepage">
              <i class="fa fa-home"></i>
              <span slot="title">仪表盘</span>
            </el-menu-item>
            <el-submenu index="ai-cases">
              <template #title>
                <i class="fa fa-magic"></i>
                <span>功能测试</span>
              </template>
              <el-menu-item index="/projectManagement">
                <i class="fa fa-file-text-o"></i>
                <span>需求管理</span>
              </el-menu-item>
              <el-menu-item index="/testCaseManagement">
                <i class="fa fa-file-text-o"></i>
                <span>测试用例</span>
              </el-menu-item>
            </el-submenu>
            <el-submenu index="ai-tools">
              <template #title>
                <i class="fa fa-magic"></i>
                <span>接口测试</span>
              </template>
              <el-menu-item index="/docManagement">
                <i class="fa fa-file-text-o"></i>
                <span>需求管理</span>
              </el-menu-item>
              <el-menu-item index="/docManagement">
                <i class="fa fa-file-text-o"></i>
                <span>测试执行</span>
              </el-menu-item>
            </el-submenu>
            <el-submenu index="system">
              <template #title>
                <i class="fa fa-cog"></i>
                <span>系统管理</span>
              </template>
              <el-menu-item index="/system-settings">
                <i class="fa fa-sliders"></i>
                <span>系统设置</span>
              </el-menu-item>
              <el-menu-item index="/user-management">
                <i class="fa fa-users"></i>
                <span>用户管理</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 内容区域 -->
        <el-main class="content">
          <div class="content-header">
            <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb-left">
              <el-breadcrumb-item :to="{ path: '/homepage' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
            <h1 v-if="pageTitle !== '仪表盘'" class="page-title">{{ pageTitle }}</h1>
          </div>
          <div class="content-body">
            <router-view></router-view>
          </div>
        </el-main>
      </div>
      <!-- 页脚 -->
      <el-footer class="footer">
        © 2025 AI生成测试平台 | 版本 v1.0.0
      </el-footer>
    </div>
  </template>

<script>
export default {
  name: 'HomePage',
  data () {
    return {
      activeMenu: this.$route.path,
      pageTitle: '仪表盘'
    }
  },
  watch: {
    $route (to) {
      this.activeMenu = to.path
      this.setPageTitle(to.name)
    }
  },
  created () {
    this.setPageTitle(this.$route.name)
  },
  methods: {
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    },
    handleCommand (command) {
      if (command === 'logout') {
        localStorage.removeItem('token')
        this.$router.push('/login')
      }
    },
    setPageTitle (routeName) {
      console.log(routeName)
      const titles = {
        'HomePage': '仪表盘',
        'TextGeneration': '文本生成',
        'ImageGeneration': '图像生成',
        'CodeGeneration': '代码生成',
        'SystemSettings': '系统设置',
        'UserManagement': '用户管理',
        'projectManagement': '项目管理',
        'testCaseManagement': '测试用例'
      }
      this.pageTitle = titles[routeName] || '未知页面'
    }
  }
}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap');
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f6fa;
  font-family: 'Roboto', 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
.header {
  background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
  box-shadow: none;
  border-bottom: 1.5px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  height: 64px;
  color: #fff;
}
.logo {
  font-size: 22px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  letter-spacing: 2px;
}
.logo i {
  font-size: 28px;
  margin-right: 10px;
  color: #fff;
}
.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(33,150,243,0.15);
}
.username {
  margin-right: 8px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 16px;
  padding: 2px 14px;
  font-size: 15px;
  font-weight: 500;
}
.el-dropdown-link {
  display: flex;
  align-items: center;
}
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.sidebar {
  background: #fff;
  border-right: none;
  border-radius: 0 18px 18px 0;
  box-shadow: 4px 0 24px -8px rgba(33,150,243,0.18), 1.5px 0 0 #e0e0e0;
  padding-top: 16px;
  min-width: 210px;
  max-width: 220px;
  transition: box-shadow 0.2s;
  z-index: 2;
}
.el-menu-vertical-demo {
  border-right: none;
  background: transparent;
}
.el-menu-item, .el-submenu__title {
  border-radius: 8px !important;
  margin: 4px 8px !important;
  transition: background 0.2s, box-shadow 0.2s;
  font-weight: 500;
  color: #333 !important;
  position: relative;
  overflow: hidden;
}
.el-menu-item:hover, .el-submenu__title:hover {
  background: #e3f2fd !important;
  box-shadow: 0 2px 8px rgba(33,150,243,0.08);
}
.el-menu-item.is-active {
  background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 16px rgba(33,150,243,0.12);
}
.el-menu-item.is-active::after, .el-menu-item:hover::after {
  content: '';
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(33,150,243,0.08);
  pointer-events: none;
  border-radius: 8px;
  z-index: 1;
  animation: ripple 0.4s;
}
@keyframes ripple {
  0% { opacity: 0.2; }
  100% { opacity: 0; }
}
.content {
  flex: 1;
  padding: 32px 24px;
  background: transparent;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
.content-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin-bottom: 0;
  letter-spacing: 1px;
  margin-left: 24px;
}
.content-body {
  background: #fff;
  border-radius: 16px;
  /* padding: 32px 24px; */
  box-shadow: 0 4px 24px rgba(33,150,243,0.10);
  min-height: 300px;
  transition: box-shadow 0.2s;
}
.content-body:hover {
  box-shadow: 0 8px 32px rgba(33,150,243,0.16);
}
.footer {
  text-align: center;
  padding: 12px 0 0px 0;
  color: #90a4ae;
  font-size: 14px;
  border-top: 1px solid #e0e0e0;
  background: transparent;
  letter-spacing: 1px;
}
@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }
  .sidebar {
    border-radius: 0 0 18px 18px;
    box-shadow: none;
    padding-top: 0;
    min-width: 100vw;
    max-width: 100vw;
  }
  .content {
    padding: 16px 4vw;
  }
  .content-body {
    padding: 16px 2vw;
  }
}
@media (max-width: 600px) {
  .header {
    padding: 0 8px;
    height: 52px;
  }
  .logo {
    font-size: 16px;
  }
  .content-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .page-title {
    font-size: 20px;
  }
}
/* 一级菜单加黑加粗，仅作用于一级 */
.el-menu-vertical-demo > .el-menu-item,
.el-menu-vertical-demo > .el-submenu > .el-submenu__title {
  font-weight: 700 !important;
  color: #111 !important;
  font-size: 16px;
}
/* 一级菜单下二级菜单整体包裹 */
.el-menu-vertical-demo .el-submenu .el-menu {
  background: #f5fafd !important;
  border-radius: 8px;
  margin: 2px 0 8px 0;
  box-shadow: 0 2px 8px rgba(33,150,243,0.04);
  padding: 4px 0 4px 0;
}
/* 二级菜单左侧主色竖线 */
.el-menu-vertical-demo .el-submenu .el-menu-item {
  position: relative;
  margin-left: 24px !important;
  padding-left: 32px !important;
  font-weight: 400;
  font-size: 15px;
}
.el-menu-vertical-demo .el-submenu .el-menu-item::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
  opacity: 0.18;
}
/* 二级菜单激活/悬浮时竖线高亮 */
.el-menu-vertical-demo .el-submenu .el-menu-item.is-active::before,
.el-menu-vertical-demo .el-submenu .el-menu-item:hover::before {
  background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
  opacity: 0.7;
}
/* 一级菜单激活时，二级菜单包裹底色高亮 */
.el-menu-vertical-demo > .el-submenu.is-opened > .el-menu {
  background: #e3f2fd !important;
  box-shadow: 0 4px 16px rgba(33,150,243,0.08);
}
.header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}
.breadcrumb-left {
  display: flex;
  align-items: center;
  background: transparent;
  padding: 0;
  font-size: 15px;
  color: #90a4ae;
}
.el-breadcrumb__item .el-breadcrumb__inner {
  color: #90a4ae !important;
  font-weight: 400;
}
.el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%) !important;
  font-weight: 500;
}
</style>
