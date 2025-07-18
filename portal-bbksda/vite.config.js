import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      // PERBAIKAN: Tambahkan devOptions untuk memaksa update saat pengembangan
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'hero-bg.png'],
      manifest: {
        name: 'Portal Laporan Satwa BBKSDA Riau',
        short_name: 'Lapor Satwa',
        description: 'Aplikasi portal untuk melaporkan konflik satwa liar di wilayah BBKSDA Riau.',
        theme_color: '#386641',
        background_color: '#F7F9F9',
        icons: [
          {
            src: '/logo-bbksda-512.png', // Gunakan path absolut dari folder public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-bbksda-512.png', // Gunakan path absolut dari folder public
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo-bbksda-512.png', // Gunakan path absolut dari folder public
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})