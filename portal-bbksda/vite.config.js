import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
      },
      includeAssets: ['favicon.ico', 'logo-bbksda-512.png', 'pwa-192x192.png'],
      manifest: {
        name: 'Portal Laporan Satwa BBKSDA Riau',
        short_name: 'Lapor Satwa',
        description: 'Aplikasi portal untuk melaporkan konflik satwa liar di wilayah BBKSDA Riau.',
        theme_color: '#386641',
        background_color: '#F7F9F9',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-bbksda-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo-bbksda-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
  ],
})
