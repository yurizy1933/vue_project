<template>
    <div>
        <div>
            <el-alert title="成功提示的文案" type="success" description="文字说明文字说明文字说明文字说明文字说明文字说明" show-icon></el-alert>
            <el-alert title="带辅助性文字介绍" type="success" escription="这是一句绕口令：黑灰化肥会挥发发灰黑化肥挥发；灰黑化肥会挥发发黑灰化肥发挥。 黑灰化肥会挥发发灰黑化肥黑灰挥发化为灰……"></el-alert>
            <el-alert title="成功提示的文案" type="success" center show-icon> </el-alert>
            <!-- 不同类型的按钮 -->
            <el-button>默认按钮</el-button>
            <el-button type="primary" @click="click_button_one" >{{button_name}}</el-button>
            <el-button type="success">成功按钮</el-button>
            <el-button type="info">信息按钮</el-button>
            <el-button type="warning" @click="click_button_two">警告按钮</el-button>
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
        <!--输入框-->
        <div>
            <el-input v-model="inputMsg" placeholder="请输入内容"></el-input>
            <el-input placeholder="禁用输入框" v-model="input" :disabled="true"></el-input>
            <el-input placeholder="可清空输入框" v-model="input" clearable></el-input>
            <el-input placeholder="请输入密码" v-model="input" show-password></el-input>
            <el-input placeholder="可清空输入框" v-model="input" clearable></el-input>
            <div class="demo-input-suffix">
                <el-input placeholder="请选择日期" suffix-icon="el-icon-date" v-model="input1"></el-input>
                <el-input placeholder="请输入内容" prefix-icon="el-icon-search" v-model="input2"></el-input>
            </div>
            <div class="demo-input-suffix">
                <el-input placeholder="请选择日期" v-model="input3">
                    <i slot="suffix" class="el-input__icon el-icon-date"></i>
                </el-input>
                <el-input placeholder="请输入内容"  v-model="input4">
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
            </div>
            <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="textarea"> </el-input>
            <el-input type="textarea" autosize placeholder="请输入内容" v-model="textarea1"></el-input>
            <div style="margin: 20px 0;"></div>
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" v-model="textarea2"></el-input>
        </div>
        <!-- 单选框 -->
        <div class="buttona">
            <el-radio v-model="radio" label="1">备选项1</el-radio>
            <el-radio disabled  v-model="radio" label="2">禁用备选项2</el-radio>
            <el-radio-group v-model="radio">
                <el-radio :label="3">备选项</el-radio>
                <el-radio :label="6">备选项</el-radio>
                <el-radio :label="9">备选项</el-radio>
            </el-radio-group>
            <div style="margin-top: 20px">
                <el-radio-group v-model="radio2" size="medium">
                    <el-radio-button label="上海" ></el-radio-button>
                    <el-radio-button label="北京"></el-radio-button>
                    <el-radio-button label="广州"></el-radio-button>
                    <el-radio-button label="深圳"></el-radio-button>
                </el-radio-group>
            </div>
        </div>
        <div>
            <el-select v-model="value" placeholder="请选择" :loading="loading">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <!--禁用选项 -->
            <el-select v-model="value" placeholder="请选择">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>
            </el-select>
            <!--禁用选择框 -->
            <el-select v-model="value" disabled placeholder="请选择">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>
            </el-select>
            <!--多选 -->
            <el-select v-model="value" clearable multiple placeholder="请选择">
                <el-option  v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <!--可搜索 -->
            <el-select v-model="value" clearable filterable multiple placeholder="请选择">
                <el-option  v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <!--可清空 -->
            <el-select v-model="value" clearable placeholder="请选择">
                <el-option  v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
        </div>
        <div>
            <span class="demonstration">页数较少时的效果</span>
            <el-pagination layout="prev, pager, next" :total="50"> </el-pagination>
            <span class="demonstration">大于 7 页时的效果</span>
            <el-pagination layout="prev, pager, next" :total="1000"></el-pagination>
            <el-pagination background layout="prev, pager, next" :total="1000"></el-pagination>
            <el-pagination :page-size="20" :pager-count="11" layout="prev, pager, next" :total="1000"></el-pagination>
            <el-pagination small layout="prev, pager, next" :total="50" @current-change="click_button_three"></el-pagination>
        </div>
        <div>
            <el-table stripe border :row-class-name="tableRowClassName"  max-height="250"   height="250"
            :data="tableData">
                <el-table-column sortable prop="id" label="ID" width="80" ></el-table-column>
                <el-table-column prop="name" label="名字" width="120"></el-table-column>
                <el-table-column prop="sex" label="性别" width="120"></el-table-column>
                <el-table-column prop="address" label="地址" width="120"></el-table-column>
                <el-table-column label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button @click="deleteRow(scope.$index, scope.row)" type="text" size="small">
                            移除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div>
            <el-progress :percentage="proData" status="success"></el-progress>
            <el-button type="success" @click="clickProgress">更改百分比</el-button>
        </div>
        <div>
            <el-button type="text" @click="dialogVisible = true">点击打开 Dialog</el-button>
            <el-dialog title="提示" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
                <span>这是一段信息</span>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                </span>
            </el-dialog>
        </div>
        <div>
            <!-- Table -->
            <el-button type="text" @click="dialogTableVisible = true">打开嵌套表格的 Dialog</el-button>
            <el-dialog title="收货地址" :visible.sync="dialogTableVisible">
                <el-table :data="gridData">
                    <el-table-column property="date" label="日期" width="150"></el-table-column>
                    <el-table-column property="name" label="姓名" width="200"></el-table-column>
                    <el-table-column property="address" label="地址"></el-table-column>
                </el-table>
            </el-dialog>
            <!-- Form -->
            <el-button type="text" @click="dialogFormVisible = true">打开嵌套表单的 Dialog</el-button>
            <el-dialog title="收货地址" :visible.sync="dialogFormVisible">
                <el-form :model="form">
                    <el-form-item label="活动名称" :label-width="formLabelWidth">
                        <el-input v-model="form.name" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="活动区域" :label-width="formLabelWidth">
                        <el-select v-model="form.region" placeholder="请选择活动区域">
                            <el-option label="区域一" value="shanghai"></el-option>
                            <el-option label="区域二" value="beijing"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
                </div>
            </el-dialog>
        </div>
        <div>
            <el-form ref="formsubmit" :model="formsubmit" label-width="80px">
                <el-form-item label="活动名称">
                    <el-input v-model="formsubmit.name"></el-input>
                </el-form-item>
                <el-form-item label="活动区域">
                    <el-select v-model="formsubmit.region" placeholder="请选择活动区域">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        <el-option label="区域一" value="shanghai"></el-option>
                        <el-option label="区域二" value="beijing"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="活动时间">
                    <el-col :span="11">
                        <el-date-picker type="date" placeholder="选择日期" v-model="formsubmit.date1" style="width: 100%;"></el-date-picker>
                    </el-col>
                    <el-col class="line" :span="2">-</el-col>
                    <el-col :span="11">
                        <el-time-picker placeholder="选择时间" v-model="formsubmit.date2" style="width: 100%;"></el-time-picker>
                    </el-col>
                </el-form-item>
                <el-form-item label="即时配送">
                    <el-switch v-model="formsubmit.delivery"></el-switch>
                </el-form-item>
                <el-form-item label="活动性质">
                    <el-checkbox-group v-model="formsubmit.type">
                        <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
                        <el-checkbox label="地推活动" name="type"></el-checkbox>
                        <el-checkbox label="线下主题活动" name="type"></el-checkbox>
                        <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="特殊资源">
                    <el-radio-group v-model="formsubmit.resource">
                        <el-radio label="线上品牌商赞助"></el-radio>
                        <el-radio label="线下场地免费"></el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="活动形式">
                    <el-input type="textarea" v-model="formsubmit.desc"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">立即创建</el-button>
                    <el-button>取消</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>

