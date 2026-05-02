<template>
    <div class="home-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <div class="logo">
            <i class="fa fa-robot text-primary mr-2"></i>
            <span>AI生成测试平台</span>
          </div>
        </div>
        <div class="header-right">
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
              <el-menu-item index="/projectPrdManagement">
                <i class="fa fa-file-text-o"></i>
                <span>需求文档</span>
              </el-menu-item>
              <el-menu-item index="/aitestcase">
                <i class="fa fa-file-text-o"></i>
                <span>用例任务</span>
              </el-menu-item>
            </el-submenu>
            <el-submenu index="ai-tools">
              <template #title>
                <i class="fa fa-magic"></i>
                <span>接口测试</span>
              </template>
              <el-menu-item index="/apiDocManagement">
                <i class="fa fa-file-text-o"></i>
                <span>接口文档管理</span>
              </el-menu-item>
              <el-menu-item index="/apiInterfaceManagement">
                <i class="fa fa-cogs"></i>
                <span>接口管理</span>
              </el-menu-item>
              <el-menu-item index="/testDataManagement">
                <i class="fa fa-database"></i>
                <span>测试数据管理</span>
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
              <el-menu-item index="/projectManagement">
                <i class="fa fa-sliders"></i>
                <span>项目管理</span>
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
              <el-breadcrumb-item :to="{ path: '/homepage' }">
                <i class="fa fa-home breadcrumb-icon"></i>
                首页
              </el-breadcrumb-item>
              <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="content-body">
            <router-view></router-view>
          </div>
        </el-main>
      </div>
      <!-- 页脚 -->
      <el-footer class="footer" style="height: 40px;">
        ©(:◎)≡ 2025 AI生成测试平台 | 版本 v1.0.0
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
      const titles = {
        'HomePage': '仪表盘',
        'CodeGeneration': '代码生成',
        'projectManagement': '项目管理',
        'UserManagement': '用户管理',
        'projectPrdManagement': '需求文档管理',
        'testCaseManagement': '测试用例',
        'aitestcase': '用例任务管理',
        'apiDocManagement': '接口文档管理',
        'apiInterfaceManagement': '接口管理',
        'testDataManagement': '测试数据管理'
      }
      this.pageTitle = titles[routeName] || '未知页面'
    }
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
  font-family: 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.header {
  background: linear-gradient(135deg, var(--gradient-primary-start) 0%, var(--gradient-primary-end) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-xl);
  height: 56px;
  color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 200;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 200px;
}

.logo {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: #fff;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo i {
  font-size: var(--font-size-xl);
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 100%;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid rgba(255,255,255,0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.05);
}

.username {
  margin-right: 4px;
  background: rgba(255,255,255,0.18);
  color: #fff;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.el-dropdown-link:hover {
  background: rgba(255,255,255,0.15);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) var(--spacing-lg);
}

.sidebar {
  background: #fff;
  border-right: 2px solid #e4e7ed;
  border-radius: 8px 0 0 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: var(--spacing-md) 0;
  min-width: 200px;
  max-width: 220px;
  transition: box-shadow 0.2s;
  position: relative;
  z-index: 100;
}

.el-menu-vertical-demo {
  border-right: none;
  background: transparent;
}

/* First level menu styles */
.el-menu-vertical-demo > .el-menu-item,
.el-menu-vertical-demo > .el-submenu > .el-submenu__title {
  border-radius: 8px !important;
  margin: 6px var(--spacing-sm) !important;
  transition: all 0.2s !important;
  font-weight: 600 !important;
  color: #2c3e50 !important;
  font-size: 16px;
  text-align: right;
  justify-content: flex-end;
  padding-right: 16px !important;
  padding-left: 14px !important;
  display: flex;
  flex-direction: row;
  border: 1px solid transparent;
  box-shadow: none;
  min-height: 44px;
  line-height: 44px;
}

.el-menu-vertical-demo > .el-menu-item span,
.el-menu-vertical-demo > .el-submenu > .el-submenu__title span {
  margin-left: 10px;
  letter-spacing: 0.3px;
}

