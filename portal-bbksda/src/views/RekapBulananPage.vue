<script setup>
import { ref, computed, onMounted } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import StatCard from '../components/charts/StatCard.vue';
import BarChart from '../components/charts/BarChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';
import { useUIStore } from '../stores/ui';

const allReports = ref([]);
const isLoading = ref(true);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const uiStore = useUIStore();
const adminCatatanRekap = ref('');
const isGeneratingPdf = ref(false);

const STATUS_GROUPS = {
  pending: ['Menunggu Verifikasi', 'pending'],
  accepted: ['Diterima', 'verified'],
  process: ['Tim Menuju Lokasi', 'Penanganan di Lokasi', 'Diproses'],
  completed: ['Selesai'],
  rejected: ['Ditolak', 'Tidak Valid', 'ditolak'],
};

const hasStatus = (report, statuses) => statuses.includes(report.status);
const isPendingReport = (report) => hasStatus(report, STATUS_GROUPS.pending);
const isAcceptedReport = (report) => hasStatus(report, STATUS_GROUPS.accepted);
const isProcessReport = (report) => hasStatus(report, STATUS_GROUPS.process);
const isCompletedReport = (report) => hasStatus(report, STATUS_GROUPS.completed);
const isRejectedReport = (report) => hasStatus(report, STATUS_GROUPS.rejected);
const isValidReport = (report) => (
  isAcceptedReport(report) ||
  isProcessReport(report) ||
  isCompletedReport(report)
);

onMounted(async () => {
  try {
    const q = query(collection(db, 'laporan'));
    const querySnapshot = await getDocs(q);
    allReports.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      let createdAt = null;
      if (data.createdAt) {
        createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      }
      return { id: doc.id, ...data, createdAt };
    });
  } catch (error) {
    console.error("Error fetching reports: ", error);
  } finally {
    isLoading.value = false;
  }
});

