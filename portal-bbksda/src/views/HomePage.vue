<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import bgForest from '../assets/background-forest.png'
import ContactDarurat from '../components/ContactDarurat.vue'
import FaqAccordion from '../components/FaqAccordion.vue'

const router = useRouter()
const emergencyTelHref = 'tel:081374742981'
const emergencyWhatsappUrl = 'https://wa.me/6281374742981'
const showSafetyModal = ref(false)

const openSafetyModal = () => {
  showSafetyModal.value = true
}

const continueToReport = () => {
  showSafetyModal.value = false
  router.push({ name: 'Lapor' })
}

// Simple scroll animation
const animatedSections = ref([])
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('hp-visible')
        }
      })
    },
    { threshold: 0.15 },
  )
  document.querySelectorAll('.hp-animate').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="home-page">
    <!-- HERO -->
    <section
      class="hp-hero"
      :style="{ backgroundImage: `url(${bgForest})` }"
    >
      <div class="hp-hero-overlay"></div>
      <div class="hp-hero-content">
        <span class="hp-hero-badge">BBKSDA Riau</span>
        <h1 class="hp-hero-title">
          Portal Pelayanan<br />Konflik Satwa Liar
        </h1>
        <p class="hp-hero-subtitle">
          Laporkan kejadian satwa liar yang masuk ke kebun, permukiman, atau area
          aktivitas warga di wilayah Riau. Laporan Anda akan ditinjau dan
          ditindaklanjuti oleh petugas BBKSDA.
        </p>
        <div class="hp-hero-actions">
          <a class="hp-btn-emergency" :href="emergencyTelHref">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45c.91.35 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Hubungi Telepon Darurat
          </a>
          <button class="hp-btn-report" @click="openSafetyModal">
            Buat Laporan Sekarang
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- KEUNGGULAN -->
    <section class="hp-highlights hp-animate">
      <div class="hp-highlights-bar">
        <div class="hp-highlight">
          <span class="hp-highlight-dot"></span>
          <span class="hp-highlight-text">Layanan aktif <strong>24/7</strong></span>
        </div>
        <div class="hp-highlight">
          <span class="hp-highlight-dot"></span>
          <span class="hp-highlight-text">Respons kurang dari <strong>24 jam</strong></span>
        </div>
        <div class="hp-highlight">
          <span class="hp-highlight-dot"></span>
          <span class="hp-highlight-text">Mencakup <strong>seluruh wilayah Riau</strong></span>
        </div>
        <div class="hp-highlight">
          <span class="hp-highlight-dot"></span>
          <span class="hp-highlight-text">Tim penanganan <strong>profesional</strong></span>
        </div>
      </div>
    </section>

    <!-- STEPS (CARA MELAPORKAN) - ASYMMETRIC DESIGN -->
    <section class="hp-steps hp-animate">
      <div class="hp-section-header">
        <h2 class="hp-section-title">Cara Melaporkan</h2>
        <p class="hp-section-desc">
          Tiga langkah mudah untuk menyampaikan laporan Anda ke petugas BBKSDA Riau
        </p>
      </div>

      <div class="hp-steps-asymmetric">
        <!-- STEP 1: Border Left Accent Card -->
        <div class="hp-step-custom-card hp-card-type-a">
          <div class="hp-card-num-badge">01</div>
          <div class="hp-card-icon-wrapper bg-green-50 text-green-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
          </div>
          <div class="hp-card-body-content">
            <h3 class="hp-card-title-custom">Isi Data Kejadian</h3>
            <p class="hp-card-desc-custom">Lengkapi informasi pelapor, jenis satwa, kategori konflik, dan waktu kejadian.</p>
          </div>
        </div>

        <!-- STEP 2: Solid Border Highlight Card -->
        <div class="hp-step-custom-card hp-card-type-b">
          <div class="hp-card-num-badge">02</div>
          <div class="hp-card-icon-wrapper bg-blue-50 text-blue-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="hp-card-body-content">
            <h3 class="hp-card-title-custom">Tandai Lokasi</h3>
            <p class="hp-card-desc-custom">Pilih titik kejadian di peta atau gunakan lokasi saat ini agar petugas lebih mudah menemukan lokasi.</p>
          </div>
        </div>

        <!-- STEP 3: Premium Double Border Card -->
        <div class="hp-step-custom-card hp-card-type-c">
          <div class="hp-card-num-badge">03</div>
          <div class="hp-card-icon-wrapper bg-orange-50 text-orange-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </div>
          <div class="hp-card-body-content">
            <h3 class="hp-card-title-custom">Kirim dan Pantau</h3>
            <p class="hp-card-desc-custom">Setelah laporan masuk, simpan ID Tiket untuk memantau perubahan status melalui halaman Laporan Saya.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ALUR PENANGANAN LAPORAN - STUNNING TIMELINE -->
    <section class="hp-timeline-section hp-animate">
      <div class="hp-section-header">
        <h2 class="hp-section-title">Alur Penanganan Laporan</h2>
        <p class="hp-section-desc max-w-xl mx-auto">
          Setelah laporan dikirim, admin akan memeriksa kelengkapan data sebelum laporan diteruskan untuk penanganan.
        </p>
      </div>

      <div class="hp-timeline-wrapper">
        <div class="hp-timeline-progress-bar"></div>
        
        <div class="hp-timeline-grid">
          <!-- TIMELINE STEP 1 -->
          <div class="hp-timeline-item">
            <div class="hp-timeline-badge bg-green-50 text-green-700 border-green-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </div>
            <div class="hp-timeline-card">
              <div class="hp-timeline-step-number">Langkah 1</div>
              <h3 class="hp-timeline-step-title">Laporan Dikirim</h3>
              <p class="hp-timeline-step-desc">
                Pelapor mengirimkan data lengkap (satwa, lokasi koordinat, kronologi) via aplikasi secara online.
              </p>
            </div>
          </div>

          <!-- TIMELINE STEP 2 -->
          <div class="hp-timeline-item">
            <div class="hp-timeline-badge bg-blue-50 text-blue-700 border-blue-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="hp-timeline-card">
              <div class="hp-timeline-step-number">Langkah 2</div>
              <h3 class="hp-timeline-step-title">Diverifikasi Admin</h3>
              <p class="hp-timeline-step-desc">
                Tim admin internal BBKSDA Riau memvalidasi kelengkapan data & bukti visual guna mengantisipasi laporan fiktif.
              </p>
            </div>
          </div>

          <!-- TIMELINE STEP 3 -->
          <div class="hp-timeline-item">
            <div class="hp-timeline-badge bg-yellow-50 text-yellow-700 border-yellow-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="hp-timeline-card">
              <div class="hp-timeline-step-number">Langkah 3</div>
              <h3 class="hp-timeline-step-title">Petugas Mengecek Lokasi</h3>
              <p class="hp-timeline-step-desc">
                Tim rescue terdekat dari Seksi Konservasi Wilayah dikerahkan langsung ke lokasi koordinat konflik.
              </p>
            </div>
          </div>

          <!-- TIMELINE STEP 4 -->
          <div class="hp-timeline-item">
            <div class="hp-timeline-badge bg-red-50 text-red-700 border-red-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
            </div>
            <div class="hp-timeline-card">
              <div class="hp-timeline-step-number">Langkah 4</div>
              <h3 class="hp-timeline-step-title">Penanganan</h3>
              <p class="hp-timeline-step-desc">
                Petugas di lapangan melakukan tindakan evakuasi (rescue), sosialisasi, atau penghalauan satwa kembali ke habitatnya.
              </p>
            </div>
          </div>

          <!-- TIMELINE STEP 5 -->
          <div class="hp-timeline-item">
            <div class="hp-timeline-badge bg-purple-50 text-purple-700 border-purple-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <div class="hp-timeline-card">
              <div class="hp-timeline-step-number">Langkah 5</div>
              <h3 class="hp-timeline-step-title">Laporan Selesai</h3>
              <p class="hp-timeline-step-desc">
                Konflik satwa selesai ditangani, status diperbarui menjadi selesai, dan laporan ditutup resmi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- JENIS KONFLIK YANG DAPAT DILAPORKAN -->
    <section class="hp-conflicts hp-animate">
      <div class="hp-section-header">
        <h2 class="hp-section-title">Jenis Konflik yang Dapat Dilaporkan</h2>
        <p class="hp-section-desc">
          Klasifikasi kejadian konflik satwa liar Riau yang dapat disampaikan melalui portal pelayanan BBKSDA
        </p>
      </div>

      <div class="hp-conflicts-grid">
        <!-- CARD 1 -->
        <div class="hp-conflict-card">
          <div class="hp-conflict-icon-box bg-green-50 text-green-700">
            01
          </div>
          <div class="hp-conflict-content">
            <h3 class="hp-conflict-title">Satwa Masuk Permukiman</h3>
            <p class="hp-conflict-desc">Kemunculan satwa liar seperti harimau sumatera, beruang madu, gajah, atau ular sanca besar mendekati atau masuk ke pekarangan dan rumah warga.</p>
          </div>
        </div>

        <!-- CARD 2 -->
        <div class="hp-conflict-card">
          <div class="hp-conflict-icon-box bg-emerald-50 text-emerald-700">
            02
          </div>
          <div class="hp-conflict-content">
            <h3 class="hp-conflict-title">Satwa Merusak Kebun/Ladang</h3>
            <p class="hp-conflict-desc">Insiden satwa dilindungi (seperti gajah sumatera atau kawanan monyet ekor panjang) yang memakan, merusak, atau menerobos wilayah perkebunan komoditas.</p>
          </div>
        </div>

        <!-- CARD 3 -->
        <div class="hp-conflict-card">
          <div class="hp-conflict-icon-box bg-blue-50 text-blue-700">
            03
          </div>
          <div class="hp-conflict-content">
            <h3 class="hp-conflict-title">Satwa Muncul di Sungai atau Kolam</h3>
            <p class="hp-conflict-desc">Kemunculan predator air berbahaya seperti buaya muara di area sungai, parit pemukiman, bendungan, atau kolam ikan tempat warga aktif beraktivitas.</p>
          </div>
        </div>

        <!-- CARD 4 -->
        <div class="hp-conflict-card">
          <div class="hp-conflict-icon-box bg-rose-50 text-rose-700">
            04
          </div>
          <div class="hp-conflict-content">
            <h3 class="hp-conflict-title">Satwa Menyerang Ternak</h3>
            <p class="hp-conflict-desc">Serangan satwa liar karnivora (macan dahan, harimau, buaya, atau piton besar) terhadap hewan ternak peliharaan warga seperti sapi, kambing, dan ayam.</p>
          </div>
        </div>

        <!-- CARD 5 -->
        <div class="hp-conflict-card">
          <div class="hp-conflict-icon-box bg-teal-50 text-teal-700">
            05
          </div>
          <div class="hp-conflict-content">
            <h3 class="hp-conflict-title">Satwa Ditemukan Terluka atau Mati</h3>
            <p class="hp-conflict-desc">Laporan penemuan satwa liar dilindungi yang berada dalam keadaan sakit, terkena jerat pemburu, terluka fisik parah, atau dalam keadaan mati tragis.</p>
          </div>
        </div>

        <!-- CARD 6 -->
        <div class="hp-conflict-card">
          <div class="hp-conflict-icon-box bg-purple-50 text-purple-700">
            06
          </div>
          <div class="hp-conflict-content">
            <h3 class="hp-conflict-title">Kejadian Lain yang Membahayakan Warga</h3>
            <p class="hp-conflict-desc">Segala macam konflik satwa liar tak terduga lainnya yang berpotensi membahayakan keselamatan nyawa warga dan membutuhkan respons cepat tim evakuasi.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ SECTION -->
    <section class="hp-faq hp-animate" style="max-width: 900px; margin: 0 auto 4rem; padding: 0 2rem;">
      <div class="hp-section-header" style="margin-bottom: 2rem;">
        <h2 class="hp-section-title">Pertanyaan yang Sering Diajukan (FAQ)</h2>
        <p class="hp-section-desc">
          Informasi lengkap seputar mekanisme pelaporan online, proses tindak lanjut, dan jaminan keamanan data.
        </p>
      </div>
      <FaqAccordion />
    </section>

    <!-- KONTAK DARURAT -->
    <section class="hp-animate" style="max-width: 900px; margin: 0 auto 2rem; padding: 0 2rem;">
      <ContactDarurat />
    </section>

    <!-- CTA - NOT TOO PROMOTIONAL -->
    <section class="hp-cta hp-animate">
      <h2 class="hp-cta-title">Melihat atau mengalami kejadian konflik satwa?</h2>
      <p class="hp-cta-desc">
        Laporkan kejadian dengan data yang jelas agar dapat ditinjau oleh petugas.
      </p>
      <button class="hp-btn-report hp-btn-report-light hp-btn-lg" @click="openSafetyModal">
        Laporkan Kejadian
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    </section>

    <a
      class="hp-emergency-fab"
      :href="emergencyWhatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi WhatsApp darurat BBKSDA Riau"
      title="WhatsApp Darurat BBKSDA Riau"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.31-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.42z"/>
      </svg>
    </a>

    <div
      v-if="showSafetyModal"
      class="hp-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-modal-title"
      @click.self="showSafetyModal = false"
    >
      <div class="hp-safety-modal">
        <div class="hp-safety-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
        </div>
        <h2 id="safety-modal-title" class="hp-safety-title">Peringatan Aman</h2>
        <p class="hp-safety-message">
          PERINGATAN: Apakah Anda sudah berada di lokasi yang aman? Jika satwa masih mengancam nyawa, JANGAN isi formulir ini. Segera hubungi kontak darurat.
        </p>
        <div class="hp-safety-actions">
          <a class="hp-safety-emergency" :href="emergencyTelHref">Hubungi Darurat Sekarang</a>
          <button class="hp-safety-continue" @click="continueToReport">
            Saya Aman, Lanjut Isi Form
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── BASE ── */
.home-page {
  --green-900: #1b3a2a;
  --green-700: #2f5039;
  --green-500: #4a7c59;
  --green-400: #60a683;
  --green-100: #ddeee4;
  --green-50: #f2f7f4;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --radius: 12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 14px rgba(0,0,0,0.08);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.1);
}

