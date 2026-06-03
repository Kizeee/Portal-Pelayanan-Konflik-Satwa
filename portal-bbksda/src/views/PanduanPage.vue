<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold text-brand-green mb-3">Panduan Keselamatan Lapangan</h1>
      <p class="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
        Langkah mitigasi terpadu bagi warga yang menjumpai satwa liar di Riau. Utamakan selalu keselamatan jiwa Anda &mdash; jangan menangani satwa liar sendirian tanpa keahlian khusus.
      </p>
    </div>

    <!-- ===== ALERT BOX PENTING ===== -->
    <div class="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 mb-10 shadow-sm flex items-start gap-4">
      <div class="bg-red-100 text-red-700 p-2.5 rounded-full flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h4 class="text-red-900 font-extrabold text-base mb-1">PERINGATAN PENTING</h4>
        <p class="text-red-800 text-sm leading-relaxed font-semibold">
          Jangan mencoba menangkap, mengejar, atau melukai satwa liar. Tindakan tersebut sangat membahayakan keselamatan warga dan melanggar hukum konservasi satwa dilindungi.
        </p>
      </div>
    </div>

    <div class="space-y-12">
      <!-- BAGIAN 1: SAAT MELIHAT SATWA -->
      <section class="hp-guide-section animate-in">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-green-100 text-brand-green h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">I</div>
          <h2 class="text-xl font-bold text-gray-800 uppercase tracking-wide">Tahap 1: Saat Melihat Satwa</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="border border-gray-200/80 rounded-xl p-5 bg-white transition hover:border-brand-green/30">
            <div class="text-xs font-bold text-brand-green uppercase tracking-wider mb-2">Panduan 1.1</div>
            <h3 class="font-bold text-gray-800 text-base mb-2">Jaga Jarak Aman</h3>
            <p class="text-xs text-gray-500 leading-relaxed">
              Amati satwa dari jarak jauh yang aman. Jangan panik, jangan berlari tiba-tiba, dan buat gerakan perlahan menjauhi satwa.
            </p>
          </div>
          <div class="border border-gray-200/80 rounded-xl p-5 bg-white transition hover:border-brand-green/30">
            <div class="text-xs font-bold text-brand-green uppercase tracking-wider mb-2">Panduan 1.2</div>
            <h3 class="font-bold text-gray-800 text-base mb-2">Jangan Mendekati Satwa</h3>
            <p class="text-xs text-gray-500 leading-relaxed">
              Satwa liar yang terkejut atau merasa terpojok dapat bereaksi sangat agresif demi mempertahankan diri. Hindari kontak mata langsung.
            </p>
          </div>
          <div class="border border-gray-200/80 rounded-xl p-5 bg-white transition hover:border-brand-green/30">
            <div class="text-xs font-bold text-brand-green uppercase tracking-wider mb-2">Panduan 1.3</div>
            <h3 class="font-bold text-gray-800 text-base mb-2">Jangan Memberi Makan</h3>
            <p class="text-xs text-gray-500 leading-relaxed">
              Pemberian makanan mengubah insting liar satwa, membuatnya ketergantungan dan memicu satwa terus kembali mendekati manusia.
            </p>
          </div>
        </div>
      </section>

      <!-- BAGIAN 2: JIKA SITUASI MEMBAHAYAKAN (GREEN ACCENT WARNING CARDS) -->
      <section class="hp-guide-section animate-in">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-green-100 text-brand-green h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">II</div>
          <h2 class="text-xl font-bold text-gray-800 uppercase tracking-wide">Tahap 2: Jika Situasi Mulai Membahayakan</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border border-green-200 rounded-xl p-6 bg-green-50/20 flex gap-4 items-start hover:bg-white hover:border-brand-green/30 transition">
            <div class="bg-green-100 text-brand-green p-2 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-800 text-base mb-1.5">Jangan Mengusir Satwa Sendiri</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                Pengusiran amatir (memakai petasan, api, atau melempari) dapat memprovokasi satwa menyerang balik atau melarikan diri ke area permukiman yang lebih ramai.
              </p>
            </div>
          </div>

          <div class="border border-green-200 rounded-xl p-6 bg-green-50/20 flex gap-4 items-start hover:bg-white hover:border-brand-green/30 transition">
            <div class="bg-green-100 text-brand-green p-2 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-800 text-base mb-1.5">Hindari Membuat Kerumunan</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                Kerumunan massa yang berisik dan gaduh membuat satwa panik luar biasa, memicunya melakukan tindakan pertahanan diri yang agresif.
              </p>
            </div>
          </div>

          <div class="border border-green-200 rounded-xl p-6 bg-green-50/20 flex gap-4 items-start hover:bg-white hover:border-brand-green/30 transition">
            <div class="bg-green-100 text-brand-green p-2 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-800 text-base mb-1.5">Menjauh ke Tempat Aman</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                Prioritaskan keselamatan diri. Segera masuk ke dalam bangunan permanen tertutup dan kunci pintu. Amankan juga hewan ternak/peliharaan Anda.
              </p>
            </div>
          </div>

          <div class="border border-green-200 rounded-xl p-6 bg-green-50/20 flex gap-4 items-start hover:bg-white hover:border-brand-green/30 transition">
            <div class="bg-green-100 text-brand-green p-2 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-800 text-base mb-1.5">Hubungi Kontak Darurat</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                Segera hubungi tim rescue BBKSDA Riau via WhatsApp/Telepon untuk penanganan darurat langsung di lokasi kejadian.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- BAGIAN 3: SETELAH KONDISI AMAN (VERTICAL TIMELINE / PROGRESS LIST) -->
      <section class="hp-guide-section animate-in">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-green-100 text-brand-green h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">III</div>
          <h2 class="text-xl font-bold text-gray-800 uppercase tracking-wide">Tahap 3: Setelah Kondisi Aman</h2>
        </div>

        <div class="max-w-2xl mx-auto bg-green-50/10 border border-green-100 p-6 rounded-xl space-y-6">
          <!-- Item 1 -->
          <div class="flex gap-4 items-start">
            <div class="h-7 w-7 rounded-full bg-green-100 text-brand-green flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">1</div>
            <div>
              <h4 class="font-bold text-gray-800 text-sm">Dokumentasikan dari Jarak Aman</h4>
              <p class="text-xs text-gray-500 leading-relaxed mt-0.5">Jika memungkinkan, ambil foto atau video kondisi satwa. Bukti visual ini membantu verifikator menilai status bahaya spesies.</p>
            </div>
          </div>
          <!-- Item 2 -->
          <div class="flex gap-4 items-start">
            <div class="h-7 w-7 rounded-full bg-green-100 text-brand-green flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">2</div>
            <div>
              <h4 class="font-bold text-gray-800 text-sm">Catat Informasi Detail Lokasi</h4>
              <p class="text-xs text-gray-500 leading-relaxed mt-0.5">Catat patokan wilayah terdekat, nama desa, kecamatan, serta perkiraan koordinat lokasi konflik satwa liar terjadi.</p>
            </div>
          </div>
          <!-- Item 3 -->
          <div class="flex gap-4 items-start">
            <div class="h-7 w-7 rounded-full bg-green-100 text-brand-green flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">3</div>
            <div>
              <h4 class="font-bold text-gray-800 text-sm">Laporkan Melalui Portal Resmi</h4>
              <p class="text-xs text-gray-500 leading-relaxed mt-0.5">Buka portal pelaporan online ini, isi data kejadian selengkap mungkin, dan kirimkan laporan Anda untuk ditindaklanjuti oleh tim petugas rescue.</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- COMPACT CONTACT DETAILS -->
    <div class="mt-12 border border-gray-200 rounded-xl p-5 bg-white text-center shadow-sm max-w-2xl mx-auto">
      <h3 class="font-bold text-gray-800 text-base mb-3 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
        Layanan Call Center Darurat BBKSDA Riau
      </h3>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
        <div><strong>Telepon:</strong> <a href="tel:076163135" class="text-brand-green font-bold hover:underline">0761-63135</a></div>
        <div class="hidden sm:block text-gray-300">|</div>
        <div><strong>WhatsApp:</strong> <a href="https://wa.me/6281374742981" target="_blank" class="text-brand-green font-bold hover:underline">0813-7474-2981</a></div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3.5 justify-center mt-8 pb-8">
      <button 
        @click="router.push({ name: 'Lapor' })" 
        class="bg-brand-green text-white font-bold py-3 px-8 rounded-lg shadow-sm hover:opacity-95 transition text-sm uppercase tracking-wide"
      >
        Buat Laporan Sekarang
      </button>
      <a 
        href="tel:076163135" 
        class="bg-gray-50 text-gray-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition border border-gray-200 text-center flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Hubungi Telepon Darurat
      </a>
    </div>
  </div>
</template>
