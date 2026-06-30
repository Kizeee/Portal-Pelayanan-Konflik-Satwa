<script setup>
import { ref } from 'vue'

const faqs = [
  {
    question: 'Bagaimana cara membuat laporan?',
    answer:
      "Klik tombol 'Buat Laporan' di menu navigasi atau halaman utama. Pastikan Anda sudah membaca peringatan keselamatan dan berada di lokasi aman sebelum lanjut ke formulir pelaporan online. Isi data dengan lengkap termasuk data diri pelapor (nama dan nomor telepon aktif), jenis satwa, kronologi singkat konflik, serta unggah bukti foto/video jika ada. Penentuan titik koordinat kejadian secara presisi di peta interaktif sangat penting agar tim rescue BBKSDA Riau dapat melacak lokasi konflik dengan tepat.",
  },
  {
    question: 'Apakah laporan wajib menggunakan foto atau video?',
    answer:
      'Ya, melampirkan foto atau video bersifat wajib. Bukti visual sangat krusial bagi tim verifikator kami untuk mengidentifikasi spesies satwa secara akurat (misal: membedakan jenis ular berbisa atau tidak), menilai tingkat bahaya di lapangan, dan menentukan logistik penyelamatan yang tepat. Jika tidak ada foto, Anda tetap dapat mengirimkan laporan dengan deskripsi fisik satwa sejelas mungkin.',
  },
  {
    question: 'Bagaimana cara mengecek status laporan?',
    answer:
      "Buka halaman 'Laporan Saya', lalu masukkan ID Tiket yang diberikan setelah formulir berhasil dikirim. Sistem akan mengambil status terbaru dari database, mulai dari Dikirim, Diverifikasi, Penanganan, hingga Selesai.",
  },
  {
    question: 'Apa yang harus dilakukan jika satwa masih berada di lokasi?',
    answer:
      'Keamanan Anda adalah prioritas utama. Segera lakukan evakuasi mandiri ke tempat aman (rumah atau bangunan tertutup). Jangan mencoba mendekati, mengintimidasi, mengusir, memojokkan, atau menangkap satwa secara mandiri tanpa keahlian khusus karena dapat memicu perilaku agresif satwa. Amankan juga hewan ternak atau peliharaan Anda. Segera hubungi Kontak Darurat BBKSDA Riau (Call Center/WhatsApp) di nomor 0813-7474-2981 untuk penanganan darurat langsung.',
  },
  {
    question: 'Berapa lama laporan diproses?',
    answer:
      'Formulir ini diperuntukkan bagi laporan penampakan satwa, penemuan jejak, atau kerusakan lahan setelah Anda dipastikan berada di lokasi yang aman. Laporan akan diverifikasi admin maksimal 1x24 jam. Jika terjadi keadaan darurat dan ancaman fisik secara langsung, JANGAN gunakan formulir ini, segera tekan tombol Telepon Darurat.',
  },
  {
    question: 'Bagaimana jika saya salah memasukkan data?',
    answer:
      'Karena laporan yang sudah dikirim tidak dapat diubah langsung oleh pelapor untuk menjaga validitas data, Anda disarankan untuk segera menghubungi Call Center BBKSDA Riau melalui WhatsApp resmi kami. Sebutkan ID Tiket Anda beserta rincian informasi yang ingin dikoreksi (misalnya revisi nomor kontak pelapor atau titik koordinat yang lebih tepat).',
  },
  {
    question: 'Apakah laporan saya akan ditindaklanjuti?',
    answer:
      'Setiap laporan yang masuk akan melewati proses validasi oleh admin BBKSDA Riau guna mengantisipasi laporan palsu (hoaks). Laporan yang memenuhi syarat kelengkapan data dan terbukti valid akan langsung diteruskan ke unit pelaksana teknis (Resort/Seksi Konservasi Wilayah) setempat untuk segera dilakukan tindakan penanganan konflik satwa, baik berupa sosialisasi, penghalauan kembali ke habitat, maupun evakuasi (rescue).',
  },
  {
    question: 'Apakah data pelapor aman?',
    answer:
      'Privasi dan keamanan data pribadi Anda sepenuhnya dijamin oleh BBKSDA Riau. Informasi kontak dan identitas diri Anda hanya digunakan secara internal oleh petugas untuk melakukan verifikasi lapangan serta koordinasi tindak lanjut penanganan konflik. Data pribadi Anda tidak akan pernah dipublikasikan ke publik atau disebarluaskan kepada pihak ketiga yang tidak berkepentingan.',
  },
]

const activeIndex = ref(null)

const toggleFaq = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <div class="space-y-4">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        <button
          @click="toggleFaq(index)"
          class="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
        >
          <span class="font-bold text-gray-800 pr-4 text-base sm:text-lg">{{ faq.question }}</span>
          <span
            class="flex-shrink-0 w-8 h-8 rounded-full bg-green-50 text-brand-green flex items-center justify-center transition-transform duration-300"
            :class="{ 'rotate-180 bg-brand-green text-white': activeIndex === index }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>
        <div
          class="transition-all duration-300 ease-in-out overflow-hidden"
          :class="activeIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'"
        >
          <div
            class="p-5 sm:p-6 pt-0 text-gray-600 text-sm sm:text-base border-t border-gray-50 mt-2 leading-relaxed"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
