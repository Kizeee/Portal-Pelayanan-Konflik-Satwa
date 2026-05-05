<<<<<<< HEAD
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
=======
Portal Pelayanan dan Visualisasi Data Konflik Satwa
Portal Pelayanan dan Visualisasi Data Konflik Satwa adalah aplikasi web yang dirancang untuk membantu proses pelaporan, pengelolaan, verifikasi, dan visualisasi data konflik satwa di wilayah kerja BBKSDA Riau. Sistem ini dikembangkan sebagai bagian dari penelitian Tugas Akhir dengan judul “Rancang Bangun Portal Pelayanan dan Visualisasi Data Konflik Satwa Berbasis Web (Studi Kasus: BBKSDA Riau)”.
Aplikasi ini bertujuan untuk menggantikan proses pelaporan yang sebelumnya masih bersifat naratif melalui WhatsApp atau media sosial menjadi sistem pelaporan digital yang lebih terstruktur, terpusat, dan mudah dianalisis. Data laporan yang masuk dapat divisualisasikan dalam bentuk peta sebaran konflik dan dashboard statistik untuk mendukung proses pemantauan serta pengambilan keputusan.
---
Fitur Utama
Form pelaporan konflik satwa berbasis web.
Input data pelapor, jenis satwa, jenis konflik, lokasi, deskripsi, dan foto bukti.
Penyimpanan data laporan secara terpusat menggunakan Firebase.
Upload dan manajemen foto bukti menggunakan Cloudinary.
Visualisasi titik lokasi konflik menggunakan OpenStreetMap.
Dashboard statistik untuk menampilkan tren konflik berdasarkan data laporan.
Verifikasi laporan oleh admin.
Status laporan seperti `pending`, `verified`, dan `rejected`.
Dukungan Progressive Web App (PWA) agar aplikasi lebih ringan dan dapat diakses lebih baik pada kondisi jaringan terbatas.
---
Tech Stack
Frontend
Vue.js
Vue Router
Pinia
Vite
HTML
CSS
JavaScript
Backend dan Database
Firebase
Firebase Realtime Database / Firestore
Firebase Authentication
Media Management
Cloudinary
Map dan Visualisasi Spasial
OpenStreetMap
Leaflet / library peta berbasis OSM
PWA
Service Worker
Web App Manifest
Deployment
Vercel
---
Arsitektur Sistem
Secara umum, sistem terdiri dari tiga bagian utama, yaitu pengguna, aplikasi web, dan layanan cloud.
```text
+-------------------+
|    Masyarakat     |
|  Mengisi Laporan  |
+---------+---------+
          |
          v
+-------------------+
|   Aplikasi Web    |
| Vue.js + PWA      |
| Form + Dashboard  |
| Peta + Admin Panel|
+----+---------+----+
     |         |
     |         |
     v         v
+---------+   +-------------+
| Firebase|   | Cloudinary  |
| Database|   | Foto Bukti  |
| Auth    |   | Media URL   |
+----+----+   +------+------+
     |               |
     +-------+-------+
             |
             v
+-------------------+
| Admin / Pimpinan  |
| Verifikasi Data   |
| Dashboard Analitik|
| Peta Konflik      |
+-------------------+
```
Alur Sistem
Masyarakat membuka portal melalui browser.
Masyarakat mengisi formulir laporan konflik satwa.
Masyarakat memilih atau mengirimkan titik lokasi kejadian.
Masyarakat mengunggah foto bukti konflik.
Data laporan disimpan ke Firebase.
Foto bukti disimpan ke Cloudinary, kemudian URL foto disimpan pada data laporan.
Admin masuk ke sistem untuk melihat laporan yang masuk.
Admin melakukan verifikasi laporan.
Data yang sudah masuk ditampilkan pada dashboard statistik dan peta sebaran konflik.
---
Struktur Folder
Struktur folder utama proyek:
```text
Portal-Pelayanan-Konflik-Satwa/
└── portal-bbksda/
    ├── public/
    │   ├── manifest.json
    │   └── sw.js
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── router/
    │   ├── stores/
    │   ├── views/
    │   ├── services/
    │   │   ├── firebase.js
    │   │   └── cloudinary.js
    │   ├── App.vue
    │   └── main.js
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    └── README.md
```
Keterangan folder:
`public/` berisi file publik seperti manifest dan service worker.
`src/assets/` berisi file gambar, ikon, atau aset statis.
`src/components/` berisi komponen antarmuka yang dapat digunakan ulang.
`src/router/` berisi konfigurasi rute halaman.
`src/stores/` berisi state management menggunakan Pinia.
`src/views/` berisi halaman utama aplikasi.
`src/services/` berisi konfigurasi layanan seperti Firebase dan Cloudinary.
`App.vue` adalah komponen utama aplikasi.
`main.js` adalah entry point aplikasi Vue.
---
Rancangan Struktur Database Firebase
Contoh rancangan struktur data laporan:
```json
{
  "reports": {
    "reportId": {
      "namaPelapor": "string",
      "noHp": "string",
      "alamat": "string",
      "jenisSatwa": "string",
      "jenisKonflik": "string",
      "deskripsi": "string",
      "lokasi": {
        "latitude": "number",
        "longitude": "number",
        "alamatLokasi": "string"
      },
      "fotoUrl": "string",
      "status": "pending | verified | rejected",
      "catatanAdmin": "string",
      "createdAt": "timestamp",
      "verifiedAt": "timestamp",
      "verifiedBy": "string"
    }
  },
  "users": {
    "userId": {
      "nama": "string",
      "email": "string",
      "role": "admin | pimpinan",
      "createdAt": "timestamp"
    }
  }
}
```
---
Cara Install dan Menjalankan Project
1. Clone repository
```bash
git clone https://github.com/Kizeee/Portal-Pelayanan-Konflik-Satwa.git
```
2. Masuk ke folder project
```bash
cd Portal-Pelayanan-Konflik-Satwa/portal-bbksda
```
3. Install dependency
```bash
npm install
```
4. Buat file environment
Buat file `.env` pada folder `portal-bbksda`, lalu isi konfigurasi berikut sesuai project Firebase dan Cloudinary masing-masing.
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```
> Catatan: Jangan mengunggah file `.env` ke repository publik. Gunakan `.env.example` sebagai contoh konfigurasi.
5. Jalankan project pada mode development
```bash
npm run dev
```
Setelah perintah dijalankan, aplikasi dapat dibuka melalui alamat lokal yang muncul di terminal, umumnya:
```text
http://localhost:5173
```
6. Build project untuk production
```bash
npm run build
```
7. Preview hasil build
```bash
npm run preview
```
---
Konfigurasi Firebase
Sistem menggunakan Firebase sebagai layanan backend dan database. Langkah konfigurasi Firebase:
Masuk ke Firebase Console.
Buat project baru.
Aktifkan Firebase Authentication jika sistem menggunakan login admin.
Aktifkan Realtime Database atau Firestore.
Salin konfigurasi Firebase ke file `.env`.
Pastikan rules database disesuaikan agar data aman dan hanya admin yang dapat melakukan verifikasi.
Contoh aturan awal untuk pengembangan:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
> Aturan di atas hanya untuk tahap pengembangan. Untuk production, gunakan rules yang lebih aman berdasarkan autentikasi dan role pengguna.
---
Konfigurasi Cloudinary
Cloudinary digunakan untuk menyimpan dan mengelola foto bukti laporan konflik satwa.
Langkah konfigurasi:
Buat akun Cloudinary.
Buat upload preset.
Atur upload preset menjadi unsigned jika upload dilakukan langsung dari frontend.
Masukkan `cloud_name` dan `upload_preset` ke file `.env`.
---
Peran Pengguna
Masyarakat
Masyarakat berperan sebagai pelapor. Fitur yang dapat digunakan:
Mengisi laporan konflik satwa.
Mengunggah foto bukti.
Mengirim lokasi kejadian.
Melihat informasi umum portal.
Admin
Admin berperan sebagai pengelola data laporan. Fitur yang dapat digunakan:
Login ke sistem.
Melihat daftar laporan.
Memeriksa detail laporan.
Melakukan verifikasi atau penolakan laporan.
Menambahkan catatan verifikasi.
Melihat dashboard statistik.
Melihat peta sebaran konflik.
Pimpinan
Pimpinan berperan sebagai pengguna informasi. Fitur yang dapat digunakan:
Melihat dashboard statistik.
Melihat peta hotspot konflik.
Menggunakan data sebagai bahan evaluasi dan pengambilan keputusan.
---
Status Laporan
Status	Keterangan
`pending`	Laporan baru masuk dan menunggu verifikasi admin.
`verified`	Laporan telah diverifikasi dan dianggap valid.
`rejected`	Laporan ditolak karena data tidak lengkap atau tidak valid.
---
Tujuan Pengembangan
Pengembangan sistem ini bertujuan untuk:
Menstandarisasi proses pelaporan konflik satwa.
Mengurangi fragmentasi data akibat pelaporan melalui WhatsApp atau media sosial.
Menyediakan basis data konflik satwa yang terstruktur.
Menampilkan sebaran lokasi konflik secara spasial.
Menyediakan dashboard analitik untuk membantu pimpinan dalam memahami tren konflik.
Meningkatkan aksesibilitas pelaporan melalui pendekatan Progressive Web App.
---
Pengujian Sistem
Pengujian sistem dapat dilakukan menggunakan metode Black Box Testing dengan memeriksa fungsi-fungsi utama berikut:
No	Fitur yang Diuji	Skenario Pengujian	Hasil yang Diharapkan
1	Form laporan	Pengguna mengisi dan mengirim laporan	Data berhasil tersimpan ke Firebase
2	Upload foto	Pengguna mengunggah foto bukti	Foto tersimpan ke Cloudinary dan URL tersimpan di Firebase
3	Peta lokasi	Pengguna memilih titik lokasi	Koordinat latitude dan longitude tersimpan
4	Login admin	Admin masuk dengan akun terdaftar	Admin berhasil masuk ke dashboard
5	Verifikasi laporan	Admin mengubah status laporan	Status laporan berubah sesuai pilihan
6	Dashboard	Admin membuka halaman dashboard	Statistik laporan tampil berdasarkan data
7	PWA	Pengguna membuka aplikasi di perangkat mobile	Aplikasi dapat diakses dengan tampilan responsif
---
Roadmap Pengembangan
[x] Inisialisasi project Vue.js.
[x] Integrasi routing halaman.
[x] Integrasi Firebase.
[x] Integrasi Cloudinary.
[x] Form pelaporan masyarakat.
[x] Dashboard admin.
[x] Visualisasi peta konflik.
[x] Dukungan PWA.
[ ] Pengujian Black Box Testing.
[ ] Validasi pengguna.
[ ] Optimasi keamanan database rules.
[ ] Export laporan PDF.
---
Author
Maulana Rizky  
NPM: 223510441  
Program Studi Teknik Informatika  
Fakultas Teknik  
Universitas Islam Riau
---
Lisensi
Project ini dikembangkan untuk kebutuhan penelitian Tugas Akhir. Penggunaan, pengembangan, atau distribusi ulang kode dapat disesuaikan dengan kebutuhan akademik dan pengembangan sistem lebih lanjut.
>>>>>>> 7e66a90759d869ca5556f9ca929aca80aafcf41a