/* ── HERO ── */
.hp-hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 0;
}

.hp-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(22, 52, 38, 0.90) 0%,
    rgba(27, 58, 42, 0.70) 40%,
    rgba(27, 58, 42, 0.45) 100%
  );
}

.hp-hero-content {
  position: relative;
  z-index: 2;
  padding: 3.5rem 2rem;
  max-width: 620px;
}

.hp-hero-badge {
  display: inline-block;
  background: rgba(100, 10, 10, 0.15);
  backdrop-filter: blur(6px);
  color: var(--green-100);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 6px 16px;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.2);
  margin-bottom: 1.25rem;
  text-transform: uppercase;
}

.hp-hero-title {
  font-size: 2.6rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  margin: 0 0 1.1rem;
  letter-spacing: -0.02em;
}

.hp-hero-subtitle {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.7;
  margin: 0 0 2rem;
  max-width: 520px;
}

.hp-hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ── BUTTONS ── */
.hp-btn-primary,
.hp-btn-emergency,
.hp-btn-report {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 13px 24px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.hp-btn-primary {
  background: var(--green-500);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(74, 124, 89, 0.28);
}
.hp-btn-primary:hover {
  background: var(--green-400);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(74, 124, 89, 0.38);
}

.hp-btn-emergency {
  background: #dc2626;
  color: #fff;
  border: 1px solid #b91c1c;
  box-shadow: 0 10px 26px rgba(220, 38, 38, 0.35);
  text-transform: uppercase;
}
.hp-btn-emergency:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(220, 38, 38, 0.42);
}

