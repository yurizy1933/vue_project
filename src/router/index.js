import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import hello from '@/components/test/hello'
import evetn from '@/components/test/evetn'
import login from '../components/login/loginPage.vue'
import HomePage from '../components/login/homePage.vue'
import Axios from 'axios'
// import { error } from 'shelljs'
import router from '.'
// import DocManagement from '../components/aitest/docManagement.vue'
import projectPrdManagement from '../components/aitest/projectPrdManagement.vue'
import testCaseManagement from '../components/aitest/testCaseManagement.vue'
import projectManagement from '../components/system/projectManagement.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/hello',
      name: 'hello',
      component: hello
    },
    {
      path: '/evetn',
      name: 'evetn',
      component: evetn
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/',
      component: HomePage,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: HelloWorld // 或者你的仪表盘页面
        },
        // {
        //   path: 'docManagement',
        //   name: 'docManagement',
        //   component: DocManagement
        // },
        {
          path: 'projectPrdManagement',
          name: 'projectPrdManagement',
          component: projectPrdManagement
        },
        {
          path: 'testCaseManagement',
          name: 'testCaseManagement',
          component: testCaseManagement
        },
        {
          path: 'projectManagement',
          name: 'projectManagement',
          component: projectManagement
        }
      ]
    }
  ]
})

Axios.interceptors.response.use(response => {
  return response
}, error => {
  const { status } = error.response
  if (status === 401) {
    router.push('/login')
  }
  return Promise.reject(error)
})
