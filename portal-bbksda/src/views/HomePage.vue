<script setup>
import { useRouter } from 'vue-router'
import bgForest from '../assets/background-forest.png'

const router = useRouter()

const features = [
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Lapor Cepat',
    description: 'Kirimkan laporan konflik dengan mudah melalui formulir interaktif kami.',
  },
  {
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Lokasi Akurat',
    description: 'Tandai lokasi kejadian langsung di peta untuk penanganan yang lebih presisi.',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    title: 'Pantau Status',
    description: 'Lihat status penanganan laporan Anda secara transparan oleh tim kami.',
  },
]
</script>

<template>
  <div>
    <!-- HERO SECTION -->
    <section
      class="relative text-center bg-cover bg-center rounded-2xl shadow-lg py-16 sm:py-24 md:py-28 px-5 sm:px-8 overflow-hidden min-h-[380px] sm:min-h-[480px] flex flex-col justify-center items-center"
      :style="{ backgroundImage: `url(${bgForest})` }"
    >
      <!-- Overlay - Simplified solid overlay -->
      <div
        class="absolute inset-0 bg-black/50"
      ></div>

      <!-- Content -->
      <div class="relative z-10 max-w-4xl w-full">
        <h1
          class="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6"
          style="text-shadow: 0 2px 12px rgba(0,0,0,0.4);"
        >
          Layanan Pengaduan Konflik Satwa
        </h1>

        <p
          class="text-base sm:text-lg md:text-xl text-gray-100 mb-7 sm:mb-10 px-2"
          style="text-shadow: 0 1px 6px rgba(0,0,0,0.3);"
        >
          Bersama kita menjaga keharmonisan antara manusia dan satwa liar melalui teknologi dan
          kepedulian lingkungan.
        </p>

        <button
          @click="router.push({ name: 'Lapor' })"
          class="w-full sm:w-auto bg-[#2D5A3D] text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-lg text-base sm:text-lg hover:bg-[#234A31] transition-colors duration-300 shadow-lg"
        >
          Buat Laporan Sekarang
        </button>
      </div>
    </section>

    <!-- TATA CARA -->
    <section class="py-12 sm:py-16 md:py-24">
      <div class="text-center mb-10 sm:mb-16">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold" style="color: #2D5A3D;">
          Bagaimana Cara Kerjanya?
        </h2>
        <p class="text-gray-500 mt-3">
          Tiga langkah sederhana untuk melaporkan dan memantau konflik satwa.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="group text-center p-6 sm:p-8 md:p-10 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <!-- ICON with muted background -->
          <div
            class="rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-5 sm:mb-8 group-hover:scale-105 transition-transform"
            style="background-color: #E8F0E9;"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7 sm:h-9 sm:w-9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
              style="color: #2D5A3D;"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon" />
            </svg>
          </div>

          <h3 class="text-lg sm:text-xl font-semibold mb-2 sm:mb-3" style="color: #2D5A3D;">
            {{ index + 1 }}. {{ feature.title }}
          </h3>

          <p class="text-gray-500 leading-relaxed text-sm sm:text-base">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