.hp-btn-report {
  background: rgba(255, 255, 255, 0.08);
  color: #e6f4ea;
  border: 1.5px solid rgba(216, 243, 220, 0.7);
  box-shadow: none;
  text-transform: uppercase;
}
.hp-btn-report:hover {
  background: rgba(216, 243, 220, 0.14);
  border-color: #fff;
  transform: translateY(-2px);
}

.hp-btn-report-light {
  background: transparent;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.78);
}
.hp-btn-report-light:hover {
  background: rgba(255, 255, 255, 0.12);
}

.hp-btn-lg {
  padding: 16px 36px;
  font-size: 1.05rem;
}

/* ── HIGHLIGHTS ── */
.hp-highlights {
  padding: 0;
  margin-top: -28px;
  position: relative;
  z-index: 3;
}

.hp-highlights-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  background: #fff;
  border-radius: var(--radius);
  padding: 18px 28px;
  box-shadow: var(--shadow-lg);
}

.hp-highlight {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 50px;
  transition: all 0.3s ease;
  cursor: default;
}
.hp-highlight:hover {
  background: var(--green-50);
  transform: scale(1.04);
}
.hp-highlight:hover .hp-highlight-dot {
  box-shadow: 0 0 0 4px rgba(82, 183, 136, 0.25);
  transform: scale(1.3);
}
.hp-highlight:hover .hp-highlight-text {
  color: var(--green-700);
}

