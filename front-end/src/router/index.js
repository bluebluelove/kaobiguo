import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/authStore';

const routes = [
  {
    path: '/',
    component: () => import('@/views/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'word-books',
        name: 'WordBooks',
        component: () => import('@/features/word-book/views/WordBooksView.vue'),
        meta: { title: '选词书' },
      },
      {
        path: 'learn',
        name: 'Learn',
        component: () => import('@/features/learn/views/LearnView.vue'),
        meta: { title: '学新词' },
      },
      {
        path: 'learn/lesson/:lessonIndex',
        name: 'LessonWords',
        component: () => import('@/features/learn/views/LessonWordView.vue'),
        meta: { title: '课程单词' },
      },
      {
        path: 'learn/lesson/:lessonIndex/card',
        name: 'CardStudy',
        component: () => import('@/features/learn/views/CardStudyView.vue'),
        meta: { title: '卡片学习' },
      },
      {
        path: 'review',
        name: 'Review',
        component: () => import('@/features/review/views/ReviewView.vue'),
        meta: { title: '复习' },
      },
      {
        path: 'word-list',
        name: 'WordList',
        component: () => import('@/features/word-list/views/WordListView.vue'),
        meta: { title: '生词本' },
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('@/features/stats/views/StatsView.vue'),
        meta: { title: '学习统计' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/features/auth/views/ProfileView.vue'),
        meta: { title: '个人中心' },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/features/auth/views/LoginView.vue'),
    meta: { title: '登录', guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/features/auth/views/RegisterView.vue'),
    meta: { title: '注册', guest: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/features/auth/views/ForgotPasswordView.vue'),
    meta: { title: 'Forgot password', guest: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isLoggedIn;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }
  if (to.meta.guest && isLoggedIn) {
    next({ name: 'Home' });
    return;
  }
  next();
});

export default router;
