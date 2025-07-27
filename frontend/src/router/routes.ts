import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    // Standard Layout
    path: '/',
    component: () => import('@/features/layout/StandardLayout.vue'),
    children: [
      {
        // Default route
        name: 'dashboard',
        path: '/',
        alias: ['/', '/dashboard'],
        meta: { background: 'sunset' },
        component: () => import('@/pages/TrackerDashboard.vue'),
      },
      {
        name: 'neededitems',
        path: '/items',
        meta: {},
        component: () => import('@/pages/NeededItems.vue'),
      },
      {
        name: 'tasks',
        path: '/tasks',
        meta: {},
        component: () => import('@/pages/TaskList.vue'),
      },
      {
        name: 'hideout',
        path: '/hideout',
        meta: { background: 'hideout' },
        component: () => import('@/pages/HideoutList.vue'),
      },
      {
        name: 'api',
        path: '/api',
        meta: { background: 'gas' },
        component: () => import('@/pages/TrackerSettings.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/pages/NotFound.vue'),
      },
      {
        name: 'login',
        path: '/login',
        meta: { background: 'checkpoint' },
        component: () => import('@/pages/LoginInterface.vue'),
      },
      {
        name: 'team',
        path: '/team',
        meta: { background: 'busstation' },
        component: () => import('@/pages/TeamManagement.vue'),
      },
    ],
  },
];

export default routes;
