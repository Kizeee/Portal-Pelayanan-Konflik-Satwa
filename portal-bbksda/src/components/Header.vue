<script setup>
import { ref } from 'vue';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';

const props = defineProps({
  currentPage: String,
  user: Object,
  hasMyReports: Boolean,
});

const emit = defineEmits(['navigate']);

const mobileMenuOpen = ref(false);

// Fungsi untuk styling link aktif (tidak ada perubahan)
const navLinkClass = (page) => {
  return props.currentPage === page 
    ? 'text-brand-green font-semibold border-b-2 border-brand-green' 
    : 'text-gray-600 hover:text-brand-green transition-colors duration-300';
};

// Fungsi untuk navigasi di mobile (tidak ada perubahan)
const navigateAndClose = (page) => {
  emit('navigate', page);
  mobileMenuOpen.value = false;
};

// Fungsi logout (tidak ada perubahan)
const handleLogout = async () => {
  await signOut(auth);
  navigateAndClose('home'); 
};
</script>

<template>
  <header class="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-[1000]">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        
        <div class="flex items-center space-x-3 cursor-pointer" @click="emit('navigate', 'home')">
          <img src="/logo-BBKSDA.png" alt="Logo BBKSDA Riau" class="h-10 w-10 object-contain">
          <span class="text-xl font-bold text-gray-800">BBKSDA Riau</span>
        </div>
        
        <div class="hidden md:flex items-center space-x-8">
          <a href="#" @click.prevent="emit('navigate', 'home')" :class="navLinkClass('home')">Beranda</a>
          <a href="#" @click.prevent="emit('navigate', 'dashboard')" :class="navLinkClass('dashboard')">Dasbor</a>
          
          <template v-if="user">
            <a href="#" @click.prevent="emit('navigate', 'peta')" :class="navLinkClass('peta')">Peta Sebaran</a>
            <a href="#" @click.prevent="emit('navigate', 'lihat')" :class="navLinkClass('lihat')">Lihat Laporan</a>
            <button @click="handleLogout" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold">Logout</button>
          </template>
          
          <template v-else>
            <a href="#" @click.prevent="emit('navigate', 'lapor')" :class="navLinkClass('lapor')">Buat Laporan</a>
            <a v-if="hasMyReports" href="#" @click.prevent="emit('navigate', 'laporan-saya')" :class="navLinkClass('laporan-saya')">Laporan Saya</a>
            <a href="#" @click.prevent="emit('navigate', 'login')" :class="navLinkClass('login')">Login Admin</a>
          </template>
        </div>
        
        <div class="md:hidden flex items-center">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </div>
    </nav>

    <div v-show="mobileMenuOpen" class="md:hidden bg-white border-t">
      <a href="#" @click.prevent="navigateAndClose('home')" class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50">Beranda</a>
      <a href="#" @click.prevent="navigateAndClose('dashboard')" class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50">Dasbor</a>
      
      <template v-if="user">
        <a href="#" @click.prevent="navigateAndClose('peta')" class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50">Peta Sebaran</a>
        <a href="#" @click.prevent="navigateAndClose('lihat')" class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50">Lihat Laporan</a>
        <a href="#" @click.prevent="handleLogout" class="block py-3 px-4 text-base font-medium text-red-600 hover:bg-gray-50">Logout</a>
      </template>
      
      <template v-else>
        <a href="#" @click.prevent="navigateAndClose('lapor')" class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50">Buat Laporan</a>
        <a v-if="hasMyReports" href="#" @click.prevent="navigateAndClose('laporan-saya')" class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50">Laporan Saya</a>
        <a href="#" @click.prevent="navigateAndClose('login')" class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50">Login Admin</a>
      </template>
    </div>
  </header>
</template>