const formatMonth = (month) => {
    if (!month) return '';
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

const formatRupiah = (val) => {
  if (!val || val === 0) return 'Rp 0';
  return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const normalizeReport = (r) => {
  return {
    ...r,
    prioritas: r.prioritas || 'Sedang',
    estimasiKerugian: Number(r.estimasi_kerugian) || 0,
    petugasPenanganan: r.statusHistory && r.statusHistory.length ? (r.statusHistory[r.statusHistory.length - 1].updatedBy || '-') : '-',
    statusSatwaAkhir: r.status_satwa_akhir || '-',
    catatanAdmin: r.statusHistory && r.statusHistory.length ? (r.statusHistory[r.statusHistory.length - 1].notes || '-') : '-',
    lokasi: r.kabupatenKota || r.lokasi || 'Tidak diketahui',
    kategoriKonflik: r.kategoriKonflik || '-',
    status: r.status || 'Menunggu Verifikasi',
    jenisSatwa: r.jenisSatwa || 'Lainnya',
    tanggalKejadian: r.tanggal || r.createdAt
  };
};

const filteredReports = computed(() => {
  if (!selectedMonth.value) return [];
  const [year, month] = selectedMonth.value.split('-').map(Number);
  return allReports.value.filter(report => {
    if (!report.createdAt) return false;
    return report.createdAt.getFullYear() === year && (report.createdAt.getMonth() + 1) === month;
  }).map(normalizeReport);
});

const validReports = computed(() => filteredReports.value.filter(isValidReport));

// A. KARTU STATISTIK STATUS LAPORAN
const reportStats = computed(() => {
  const reports = filteredReports.value;
  const valid = validReports.value;
  const total = reports.length;
  const prioritasCounts = valid.reduce((acc, report) => {
    acc[report.prioritas] = (acc[report.prioritas] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    valid: valid.length,
    pending: reports.filter(isPendingReport).length,
    verified: reports.filter(isAcceptedReport).length,
    diproses: reports.filter(isProcessReport).length,
    selesai: reports.filter(isCompletedReport).length,
    ditolak: reports.filter(isRejectedReport).length,
    tinggiDarurat: (prioritasCounts['Tinggi'] || 0) + (prioritasCounts['Darurat'] || 0)
  };
});

// B. ESTIMASI KERUGIAN
const kerugianStats = computed(() => {
  const reports = validReports.value;
  const totalKerugian = reports.reduce((acc, r) => acc + r.estimasiKerugian, 0);
  const avgKerugian = reports.length > 0 ? totalKerugian / reports.length : 0;
  let maxKerugian = 0;
  let maxReport = null;
  reports.forEach(r => {
    if (r.estimasiKerugian > maxKerugian) { maxKerugian = r.estimasiKerugian; maxReport = r; }
  });
  return {
    hasData: totalKerugian > 0,
    total: formatRupiah(totalKerugian),
    avg: formatRupiah(avgKerugian),
    max: formatRupiah(maxKerugian),
    maxReportId: maxReport ? (maxReport.idLaporan || maxReport.id) : '-'
  };
});

// C. LOKASI TERBANYAK
const topLokasi = computed(() => {
  const counts = validReports.value.reduce((acc, r) => {
    let loc = r.lokasi.trim().toLowerCase();
    if (loc === 'pku' || loc.includes('pekanbaru')) loc = 'Kota Pekanbaru';
    else loc = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map((item, idx) => ({ peringkat: idx + 1, lokasi: item[0], jumlah: item[1] }));
});

// D. RINGKASAN NARATIF OTOMATIS
const ringkasanNaratif = computed(() => {
  const reports = filteredReports.value;
  const valid = validReports.value;
  if (reports.length === 0) return 'Belum ada laporan konflik satwa pada periode ini.';
  if (valid.length === 0) {
    return `Pada bulan ${formatMonth(selectedMonth.value)} terdapat ${reports.length} laporan masuk, tetapi belum ada laporan yang telah diverifikasi valid. ${reportStats.value.pending} laporan masih menunggu verifikasi dan ${reportStats.value.ditolak} laporan ditolak/tidak valid.`;
  }
  const satwaCounts = valid.reduce((acc, r) => { acc[r.jenisSatwa] = (acc[r.jenisSatwa] || 0) + 1; return acc; }, {});
  const topSatwaArr = Object.entries(satwaCounts).sort((a, b) => b[1] - a[1]);
  const topSatwa = topSatwaArr.length > 0 ? topSatwaArr[0] : ['Tidak ada', 0];
  const selesai = reportStats.value.selesai;
  const ditolak = reportStats.value.ditolak;
  const kategoriSet = new Set(valid.map(r => r.kategoriKonflik).filter(k => k && k !== '-'));
  const kategoriList = Array.from(kategoriSet).slice(0, 3).join(', ') + (kategoriSet.size > 3 ? ', dan lainnya' : '');
  return `Pada bulan ${formatMonth(selectedMonth.value)} terdapat ${reports.length} laporan masuk. Dari jumlah tersebut, ${valid.length} laporan telah masuk kategori valid/ditindaklanjuti, ${reportStats.value.pending} laporan masih menunggu verifikasi, dan ${ditolak} laporan ditolak/tidak valid. Jenis satwa yang paling banyak muncul pada laporan valid adalah ${topSatwa[0]} dengan ${topSatwa[1]} kejadian. ${selesai} laporan valid telah selesai ditangani. ${kategoriSet.size > 0 ? `Kategori konflik yang muncul meliputi ${kategoriList}.` : ''}`;
});

// I. KESIMPULAN REKAP BULANAN
const kesimpulanNaratif = computed(() => {
  const reports = validReports.value;
  if (reports.length === 0) return 'Tidak terdapat laporan konflik satwa pada periode ini sehingga belum ada kesimpulan yang dapat ditampilkan.';
  const selesai = reportStats.value.selesai;
  const persenSelesai = (selesai / reports.length) * 100;
  if (persenSelesai >= 70) {
    return `Berdasarkan data laporan bulan ${formatMonth(selectedMonth.value)}, sebagian besar laporan telah selesai ditangani (${Math.round(persenSelesai)}%). Kinerja penanganan konflik satwa pada bulan ini cukup responsif. Data ini dapat digunakan sebagai bahan evaluasi dan dokumentasi bulanan instansi BBKSDA Riau.`;
  } else {
    return `Berdasarkan data laporan bulan ${formatMonth(selectedMonth.value)}, banyak laporan yang masih dalam proses penanganan atau menunggu verifikasi. Perlu ada evaluasi terhadap percepatan respons petugas di lapangan. Data ini dapat digunakan sebagai dokumentasi dan bahan tindak lanjut instansi BBKSDA Riau.`;
  }
});

// E. GRAFIK DISTRIBUSI STATUS
const statusChartData = computed(() => {
  const data = reportStats.value;
  return {
    labels: ['Menunggu Verifikasi', 'Diterima', 'Dalam Proses', 'Selesai', 'Ditolak/Tidak Valid'],
    datasets: [{
      label: 'Distribusi Status',
      data: [data.pending, data.verified, data.diproses, data.selesai, data.ditolak],
      backgroundColor: ['#F59E0B', '#3B82F6', '#6366F1', '#16A34A', '#DC2626']
    }]
  };
});

const satwaChartData = computed(() => {
  const satwaCounts = validReports.value.reduce((acc, r) => { acc[r.jenisSatwa] = (acc[r.jenisSatwa] || 0) + 1; return acc; }, {});
  return {
    labels: Object.keys(satwaCounts),
    datasets: [{
      label: 'Laporan per Jenis Satwa',
      backgroundColor: '#4A90E2',
      data: Object.values(satwaCounts),
    }],
  };
});

// F. GRAFIK PRIORITAS
const prioritasChartData = computed(() => {
  const counts = validReports.value.reduce((acc, r) => {
    acc[r.prioritas] = (acc[r.prioritas] || 0) + 1;
    return acc;
  }, {});
  return {
    labels: ['Rendah', 'Sedang', 'Tinggi', 'Darurat'],
    datasets: [{
      label: 'Distribusi Prioritas',
      data: [counts['Rendah']||0, counts['Sedang']||0, counts['Tinggi']||0, counts['Darurat']||0],
      backgroundColor: ['#10B981', '#F59E0B', '#EC4899', '#DC2626']
    }]
  };
});

// J. PDF EXPORT LEBIH FORMAL
const downloadPdf = () => {
  if (filteredReports.value.length === 0) {
    uiStore.showNotification('error', 'Gagal', 'Tidak ada data pada periode ini');
    return;
  }
  isGeneratingPdf.value = true;
  uiStore.showNotification('info', 'Memproses', 'Sedang membuat PDF, mohon tunggu...');
  
  try {
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape agar tabel panjang muat
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Kop Surat
    pdf.setFontSize(11);
    pdf.setTextColor(100);
    pdf.text('KEMENTERIAN LINGKUNGAN HIDUP DAN KEHUTANAN', pageWidth/2, 15, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setTextColor(0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BALAI BESAR KSDA RIAU', pageWidth/2, 22, { align: 'center' });
    pdf.setLineWidth(0.5);
    pdf.line(15, 26, pageWidth - 15, 26);
    
    // Judul
    pdf.setFontSize(12);
    pdf.text('REKAPITULASI LAPORAN KONFLIK SATWA', pageWidth/2, 35, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Periode: ${formatMonth(selectedMonth.value)}`, pageWidth/2, 41, { align: 'center' });
    
    const printDate = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    pdf.setFontSize(8);
    pdf.text(`Dicetak pada: ${printDate} WIB`, 15, 48);
    
    // A. Ringkasan Statistik
    let startY = 55;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('A. RINGKASAN STATISTIK', 15, startY);
    pdf.setFont('helvetica', 'normal');
    startY += 6;
    pdf.text(`- Total Laporan Masuk: ${reportStats.value.total}`, 20, startY); startY += 5;
    pdf.text(`- Laporan Valid/Ditindaklanjuti: ${reportStats.value.valid}`, 20, startY); startY += 5;
    pdf.text(`- Menunggu Verifikasi: ${reportStats.value.pending}`, 20, startY); startY += 5;
    pdf.text(`- Diterima / Dalam Proses: ${reportStats.value.verified + reportStats.value.diproses}`, 20, startY); startY += 5;
    pdf.text(`- Selesai: ${reportStats.value.selesai} | Ditolak: ${reportStats.value.ditolak}`, 20, startY); startY += 5;
    pdf.text(`- Prioritas Tinggi/Darurat: ${reportStats.value.tinggiDarurat}`, 20, startY); startY += 5;
    pdf.text(`- Total Estimasi Kerugian: ${kerugianStats.value.total}`, 20, startY); startY += 10;
    
    // B. Ringkasan Naratif
    pdf.setFont('helvetica', 'bold');
    pdf.text('B. RINGKASAN BULANAN', 15, startY);
    pdf.setFont('helvetica', 'normal');
    startY += 6;
    const splitNaratif = pdf.splitTextToSize(ringkasanNaratif.value, pageWidth - 30);
    pdf.text(splitNaratif, 15, startY);
    startY += (splitNaratif.length * 5) + 5;
    
    // C. Tabel Daftar Laporan Valid
    pdf.setFont('helvetica', 'bold');
    pdf.text('C. DAFTAR LAPORAN VALID', 15, startY);
    startY += 4;
    
    const tableBody = validReports.value.map(r => [
      r.idLaporan || r.id,
      formatDate(r.tanggalKejadian),
      r.nama || r.namaPelapor || '-',
      r.jenisSatwa,
      r.kategoriKonflik,
      r.lokasi,
      r.prioritas,
      r.status,
      formatRupiah(r.estimasiKerugian),
      r.petugasPenanganan
    ]);
    
    if (tableBody.length > 0) {
      autoTable(pdf, {
        startY: startY,
        head: [['ID Laporan', 'Tgl Kejadian', 'Pelapor', 'Satwa', 'Kategori', 'Lokasi', 'Prioritas', 'Status', 'Kerugian', 'Petugas']],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [46, 125, 50] } // brand-green
      });
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.text('Belum ada laporan valid pada periode ini.', 15, startY + 6);
    }
    
    let finalY = (tableBody.length > 0 ? pdf.lastAutoTable.finalY : startY + 10) + 10;
    
    // D. Catatan Admin
    if (adminCatatanRekap.value.trim() !== '') {
      if (finalY > 170) { pdf.addPage(); finalY = 20; }
      pdf.setFont('helvetica', 'bold');
      pdf.text('D. CATATAN EVALUASI ADMIN', 15, finalY);
      pdf.setFont('helvetica', 'normal');
      finalY += 6;
      const splitCatatan = pdf.splitTextToSize(adminCatatanRekap.value, pageWidth - 30);
      pdf.text(splitCatatan, 15, finalY);
      finalY += (splitCatatan.length * 5) + 5;
    }
    
    // E. Kesimpulan
    if (finalY > 170) { pdf.addPage(); finalY = 20; }
    pdf.setFont('helvetica', 'bold');
    pdf.text(adminCatatanRekap.value.trim() !== '' ? 'E. KESIMPULAN REKAP' : 'D. KESIMPULAN REKAP', 15, finalY);
    pdf.setFont('helvetica', 'normal');
    finalY += 6;
    const splitKesimpulan = pdf.splitTextToSize(kesimpulanNaratif.value, pageWidth - 30);
    pdf.text(splitKesimpulan, 15, finalY);
    finalY += (splitKesimpulan.length * 5) + 20;
    
    // F. Tanda Tangan
    if (finalY > 160) { pdf.addPage(); finalY = 20; }
    const ttdDate = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    pdf.text(`Pekanbaru, ${ttdDate}`, pageWidth - 70, finalY);
    finalY += 5;
    pdf.text('Petugas Pengelola Data', pageWidth - 70, finalY);
    finalY += 5;
    pdf.text('BBKSDA Riau', pageWidth - 70, finalY);
    finalY += 25;
    pdf.text('(________________________)', pageWidth - 75, finalY);
    
    pdf.save(`Rekapitulasi_Konflik_Satwa_${selectedMonth.value}.pdf`);
    uiStore.showNotification('success', 'Berhasil', 'PDF berhasil dibuat dan diunduh.');
  } catch(e) {
    console.error(e);
    uiStore.showNotification('error', 'Gagal', 'Terjadi kesalahan saat membuat PDF.');
  } finally {
    isGeneratingPdf.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto p-4 sm:p-6">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl sm:text-3xl font-bold text-brand-green">Rekap Laporan Bulanan</h1>
      </div>
      <div class="flex items-center gap-4 mt-4 md:mt-0 w-full sm:w-auto">
        <input 
          type="month" 
          v-model="selectedMonth"
          class="px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light w-full sm:w-auto"
        />
        <button 
          @click="downloadPdf" 
          :disabled="isGeneratingPdf || filteredReports.length === 0"
          class="bg-brand-green text-white font-bold py-2 px-6 rounded-md hover:bg-brand-green-light transition-colors disabled:opacity-50 w-full sm:w-auto flex justify-center items-center gap-2"
        >
          <span v-if="isGeneratingPdf" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isGeneratingPdf ? 'Memproses...' : 'Unduh PDF' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500">Memuat data rekap...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredReports.length === 0" class="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
      <svg class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-lg text-gray-600 font-medium">Belum ada laporan konflik satwa pada periode ini.</p>
      <p class="text-sm text-gray-500 mt-2">Pilih bulan dan tahun lain pada filter di atas.</p>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      
      <!-- A. KARTU STATISTIK (2 Rows) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Row 1: Primary Stats -->
        <div class="bg-brand-green/10 border border-brand-green/30 p-4 rounded-lg">
          <p class="text-xs text-brand-green font-bold uppercase tracking-wider mb-1">Total Masuk</p>
          <p class="text-2xl font-bold text-brand-green">{{ reportStats.total }}</p>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
          <p class="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">Laporan Valid</p>
          <p class="text-2xl font-bold text-emerald-800">{{ reportStats.valid }}</p>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p class="text-xs text-yellow-700 font-bold uppercase tracking-wider mb-1">Mngg. Verifikasi</p>
          <p class="text-2xl font-bold text-yellow-800">{{ reportStats.pending }}</p>
        </div>
        <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p class="text-xs text-red-700 font-bold uppercase tracking-wider mb-1">Ditolak/Tidak Valid</p>
          <p class="text-2xl font-bold text-red-800">{{ reportStats.ditolak }}</p>
        </div>

        <!-- Row 2: Secondary Stats -->
        <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p class="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">Diterima</p>
          <p class="text-2xl font-bold text-blue-800">{{ reportStats.verified }}</p>
        </div>
        <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
          <p class="text-xs text-indigo-700 font-bold uppercase tracking-wider mb-1">Dalam Proses</p>
          <p class="text-2xl font-bold text-indigo-800">{{ reportStats.diproses }}</p>
        </div>
        <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p class="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Selesai</p>
          <p class="text-2xl font-bold text-green-800">{{ reportStats.selesai }}</p>
        </div>
        <div class="bg-rose-50 border border-rose-200 p-4 rounded-lg relative">
          <p class="text-xs text-rose-700 font-bold uppercase tracking-wider mb-1">Prioritas Tinggi/Darurat</p>
          <p class="text-2xl font-bold text-rose-800">{{ reportStats.tinggiDarurat }}</p>
          <div v-if="reportStats.tinggiDarurat > 0" class="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      </div>

      <!-- Peringatan Prioritas Darurat -->
      <div v-if="reportStats.tinggiDarurat > 0" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700 font-medium">Terdapat laporan prioritas tinggi/darurat yang perlu menjadi perhatian instansi bulan ini.</p>
          </div>
        </div>
      </div>

      <!-- D & I. NARRATIVES -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Ringkasan Bulan Ini</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">{{ ringkasanNaratif }}</p>
        
        <h3 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Kesimpulan</h3>
        <p class="text-gray-700 leading-relaxed">{{ kesimpulanNaratif }}</p>
      </div>

      <!-- B & C. KERUGIAN & LOKASI -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Estimasi Kerugian -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Rekap Estimasi Kerugian</h3>
          <div v-if="!kerugianStats.hasData" class="text-gray-500 italic text-sm">
            Belum ada data estimasi kerugian pada periode ini.
          </div>
          <div v-else class="space-y-4">
            <div class="flex justify-between items-center border-b pb-2">
              <span class="text-gray-600">Total Kerugian:</span>
              <span class="font-bold text-red-600">{{ kerugianStats.total }}</span>
            </div>
            <div class="flex justify-between items-center border-b pb-2">
              <span class="text-gray-600">Rata-rata per Laporan:</span>
              <span class="font-semibold text-gray-800">{{ kerugianStats.avg }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Kerugian Tertinggi:</span>
              <span class="font-semibold text-gray-800">{{ kerugianStats.max }} <span class="text-xs text-gray-400 font-normal">(ID: {{kerugianStats.maxReportId}})</span></span>
            </div>
          </div>
        </div>

        <!-- Lokasi Terbanyak -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Top 5 Lokasi Laporan Valid</h3>
          <table class="w-full text-sm text-left text-gray-600">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th class="px-2 py-2 w-10 text-center">#</th>
                <th class="px-2 py-2">Lokasi</th>
                <th class="px-2 py-2 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loc in topLokasi" :key="loc.peringkat" class="border-b last:border-0">
                <td class="px-2 py-2 text-center font-medium">{{ loc.peringkat }}</td>
                <td class="px-2 py-2">{{ loc.lokasi }}</td>
                <td class="px-2 py-2 text-right font-bold text-gray-800">{{ loc.jumlah }} lap.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- GRAFIK -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
          <h3 class="text-sm font-bold text-gray-800 mb-4 w-full text-center">Distribusi Status</h3>
          <div class="w-full max-w-[200px]">
            <DoughnutChart :chart-data="statusChartData" />
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
          <h3 class="text-sm font-bold text-gray-800 mb-4 w-full text-center">Jenis Satwa Valid</h3>
          <div class="w-full max-w-[200px]">
            <DoughnutChart :chart-data="satwaChartData" />
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
          <h3 class="text-sm font-bold text-gray-800 mb-4 w-full text-center">Prioritas Laporan Valid</h3>
          <div class="w-full max-w-[200px]">
            <DoughnutChart :chart-data="prioritasChartData" />
          </div>
        </div>
      </div>

      <!-- G. TABEL DAFTAR LAPORAN (Horizontal Scroll) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold text-gray-800">Daftar Laporan Valid Bulan Ini</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-600 min-w-[800px]">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Tgl Kejadian</th>
                <th class="px-4 py-3">Satwa</th>
                <th class="px-4 py-3">Lokasi</th>
                <th class="px-4 py-3">Prioritas</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Petugas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="validReports.length === 0">
                <td colspan="7" class="px-4 py-6 text-center text-gray-500">
                  Belum ada laporan valid pada periode ini.
                </td>
              </tr>
              <tr v-for="report in validReports" :key="report.id" class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ report.idLaporan || report.id }}</td>
                <td class="px-4 py-3">{{ formatDate(report.tanggalKejadian) }}</td>
                <td class="px-4 py-3">{{ report.jenisSatwa }}</td>
                <td class="px-4 py-3">{{ report.lokasi }}</td>
                <td class="px-4 py-3">
                  <span :class="{'text-red-600 font-bold': report.prioritas === 'Darurat' || report.prioritas === 'Tinggi'}">{{ report.prioritas }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold">{{ report.status }}</span>
                </td>
                <td class="px-4 py-3">{{ report.petugasPenanganan }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- H. CATATAN ADMIN -->
      <div class="bg-brand-green/5 border border-brand-green/20 p-6 rounded-lg mt-8">
        <h3 class="text-lg font-bold text-brand-green mb-2">Catatan Rekap Bulanan (Opsional)</h3>
        <p class="text-sm text-gray-600 mb-4">Catatan ini akan dilampirkan pada halaman terakhir dokumen PDF yang diunduh.</p>
        <textarea 
          v-model="adminCatatanRekap"
          rows="3"
          class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green outline-none transition-all resize-none text-sm"
          placeholder="Tambahkan catatan evaluasi atau keterangan tambahan untuk rekap bulan ini..."
        ></textarea>
        <div class="mt-4 flex justify-end">
          <button 
            @click="downloadPdf" 
            :disabled="isGeneratingPdf"
            class="bg-brand-green text-white font-bold py-2 px-6 rounded-md hover:bg-brand-green-light transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            {{ isGeneratingPdf ? 'Memproses...' : 'Unduh PDF Formal' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