.hp-highlight-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-400);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.hp-highlight-text {
  font-size: 0.88rem;
  color: var(--gray-500);
  transition: color 0.3s ease;
}

.hp-highlight-text strong {
  color: var(--gray-800);
  font-weight: 700;
}

/* ── SECTION HEADER ── */
.hp-section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.hp-section-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--gray-800);
  margin: 0 0 0.5rem;
  letter-spacing: -0.01em;
}

.hp-section-desc {
  font-size: 1rem;
  color: var(--gray-500);
  margin: 0 auto;
}

/* ── STEPS (ASYMMETRIC DESIGN) ── */
.hp-steps {
  padding: 4rem 0 3rem;
}

.hp-steps-asymmetric {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  position: relative;
}

.hp-step-custom-card {
  position: relative;
  background: #fff;
  border-radius: var(--radius);
  padding: 2.2rem 1.8rem 1.8rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  transition: all 0.3s ease;
}

/* Break symmetry with individual styling and thin borders without shadow overload */
.hp-card-type-a {
  border-left: 5px solid var(--green-500);
  border-top: 1px solid var(--gray-200);
  border-right: 1px solid var(--gray-200);
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}
.hp-card-type-a:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-left-color: var(--green-400);
}

.hp-card-type-b {
  border: 1.5px solid var(--gray-200);
  background-color: #fafaf9;
  box-shadow: var(--shadow-sm);
}
.hp-card-type-b:hover {
  transform: translateY(-5px);
  border-color: var(--green-400);
  background-color: #fff;
  box-shadow: var(--shadow-md);
}

