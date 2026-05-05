<div align="center">

<img src="portal-bbksda/public/logo-BBKSDA.png" alt="Logo BBKSDA Riau" width="100" />

# 🌿 Portal Pelayanan Konflik Satwa
### BBKSDA Riau — Balai Besar Konservasi Sumber Daya Alam Riau

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-42b883?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> Sistem pelaporan konflik satwa liar berbasis web untuk membantu masyarakat Riau melaporkan kejadian konflik dengan satwa dilindungi secara cepat, mudah, dan terorganisir.

</div>

---

## 📋 Tentang Proyek

Portal ini merupakan sistem informasi digital yang dikembangkan untuk mendukung **BBKSDA Riau** (Kementerian Lingkungan Hidup dan Kehutanan) dalam menangani laporan konflik antara manusia dan satwa liar di Provinsi Riau.

Masyarakat dapat melaporkan kejadian secara langsung melalui web, melacak status laporan secara *real-time*, dan admin BBKSDA dapat mengelola seluruh laporan dari satu dashboard terpusat.

---

## ✨ Fitur Utama

### 👤 Untuk Masyarakat (Reporter)
- **📝 Buat Laporan** — Laporkan konflik satwa dengan form lengkap (lokasi GPS, foto, deskripsi)
- **📍 Pilih Lokasi di Peta** — Integrasi Leaflet.js dengan batas wilayah Provinsi Riau
- **📂 Laporan Saya** — Pantau semua laporan yang pernah dikirimkan
- **🔔 Notifikasi Real-time** — Terima update status laporan secara langsung tanpa refresh
- **📶 Mode Offline** — Laporan tersimpan lokal dan otomatis terkirim saat online kembali (PWA)

### 🛡️ Untuk Admin BBKSDA
- **📊 Dashboard Statistik** — Ringkasan laporan dengan grafik dan counter animasi
- **🗺️ Peta Sebaran** — Visualisasi titik konflik satwa di seluruh Riau
- **📋 Kelola Laporan** — Filter, cari, verifikasi, dan update status laporan
- **📅 Rekap Bulanan** — Laporan rekapitulasi bulanan yang bisa diekspor ke PDF
- **🔔 Notifikasi Masuk** — Alert real-time saat ada laporan baru dari masyarakat

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend Framework** | Vue.js 3 (Composition API + `<script setup>`) |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 3 |
| **State Management** | Pinia |
| **Routing** | Vue Router 4 |
| **Database & Auth** | Firebase Firestore + Firebase Auth |
| **Peta** | Leaflet.js |
| **Grafik** | Chart.js 4 |
| **Form Validation** | VeeValidate + Yup |
| **Export PDF** | jsPDF + html2canvas |
| **PWA** | vite-plugin-pwa |
| **Backend (visitor counter)** | Python Flask |
| **Deployment** | Vercel |

---

## 🗂️ Struktur Proyek

```
Portal-Pelayanan-Konflik-Satwa/
├── portal-bbksda/          # Frontend Vue.js
│   ├── public/             # Aset publik (logo, favicon)
│   └── src/
│       ├── assets/         # CSS global & gambar
│       ├── components/     # Komponen reusable (Header, Notifikasi, Map, dll)
│       ├── composables/    # Logic yang bisa dipakai ulang (useReports, dll)
│       ├── router/         # Konfigurasi Vue Router
│       ├── stores/         # Pinia stores (auth, reports, notifikasi)
│       ├── utils/          # Helper functions & error handler
│       ├── views/          # Halaman-halaman utama
│       │   ├── HomePage.vue
│       │   ├── LaporPage.vue
│       │   ├── PetaPage.vue
│       │   ├── LaporanSayaPage.vue
│       │   ├── DashboardPage.vue
│       │   ├── LihatLaporanPage.vue
│       │   ├── DetailPage.vue
│       │   └── RekapBulananPage.vue
│       ├── App.vue
│       ├── firebase.js     # Konfigurasi Firebase
│       └── main.js
├── app.py                  # Backend Flask (visitor counter)
├── requirements.txt
└── vercel.json             # Konfigurasi deployment Vercel
```

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Node.js `>= 18`
- npm `>= 9`
- Python `>= 3.9` *(opsional, untuk backend)*

### 1. Clone repositori

```bash
git clone https://github.com/Kizeee/Portal-Pelayanan-Konflik-Satwa.git
cd Portal-Pelayanan-Konflik-Satwa
```

### 2. Setup Frontend

```bash
cd portal-bbksda
npm install
```

Buat file `.env` di dalam folder `portal-bbksda/`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Jalankan development server:

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 3. Setup Backend *(opsional)*

```bash
cd ..
pip install -r requirements.txt
python app.py
```

Backend Flask berjalan di `http://localhost:5000`

---

## 🔄 Alur Status Laporan

```
Dikirim → Diterima → Ditindaklanjuti → Selesai
                  ↘ Ditolak
```

Setiap perubahan status akan langsung memicu notifikasi real-time kepada pelapor.

---

## 📸 Halaman Utama

| Halaman | Deskripsi |
|---|---|
| `/` | Beranda — informasi portal & statistik singkat |
| `/lapor` | Form pelaporan konflik satwa |
| `/peta` | Peta sebaran konflik di Provinsi Riau |
| `/laporan-saya` | Riwayat laporan milik pelapor |
| `/admin/dashboard` | Dashboard statistik admin *(auth required)* |
| `/admin/laporan` | Kelola & verifikasi semua laporan *(auth required)* |
| `/admin/rekap-bulanan` | Rekap bulanan & ekspor PDF *(auth required)* |

---

## 🌍 Deployment

Proyek ini di-deploy di **Vercel** dengan konfigurasi SPA rewrite agar semua route diarahkan ke `index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🤝 Kontribusi

Proyek ini dibuat sebagai sistem pelayanan publik. Saran dan kontribusi sangat terbuka.

1. Fork repositori ini
2. Buat branch fitur: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buka Pull Request

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).

---

<div align="center">

Dikembangkan untuk mendukung **Konservasi Satwa Liar Provinsi Riau** 🌿

*Kementerian Lingkungan Hidup dan Kehutanan — BBKSDA Riau*

</div>
