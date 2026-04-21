import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy-loaded route components for better performance
const HomePage = () => import('../views/HomePage.vue')
const LaporPage = () => import('../views/LaporPage.vue')
const PetaPage = () => import('../views/PetaPage.vue')
const LaporanSayaPage = () => import('../views/LaporanSayaPage.vue')
const LoginPage = () => import('../views/LoginPage.vue')
const DashboardPage = () => import('../views/DashboardPage.vue')
const LihatLaporanPage = () => import('../views/LihatLaporanPage.vue')
const DetailPage = () => import('../views/DetailPage.vue')
const RekapBulananPage = () => import('../views/RekapBulananPage.vue')

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { title: 'Beranda' },
  },
  {
    path: '/lapor',
    name: 'Lapor',
    component: LaporPage,
    meta: { title: 'Buat Laporan' },
  },
  {
    path: '/peta',
    name: 'Peta',
    component: PetaPage,
    meta: { title: 'Peta Sebaran' },
  },
  {
    path: '/laporan-saya',
    name: 'LaporanSaya',
    component: LaporanSayaPage,
    meta: { title: 'Laporan Saya' },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { title: 'Login Admin' },
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      title: 'Dashboard Admin',
    },
  },
  {
    path: '/admin/laporan',
    name: 'LihatLaporan',
    component: LihatLaporanPage,
    meta: {
      requiresAuth: true,
      title: 'Kelola Laporan',
    },
  },
  {
    path: '/laporan/:id',
    name: 'Detail',
    component: DetailPage,
    props: true,
    meta: { title: 'Detail Laporan' },
  },
  {
    path: '/admin/rekap-bulanan',
    name: 'RekapBulanan',
    component: RekapBulananPage,
    meta: {
      requiresAuth: true,
      title: 'Rekap Bulanan',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - BBKSDA Riau` : 'BBKSDA Riau'

  // Check authentication
  if (requiresAuth && !authStore.user) {
    // User not authenticated, redirect to login
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.user) {
    // User already logged in, redirect to dashboard
    next({ name: 'Dashboard' })
  } else {
    // Allow navigation
    next()
  }
})

export default router
