<script setup>
// Reusable component for emergency contacts
</script>

<template>
  <div class="bg-red-50 border border-red-200 rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
    <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2" />
      </svg>
    </div>
    
    <div class="flex items-start gap-4 relative z-10">
      <div class="bg-red-100 text-red-600 p-3 rounded-full flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg sm:text-xl font-bold text-red-800 mb-2">Kontak Darurat BBKSDA Riau</h3>
        <p class="text-red-700 text-sm sm:text-base font-semibold mb-4">
          Jika situasi mengancam keselamatan warga atau ada korban, segera hubungi petugas BBKSDA Riau melalui kontak berikut:
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-800">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            <strong>Telepon:</strong> 0761-63135
          </div>
          <div class="flex items-center gap-2">
            <!-- Icon WhatsApp -->
            <svg class="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <strong>WhatsApp:</strong> 0813-7474-2981
          </div>
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <strong>Email:</strong> humas@bbksda-riau.com
          </div>
          <div class="flex items-start gap-2">
            <svg class="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>
              <strong class="block">Call Center Darurat: 24/7 (Setiap Hari)</strong>
              <span>Jam Layanan Administratif Kantor: Senin–Jumat, 08.00–16.00 WIB</span>
            </span>
          </div>
          <div class="flex items-start gap-2 md:col-span-2 mt-1">
            <svg class="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span><strong>Alamat:</strong> Jl. H.R. Soebrantas Km. 8.5, Sidomulyo Barat-Arengka, Kode Pos 28294, Pekanbaru.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
