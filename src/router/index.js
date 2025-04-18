import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  {
    path: '/kubernetes',
    component: Layout,
    name: 'kubernetes',
    meta: {
      title: 'kubernetes',
      icon: 'k8s'
    },
    children: [
      {
        path: 'rbac',
        name: 'rbac',
        meta: { title: 'rbac'},
        alwaysShow: true,
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'index',
            component: () => import('@/views/k8s/rbac/index'),
            name: 'rbacIndex',
            meta: { title: 'rbac管理' }
          },
          {
            path: 'role',
            component: () => import('@/views/k8s/rbac/role'),
            name: 'role',
            meta: { title: 'role管理' }
          },
          {
            path: 'rolebinding',
            component: () => import('@/views/k8s/rbac/rolebinding'),
            name: 'rolebinding',
            meta: { title: 'rolebinding管理' }
          },
          {
            path: 'clusterrolebinding',
            component: () => import('@/views/k8s/rbac/clusterrolebinding'),
            name: 'clusterrolebinding',
            meta: { title: 'clusterrolebinding管理' }
          },
          {
            path: 'clusterrole',
            component: () => import('@/views/k8s/rbac/clusterrole'),
            name: 'clusterrole',
            meta: { title: 'clusterrole管理' }
          }
        ]
      },
      {
        path: 'nodepool',
        component: () => import('@/views/k8s/nodepool/index'),
        name: 'nodepool',
        meta: { title: 'nodepool'}
      },
      // 在k8s相关路由配置中添加
      {
        path: '/k8s/nodepool/detail',
        component: () => import('@/views/k8s/nodepool/detail'),
        name: 'NodePoolDetail',
      },
      {
        path: 'node',
        component: () => import('@/views/k8s/node/index'),
        name: 'node',
        meta: { title: 'node'}
      },
      {
        path: 'service',
        component: () => import('@/views/k8s/service/index'),
        name: 'service',
        meta: { title: 'service'}
      },
      {
        path: 'deployment',
        component: () => import('@/views/k8s/deployment/index'),
        name: 'deployment',
        meta: { title: 'deployment'}
      },
      {
        path: 'replicaset',
        component: () => import('@/views/k8s/replicaset/index'),
        name: 'replicaset',
        meta: { title: 'replicaset'}
      },
      {
        path: 'statefulset',
        component: () => import('@/views/k8s/statefulset/index'),
        name: 'statefulset',
        meta: { title: 'statefulset'}
      },
      {
        path: 'pod',
        component: () => import('@/views/k8s/pod/index'),
        name: 'pod',
        meta: { title: 'pod'}
      },
      {
        path: 'job',
        component: () => import('@/views/k8s/job/index'),
        name: 'job',
        meta: { title: 'job'}
      },
      {
        path: 'cronjob',
        component: () => import('@/views/k8s/cronjob/index'),
        name: 'cronjob',
        meta: { title: 'cronjob'}
      },
      {
        path: 'daemonset',
        component: () => import('@/views/k8s/daemonset/index'),
        name: 'daemonset',
        meta: { title: 'daemonset'}
      },
      {
        path: 'webshell',
        component: () => import('@/views/terminal/index'),
        name: 'webshell',
        meta: { title: 'webshell'}
      },
      {
        path: '/terminal/exec',
        component: () => import('@/views/terminal/exec'),
        name: 'PodExec',
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