/* Icon position adjustment */
.el-menu-vertical-demo > .el-menu-item i,
.el-menu-vertical-demo > .el-submenu > .el-submenu__title i {
  margin-right: auto;
  margin-left: 0;
  font-size: 16px !important;
  width: 22px;
  text-align: center;
  opacity: 0.85;
  transition: all 0.2s;
}

.el-menu-vertical-demo > .el-menu-item:hover,
.el-menu-vertical-demo > .el-submenu > .el-submenu__title:hover {
  background: #f0f2f5 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  border-color: #cfd8dc !important;
  transform: translateX(-3px);
}

.el-menu-vertical-demo > .el-menu-item:hover i,
.el-menu-vertical-demo > .el-submenu > .el-submenu__title:hover i {
  opacity: 1;
  transform: scale(1.1);
  color: var(--gradient-primary-start);
}

.el-menu-vertical-demo > .el-menu-item.is-active {
  background: linear-gradient(135deg, var(--gradient-primary-start) 0%, var(--gradient-primary-end) 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-color: #0a58ca !important;
  transform: translateX(-5px);
  font-weight: 700 !important;
}

.el-menu-vertical-demo > .el-menu-item.is-active i {
  color: #fff !important;
  transform: scale(1.15);
  opacity: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Second level menu wrapper */
.el-menu-vertical-demo .el-submenu .el-menu {
  background: #f8f9fa !important;
  border-radius: 8px;
  margin: 4px 0;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.04);
  padding: 8px 0;
  border: 1px solid #e9ecef;
  position: relative;
}

/* Second level menu front divider */
.el-menu-vertical-demo .el-submenu .el-menu::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #9bb1de, #9fe27f);
  border-radius: 0 2px 2px 0;
}

/* Second level menu items */
.el-menu-vertical-demo .el-submenu .el-menu-item {
  position: relative;
  margin-left: 0 !important;
  padding-left: 40px !important;
  font-weight: 400;
  font-size: 13px;
  text-align: right;
  justify-content: flex-end;
  padding-right: 14px !important;
  display: flex;
  flex-direction: row;
  border-radius: 6px;
  transition: all 0.15s !important;
  margin: 3px 10px !important;
  border: 1px solid transparent;
  min-height: 38px;
  line-height: 38px;
}

/* Second level menu icon position adjustment */
.el-menu-vertical-demo .el-submenu .el-menu-item i {
  margin-right: auto;
  margin-left: 0;
  font-size: 13px !important;
  width: 18px;
  text-align: center;
  color: #8a8a8a;
  transition: all 0.2s;
}

/* Second level menu hover effect */
.el-menu-vertical-demo .el-submenu .el-menu-item:hover {
  background: rgba(13, 110, 253, 0.08) !important;
  border-color: rgba(13, 110, 253, 0.15) !important;
  transform: translateX(-2px);
}

.el-menu-vertical-demo .el-submenu .el-menu-item:hover i {
  color: var(--gradient-primary-start);
  transform: scale(1.1);
}

/* Second level menu active state */
.el-menu-vertical-demo .el-submenu .el-menu-item.is-active {
  background: rgba(64, 158, 255, 0.1) !important;
  color: var(--primary-color) !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15) !important;
  transform: translateX(-3px);
  border-color: rgba(64, 158, 255, 0.25) !important;
}

.el-menu-vertical-demo .el-submenu .el-menu-item.is-active i {
  color: #9bb1de !important;
  transform: scale(1.15);
}

.el-menu-vertical-demo .el-submenu .el-menu-item.is-active::after {
  content: '';
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #9bb1de;
  box-shadow: 0 0 10px rgba(13, 110, 253, 0.7);
}

.el-menu-vertical-demo .el-submenu .el-menu-item::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #9bb1de;
  opacity: 0.3;
}

.el-menu-vertical-demo .el-submenu .el-menu-item.is-active::before,
.el-menu-vertical-demo .el-submenu .el-menu-item:hover::before {
  background: #9bb1de;
  opacity: 1;
}

