<script setup>
import { useRouter } from 'vue-router'
import bgForest from '../assets/background-forest.png'

const router = useRouter()

const features = [
  {
    icon: 'M12 1.5V12.5M12 22.5V12.5M12 12.5H22.5M12 12.5H1.5',
    title: 'Lapor Cepat',
    description: 'Kirimkan laporan konflik dengan mudah melalui formulir interaktif kami.',
  },
  {
    icon: 'M12 12L18.5 18.5M12 12L5.5 18.5M12 12L18.5 5.5M12 12L5.5 5.5',
    title: 'Lokasi Akurat',
    description: 'Tandai lokasi kejadian langsung di peta untuk penanganan yang lebih presisi.',
  },
  {
    icon: 'M3.5 12.5H20.5M3.5 6.5H20.5M3.5 18.5H20.5',
    title: 'Pantau Status',
    description: 'Lihat status penanganan laporan Anda secara transparan oleh tim kami.',
  },
]
</script>

<template>
  <div>
    <!-- HERO SECTION -->
    <section
      class="relative text-center bg-cover bg-center rounded-2xl shadow-xl py-16 sm:py-24 md:py-28 px-5 sm:px-8 overflow-hidden min-h-[380px] sm:min-h-[480px] flex flex-col justify-center items-center"
      :style="{ backgroundImage: `url(${bgForest})` }"
    >
      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/60 to-green-900/30"
      ></div>

      <!-- Content -->
      <div class="relative z-10 max-w-4xl w-full">
        <h1
          class="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6"
          style="text-shadow: 0 4px 20px rgba(0,0,0,0.7);"
        >
          Layanan Pengaduan Konflik Satwa
        </h1>

        <p
          class="text-base sm:text-lg md:text-xl text-green-100 mb-7 sm:mb-10 px-2"
          style="text-shadow: 0 2px 10px rgba(0,0,0,0.6);"
        >
          Bersama kita menjaga keharmonisan antara manusia dan satwa liar melalui teknologi dan
          kepedulian lingkungan.
        </p>

        <button
          @click="router.push({ name: 'Lapor' })"
          class="w-full sm:w-auto bg-gradient-to-r from-lime-400 to-green-500 text-green-900 font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full text-base sm:text-lg hover:scale-105 sm:hover:scale-110 transition-transform duration-300 shadow-2xl"
        >
          Buat Laporan Sekarang
        </button>
      </div>

      <!-- Decorative blur -->
      <div class="absolute -top-10 -left-10 w-72 h-72 bg-green-400/30 rounded-full blur-3xl"></div>
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
      ></div>
    </section>

    <!-- TATA CARA -->
    <section class="py-12 sm:py-16 md:py-24">
      <div class="text-center mb-10 sm:mb-16">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-green">
          Bagaimana Cara Kerjanya?
        </h2>
        <p class="text-gray-600 mt-3">
          Tiga langkah sederhana untuk melaporkan dan memantau konflik satwa.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="group text-center p-6 sm:p-8 md:p-10 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
        >
          <!-- ICON WARNA #386641 -->
          <div
            class="text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-5 sm:mb-8 shadow-lg group-hover:scale-110 transition-transform"
            style="background-color: #386641;"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7 sm:h-9 sm:w-9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon" />
            </svg>
          </div>

          <h3 class="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-brand-green">
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
