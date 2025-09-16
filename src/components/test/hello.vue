<template>
    <div id="app">
        <div>
            <!-- 不同类型的按钮 -->
            <el-button>默认按钮</el-button>
            <el-button type="primary">主要按钮</el-button>
            <el-button type="success">成功按钮</el-button>
            <el-button type="info">信息按钮</el-button>
            <el-button type="warning">警告按钮</el-button>
            <el-button type="danger">危险按钮</el-button>
            <!-- 不同尺寸的按钮 -->
            <el-button size="small">小尺寸按钮</el-button>
            <el-button>默认尺寸按钮</el-button>
            <el-button size="large">大尺寸按钮</el-button>
            <!-- 图标按钮 -->
            <el-button icon="el-icon-search">搜索按钮</el-button>
            <el-button icon="el-icon-edit">编辑按钮</el-button>
            <el-button icon="el-icon-delete">删除按钮</el-button>
            <!-- 带图标的文字按钮 -->
            <el-button type="primary" icon="el-icon-check">确定</el-button>
            <el-button type="danger" icon="el-icon-close">关闭</el-button>
            <el-button :type="type_msg" class="buttona">{{msg}}</el-button>
            <el-button>1111</el-button>
            <el-button>333</el-button>
        </div>
        <div>
            <!-- 基础的上下布局 -->
            <el-container>
                <el-header>Header</el-header>
                <el-main>Main</el-main>
                <el-footer>Footer</el-footer>
            </el-container>
            <!-- 左右布局 -->
            <el-container>
                <el-aside width="200px">Aside</el-aside>
                <el-main>Main</el-main>
            </el-container>
            <!-- 复杂的嵌套布局 -->
            <el-container>
                <el-header>Header</el-header>
                <el-container>
                    <el-aside width="20px">Aside</el-aside>
                    <el-main>
                        <el-container>
                            <el-header>Inner Header</el-header>
                            <el-main>Inner Main</el-main>
                        </el-container>
                    </el-main>
                </el-container>
                <el-footer>Footer</el-footer>
            </el-container>
        </div>
    </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      type_msg: 'primary'
    }
  }
}
</script>

<style>
/* .el-button { */
    /* background-color: blueviolet; */
    /* border-color: black; */
/* } */
.buttona {
    background-color: pink;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.el-header,
.el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  line-height: 200px
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  line-height: 160px
}
</style>
