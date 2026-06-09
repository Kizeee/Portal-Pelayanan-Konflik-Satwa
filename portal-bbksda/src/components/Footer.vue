<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <footer class="bg-stone-800 text-white mt-12">
    <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 text-center md:text-left">
        <!-- Logo & About -->
        <div>
          <h3 class="text-base font-bold mb-3 flex items-center justify-center md:justify-start gap-2 text-stone-100">
            <!-- Globe/leaf icon — natural, not AI -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            BBKSDA Riau
          </h3>
          <p class="text-stone-400 text-xs sm:text-sm leading-relaxed">
            Portal ini digunakan untuk membantu masyarakat melaporkan dan memantau penanganan konflik satwa liar di wilayah Provinsi Riau.
          </p>
        </div>

        <!-- Tautan Cepat -->
        <div>
          <h4 class="text-sm font-bold mb-4 text-stone-300 uppercase tracking-wider">Tautan Cepat</h4>

          <!-- Tautan untuk Admin (sudah login) -->
          <template v-if="authStore.user">
            <ul class="space-y-2 text-sm text-stone-400">
              <li>
                <router-link :to="{ name: 'Dashboard' }" class="hover:text-forest-300 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Statistik
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Peta' }" class="hover:text-forest-300 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                  Peta Sebaran
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'LihatLaporan' }" class="hover:text-forest-300 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Semua Laporan
                </router-link>
              </li>
            </ul>
            <!-- Badge penanda akses admin -->
            <p class="mt-3 inline-flex items-center gap-1 text-xs text-amber-400/80 border border-amber-500/30 rounded-full px-2 py-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Akses Admin
            </p>
          </template>

          <!-- Tautan untuk Masyarakat (belum login) -->
          <template v-else>
            <ul class="space-y-2 text-sm text-stone-400">
              <li>
                <router-link :to="{ name: 'Home' }" class="hover:text-forest-300 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Beranda
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Lapor' }" class="hover:text-forest-300 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Buat Laporan
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'LaporanSaya' }" class="hover:text-forest-300 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Laporan Saya
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Panduan' }" class="hover:text-forest-300 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Panduan Keselamatan
                </router-link>
              </li>
            </ul>
          </template>
        </div>

        <!-- Kontak -->
        <div>
          <h4 class="text-sm font-bold mb-4 text-stone-300 uppercase tracking-wider">Kontak Darurat</h4>
          <ul class="space-y-3 text-sm text-stone-400">
            <li class="flex items-start justify-center md:justify-start gap-2">
              <!-- Map pin icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-stone-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-left text-xs leading-relaxed">Jl. H.R. Soebrantas Km. 8.5, Sidomulyo Barat-Arengka, Kode Pos 28294, Pekanbaru.</span>
            </li>
            <li class="flex items-center justify-center md:justify-start gap-2">
              <!-- Phone icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-stone-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-xs">0761-63135 (Telepon)</span>
            </li>
            <li class="flex items-center justify-center md:justify-start gap-2">
              <!-- WhatsApp icon (brand, unchanged) -->
              <svg class="h-4 w-4 text-stone-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span class="text-xs">0813-7474-2981 (WhatsApp)</span>
            </li>
            <li class="flex items-center justify-center md:justify-start gap-2">
              <!-- Mail icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-stone-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-xs">humas@bbksda-riau.com</span>
            </li>
            <li class="flex items-start justify-center md:justify-start gap-2 mt-3 pt-3 border-t border-stone-700">
              <!-- Clock icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-stone-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="text-left text-xs">
                <strong class="block text-stone-200 font-semibold">Call Center Darurat: 24/7 (Setiap Hari)</strong>
                <span>Jam Layanan Administratif Kantor: Senin–Jumat, 08.00–16.00 WIB</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-stone-700 pt-5 text-center">
        <p class="text-xs text-stone-500">&copy; {{ new Date().getFullYear() }} Balai Besar KSDA Riau. Hak Cipta Dilindungi.</p>
        <p class="text-xs text-stone-600 mt-1">Melayani pelaporan konflik satwa liar untuk masyarakat Provinsi Riau</p>
      </div>
    </div>
  </footer>
</template>