.hp-card-type-c {
  border: 1px solid var(--gray-200);
  background: linear-gradient(180deg, #fff 0%, #fffbf8 100%);
  box-shadow: var(--shadow-sm);
}
.hp-card-type-c:hover {
  transform: translateY(-5px);
  border-color: #ff9800;
  box-shadow: 0 8px 24px rgba(255, 152, 0, 0.08);
}

.hp-card-num-badge {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-size: 2.5rem;
  font-weight: 800;
  opacity: 0.07;
  user-select: none;
  font-family: var(--font-mono);
}

.hp-card-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  margin-bottom: 1.25rem;
}

.hp-card-title-custom {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 0.5rem;
}

.hp-card-desc-custom {
  font-size: 0.9rem;
  color: var(--gray-500);
  line-height: 1.6;
  margin: 0;
}

/* ── ALUR PENANGANAN LAPORAN (TIMELINE) ── */
.hp-timeline-section {
  padding: 4rem 2rem;
  background-color: var(--green-50);
  border-radius: var(--radius);
  border: 1px solid var(--green-100);
  margin-bottom: 4rem;
}

.hp-timeline-wrapper {
  position: relative;
  max-width: 1000px;
  margin: 2.5rem auto 0;
}

/* Central dashed track for desktop */
.hp-timeline-progress-bar {
  position: absolute;
  top: 36px;
  left: 4%;
  right: 4%;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    var(--green-100) 0px,
    var(--green-100) 8px,
    transparent 8px,
    transparent 16px
  );
  z-index: 1;
}

.hp-timeline-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  position: relative;
  z-index: 2;
}

.hp-timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hp-timeline-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fff;
  box-shadow: var(--shadow-sm);
  background-color: #fff;
  transition: all 0.3s ease;
  margin-bottom: 1.25rem;
}
.hp-timeline-item:hover .hp-timeline-badge {
  transform: scale(1.15) rotate(5deg);
  box-shadow: var(--shadow-md);
  border-color: currentColor;
}

.hp-timeline-card {
  background: #fff;
  border: 1px solid var(--green-100);
  border-radius: 12px;
  padding: 1.25rem 1rem;
  width: 100%;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}
.hp-timeline-item:hover .hp-timeline-card {
  box-shadow: var(--shadow-md);
  border-color: var(--green-400);
  transform: translateY(-2px);
}

.hp-timeline-step-number {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--green-500);
  margin-bottom: 0.25rem;
}