/* Second level menu background when first level menu is active */
.el-menu-vertical-demo > .el-submenu.is-opened > .el-menu {
  background: #f8f9fa !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

/* Expanded menu title styles */
.el-menu-vertical-demo > .el-submenu.is-opened > .el-submenu__title {
  background: rgba(13, 110, 253, 0.1) !important;
  border-color: #c5cbe6 !important;
}

.el-menu-vertical-demo > .el-submenu.is-opened > .el-submenu__title i {
  color: var(--gradient-primary-start);
  transform: scale(1.1);
  opacity: 1;
}

/* Submenu expansion indicator */
.el-menu-vertical-demo .el-submenu__icon-arrow {
  transition: transform var(--transition-base) !important;
  font-size: 12px !important;
  color: #6c757d;
  margin-right: 8px !important;
}

.el-menu-vertical-demo .el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
  transform: rotate(-90deg) !important;
  color: var(--gradient-primary-start);
}

/* Menu item separator effect */
.el-menu-vertical-demo > .el-submenu:not(:last-child) .el-menu {
  margin-bottom: 8px;
}

.el-menu-vertical-demo > .el-menu-item:not(:last-child) {
  margin-bottom: 4px;
}

.content {
  flex: 1;
  padding: 0;
  background: transparent;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.content-header {
  margin-bottom: 0;
  display: flex;
  align-items: center;
  padding: 16px var(--spacing-xl);
  background: linear-gradient(to bottom, #fafbfc 0%, #fff 100%);
  border-bottom: 1px solid #e8e9eb;
  border-radius: 8px 8px 0 0;
  min-height: 48px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  position: relative;
}

.content-header::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #9bb1de, #9fe27f);
  opacity: 0;
  transition: opacity 0.3s;
}

.content-header:hover::before {
  opacity: 1;
}

/* Divider between breadcrumb and title */
.breadcrumb-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, #e9ecef, transparent);
  margin: 16px 0;
}

/* Light gray separator below menu bar */
.menu-bottom-separator {
  width: 100%;
  height: 1px;
  background: #e9ecef;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  position: relative;
}

.menu-bottom-separator::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(to right, #9bb1de, #9fe27f);
  border-radius: 1px;
}

.content-body {
  background: #fff;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;
  border: 1px solid #e4e7ed;
  position: relative;
  overflow-y: auto;
  padding-bottom: 48px;
}

/* Content area top separator */
.content-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, #f0f0f0 0%, #e8e8e8 50%, #f0f0f0 100%);
  z-index: 1;
}

.breadcrumb-left {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6c757d;
  font-weight: 400;
  letter-spacing: 0.3px;
  flex: 1;
}

/* Breadcrumb icon styles */
.breadcrumb-icon {
  margin-right: 6px;
  font-size: 12px;
  color: #6c757d;
  transition: transform 0.2s;
}

/* Breadcrumb item styles */
.el-breadcrumb__item .el-breadcrumb__inner {
  color: #6c757d !important;
  font-weight: 400;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

/* Breadcrumb clickable item hover effect */
.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner:hover {
  color: #9bb1de !important;
  background: rgba(13, 110, 253, 0.08);
  text-decoration: none;
  transform: translateY(-1px);
}

.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner:hover .breadcrumb-icon {
  color: var(--gradient-primary-start);
  transform: scale(1.15);
}

/* Breadcrumb separator styles */
.el-breadcrumb__separator {
  color: #adb5bd !important;
  font-size: 11px;
  margin: 0 8px !important;
}

/* Breadcrumb last item (current page) styles */
.el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: #9bb1de !important;
  font-weight: 600;
  font-size: 14px;
  background: rgba(13, 110, 253, 0.08);
  padding: 4px 10px;
}

.el-breadcrumb__item:last-child .el-breadcrumb__inner .breadcrumb-icon {
  color: var(--gradient-primary-start);
  font-size: 13px;
}

.footer {
  text-align: center;
  padding: var(--spacing-sm) 0;
  color: #8a8a8a;
  font-size: 13px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
  line-height: var(--line-height-base);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header {
    padding: 0 var(--spacing-md);
  }

  .main-content {
    flex-direction: column;
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .sidebar {
    border-radius: var(--radius-md);
    box-shadow: none;
    padding: 0;
    min-width: 100%;
    max-width: 100%;
  }

  .content {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .content-header {
    padding: var(--spacing-md);
  }

  .search-container {
    padding: var(--spacing-lg);
  }
}
</style>
