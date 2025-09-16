import router from './index';

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // 需要登录的页面
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      // 已登录，继续
      next();
    }
  } else {
    // 不需要登录的页面，直接访问
    next();
  }
});

export default router;    