.hp-timeline-step-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 0.5rem;
}

.hp-timeline-step-desc {
  font-size: 0.8rem;
  color: var(--gray-500);
  line-height: 1.45;
  margin: 0;
}

/* ── JENIS KONFLIK YANG DAPAT DILAPORKAN ── */
.hp-conflicts {
  padding: 1rem 0 4rem;
}

.hp-conflicts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.hp-conflict-card {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}
.hp-conflict-card:hover {
  transform: translateY(-3px);
  border-color: var(--green-400);
  box-shadow: var(--shadow-md);
}

.hp-conflict-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 1.15rem;
}

.hp-conflict-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 0.4rem;
}

.hp-conflict-desc {
  font-size: 0.85rem;
  color: var(--gray-500);
  line-height: 1.55;
  margin: 0;
}

/* ── CTA ── */
.hp-cta {
  text-align: center;
  padding: 3.5rem 2rem;
  background: linear-gradient(135deg, var(--green-900) 0%, var(--green-700) 100%);
  border-radius: var(--radius);
  margin-bottom: 1rem;
}

.hp-cta-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.6rem;
}

.hp-cta-desc {
  font-size: 1rem;
  color: rgba(255,255,255,0.75);
  margin: 0 0 1.75rem;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* ── SCROLL ANIMATION ── */
.hp-animate {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.hp-animate.hp-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── RESPONSIVE ── */
.hp-emergency-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1200;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #16a34a;
  border: 2px solid #fff;
  box-shadow: 0 16px 34px rgba(22, 163, 74, 0.35), 0 4px 12px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.hp-emergency-fab:hover {
  background: #15803d;
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 20px 42px rgba(22, 163, 74, 0.42), 0 6px 16px rgba(0, 0, 0, 0.2);
}

.hp-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(17, 24, 39, 0.72);
  backdrop-filter: blur(4px);
}

.hp-safety-modal {
  width: min(100%, 520px);
  background: #fff;
  border-radius: 12px;
  border: 2px solid #ef4444;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  padding: 2rem;
  text-align: center;
}

.hp-safety-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #dc2626;
}

.hp-safety-title {
  margin: 0 0 0.75rem;
  color: #991b1b;
  font-size: 1.45rem;
  font-weight: 900;
  text-transform: uppercase;
}

.hp-safety-message {
  margin: 0;
  color: #374151;
  line-height: 1.65;
  font-weight: 600;
}

.hp-safety-actions {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

.hp-safety-emergency,
.hp-safety-continue {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: 10px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
}

.hp-safety-emergency {
  background: #dc2626;
  border: 1px solid #b91c1c;
  color: #fff;
}
.hp-safety-emergency:hover {
  background: #b91c1c;
}

.hp-safety-continue {
  background: transparent;
  border: none;
  color: #374151;
}
.hp-safety-continue:hover {
  color: var(--green-700);
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .hp-timeline-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .hp-timeline-progress-bar {
    top: 0;
    bottom: 0;
    left: 48px;
    width: 3px;
    height: 100%;
    background: repeating-linear-gradient(
      180deg,
      var(--green-100) 0px,
      var(--green-100) 8px,
      transparent 8px,
      transparent 16px
    );
  }
  .hp-timeline-item {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    gap: 16px;
  }
  .hp-timeline-badge {
    margin-bottom: 0;
    flex-shrink: 0;
    z-index: 2;
  }
  .hp-timeline-card {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .hp-hero {
    min-height: 420px;
  }
  .hp-hero-content {
    padding: 2.5rem 1.5rem;
  }
  .hp-hero-title {
    font-size: 1.85rem;
  }
  .hp-hero-subtitle {
    font-size: 0.95rem;
  }
  .hp-highlights-bar {
    gap: 1rem;
    padding: 16px 20px;
  }
  .hp-steps-asymmetric {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .hp-conflicts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .hp-section-title {
    font-size: 1.5rem;
  }
  .hp-cta-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .hp-hero-title {
    font-size: 1.55rem;
  }
  .hp-hero-actions {
    flex-direction: column;
  }
  .hp-btn-primary {
    width: 100%;
    justify-content: center;
  }
  .hp-btn-emergency,
  .hp-btn-report {
    width: 100%;
  }
  .hp-emergency-fab {
    right: 18px;
    bottom: 18px;
  }
}
</style>
