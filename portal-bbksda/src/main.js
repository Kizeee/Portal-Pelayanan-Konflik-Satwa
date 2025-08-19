import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// 1. Impor semua komponen halaman Anda
import HomePage from './views/HomePage.vue'
import LaporPage from './views/LaporPage.vue'
import PetaPage from './views/PetaPage.vue'
import LaporanSayaPage from './views/LaporanSayaPage.vue'
import LoginPage from './views/LoginPage.vue'
import DashboardPage from './views/DashboardPage.vue'
import LihatLaporanPage from './views/LihatLaporanPage.vue'
import DetailPage from './views/DetailPage.vue'
import RekapBulananPage from './views/RekapBulananPage.vue' // Halaman baru

// 2. Definisikan semua rute/halaman
const routes = [
  { path: '/', name: 'HomePage', component: HomePage },
  { path: '/lapor', name: 'LaporPage', component: LaporPage },
  { path: '/peta', name: 'PetaPage', component: PetaPage },
  { path: '/laporan-saya', name: 'LaporanSayaPage', component: LaporanSayaPage },
  { path: '/login', name: 'LoginPage', component: LoginPage },
  {
    path: '/admin/dashboard',
    name: 'DashboardPage',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/laporan',
    name: 'LihatLaporanPage',
    component: LihatLaporanPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/laporan/:id',
    name: 'DetailPage',
    component: DetailPage,
    props: true,
  },
  // --- RUTE BARU UNTUK REKAP ---
  {
    path: '/admin/rekap-bulanan',
    name: 'RekapBulanan',
    component: RekapBulananPage,
    meta: { requiresAuth: true }
  },
]

// 3. Buat instance router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 4. Logika untuk memeriksa otentikasi sebelum navigasi
router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  onAuthStateChanged(auth, (user) => {
    if (requiresAuth && !user) {
      // Jika halaman butuh login dan pengguna belum login, arahkan ke halaman login
      next('/login');
    } else {
      // Lanjutkan navigasi
      next();
    }
  });
});


// 5. Buat dan pasang aplikasi Vue
const app = createApp(App)
app.use(router) // Gunakan router yang sudah dibuat
app.mount('#app')
