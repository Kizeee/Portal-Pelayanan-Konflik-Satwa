<script setup>
const emit = defineEmits(['navigate']);

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
    <section 
      class="relative text-center bg-cover bg-center rounded-2xl shadow-lg py-24 px-8 overflow-hidden min-h-[450px] flex flex-col justify-center items-center" 
      style="background-image: url('https://images.unsplash.com/photo-1593532899423-13834637542e?q=80&w=2070&auto=format&fit=crop');">
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-black/40"></div>
      <div class="relative z-10">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-4" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          Layanan Pengaduan Konflik Satwa
        </h1>
        <p class="text-lg text-gray-200 max-w-3xl mx-auto mb-8" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">
          Bersama kita jaga keharmonisan antara manusia dan satwa liar di Riau. Laporkan setiap kejadian untuk penanganan yang cepat dan tepat.
        </p>
        <button @click="emit('navigate', 'lapor')" class="bg-gradient-to-r from-brand-accent to-green-400 text-brand-green font-bold py-3 px-8 rounded-full text-lg hover:scale-105 transition-transform duration-300 shadow-xl">
          Buat Laporan Sekarang
        </button>
      </div>
    </section>

    <section class="py-20">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-brand-green">Bagaimana Cara Kerjanya?</h2>
        <p class="text-gray-600 mt-2">Tiga langkah mudah untuk melaporkan dan memantau konflik.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-10">
        <div v-for="(feature, index) in features" :key="feature.title" class="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
          <div class="bg-brand-green-light text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2 text-brand-green">{{ index + 1 }}. {{ feature.title }}</h3>
          <p class="text-gray-500">{{ feature.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>