export default {
  name: 'evetn',
  created () {
    this.fetchStudents()
    this.$axios.get('/api/get_all_student?age=1').then(response => {
      console.log(response)
      if (response.status === 200) {
        console.log('請求成功')
      }
    }).catch(error => {
      console.error('請求失敗:', error)
    })
  },
  data () {
    return {
      button_name: 'iiiiiii',
      msg: 'Welcome to Your Vue.js App',
      type_msg: 'primary',
      inputMsg: 'hellp',
      radio: 3,
      input: '',
      input1: '',
      input2: '',
      input3: '',
      input4: '',
      textarea: '',
      loading: true,
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面',
        disabled: true
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }
      ],
      value: 'xuanxiang',
      tableData: [],
      proData: 0,
      dialogVisible: false,
      gridData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }],
      dialogTableVisible: false,
      dialogFormVisible: false,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      formLabelWidth: '120px',
      formsubmit: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    }
  },
  methods: {
    click_button_one () {
      console.log(111)
      this.button_name = '加载完成'
      this.$message({
        title: 'tiele',
        type: 'warning',
        message: 'this is message info'
      })
    },
    fetchStudents () {
      this.$axios.get('/api/get_all_student?age=1').then(response => {
        console.log(response)
        if (response.status === 200) {
          console.log('函數中調用')
        }
      }).catch(error => {
        console.error('請求失敗:', error)
      })
    },
    deleteStudent (student) {
      this.$axios.get('/api/delete_student?id=' + student.id).then(response => {
        console.log('delete request successfully')
        if (response.status === 200) {
          console.log('delete successfully')
        }
      }).catch(error => {
        console.log('delete request error', error)
      })
    },
    editStudentInfo (student) {
      this.$axios.post('/api/edit_student', {
        id: student.id,
        name: student.name,
        address: student.address
      }).then(response => {
        console.log('edit request successful')
        if (response.status === 200 && response.code === 0) {
          console.log('edit successfully')
        }
      })
    },
    click_button_two () {
      this.$alert('error,waringing')
    },
    click_button_three (params1) {
      this.$message({
        title: 'tiele',
        type: 'warning',
        message: '页码的值是' + params1
      })
    },
    deleteRow (index, row) {
      this.$message({
        title: '第几行' + index,
        message: '行数id' + row.id
      })
    },
    tableRowClassName ({row, rowIndex}) {
      if (rowIndex === 1) {
        return 'warning-row'
      } else if (rowIndex === 3) {
        return 'success-row'
      }
      return ''
    },
    clickProgress () {
      if (this.proData === 100) {
        this.proData = 0
      }
      this.proData = this.proData + 10
    },
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    onSubmit () {
      console.log('submit!')
    },
    numberChange (a) {
      let b = 66
      if (a === b) {
        var c = 33
        const d = 77
        console.log(c === d)
      }
    }
  }
}
</script>

<style>
.el-button {
  background-color: blueviolet;
  border-color: black;
}
.buttona {
  background-color: pink;
  margin-top: 60px;
  margin-bottom: 20%;
  margin-left: 400px;
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

.el-table .warning-row {
    background: rgb(186, 142, 60);
  }

.el-table .success-row {
  background: #3f7a1f;
}
</style>
