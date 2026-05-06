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
import docManagement from '../components/aitest/docManagement.vue'
// import projectPrdManagement from '../components/aitest/projectPrdManagement.vue'
import testCaseManagement from '../components/aitest/testCaseManagement.vue'
import aiTestCase from '../components/aitest/aitestcase.vue'
// import apiDocManagement from '../components/aitest/apiDocManagement.vue'
import apiInterfaceManagement from '../components/aitest/apiInterfaceManagement.vue'
import testDataManagement from '../components/aitest/testDataManagement.vue'
import testCaseExecution from '../components/aitest/testCaseExecution.vue'
import testCaseResult from '../components/aitest/testCaseResult.vue'
import testCaseHistory from '../components/aitest/testCaseHistory.vue'
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
        {
          path: 'docManagement',
          name: 'docManagement',
          component: docManagement
        },
        // {
        //   path: 'projectPrdManagement',
        //   name: 'projectPrdManagement',
        //   component: projectPrdManagement
        // },
        {
          path: 'testCaseManagement',
          name: 'testCaseManagement',
          component: testCaseManagement
        },
        {
          path: 'aitestcase',
          name: 'aitestcase',
          component: aiTestCase
        },
        {
          path: 'projectManagement',
          name: 'projectManagement',
          component: projectManagement
        },
        // {
        //   path: 'apiDocManagement',
        //   name: 'apiDocManagement',
        //   component: apiDocManagement
        // },
        {
          path: 'apiInterfaceManagement',
          name: 'apiInterfaceManagement',
          component: apiInterfaceManagement
        },
        {
          path: 'testDataManagement',
          name: 'testDataManagement',
          component: testDataManagement
        },
        {
          path: 'testCaseExecution',
          name: 'testCaseExecution',
          component: testCaseExecution
        },
        {
          path: 'testCaseResult',
          name: 'testCaseResult',
          component: testCaseResult
        },
        {
          path: 'testCaseHistory',
          name: 'testCaseHistory',
          component: testCaseHistory
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
