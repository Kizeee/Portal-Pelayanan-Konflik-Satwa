/* eslint-disable no-undef */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Aktifkan SW segera
self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Konstanta lingkungan & konfigurasi eksternal
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)`
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'drjznlsij'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'laporan_satwa_unsigned'

// IndexedDB untuk antrean laporan offline
const DB_NAME = 'laporan-offline-db'
const STORE_NAME = 'pendingReports'

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const getAllPending = async () => {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const request = store.getAll()

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

const removePending = async (id) => {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}

// ====== Helper Upload & Firestore ======
const uploadQueuedFiles = async (files = []) => {
  if (!files.length) {
    return { imageUrls: [], videoUrl: null }
  }

  const uploadPromises = files.map((file) => {
    const blob = new Blob([file.data], { type: file.type })
    const formData = new FormData()
    formData.append('file', blob, file.name || 'laporan-media')
    formData.append('upload_preset', UPLOAD_PRESET)
    const resourceType = file.type?.startsWith('video/') ? 'video' : 'image'
    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

    return fetch(apiUrl, { method: 'POST', body: formData }).then((res) => {
      if (!res.ok) throw new Error('Cloudinary upload failed')
      return res.json()
    })
  })

  const results = await Promise.all(uploadPromises)
  const imageUrls = results.filter((r) => r.resource_type === 'image').map((r) => r.secure_url)
  const videoUrl = results.find((r) => r.resource_type === 'video')?.secure_url || null

  return { imageUrls, videoUrl }
}

const fetchLastReportId = async () => {
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'laporan' }],
      orderBy: [{ field: { fieldPath: 'idLaporan' }, direction: 'DESCENDING' }],
      limit: 1,
    },
  }

  const res = await fetch(`${FIRESTORE_BASE}/documents:runQuery?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) return null
  const json = await res.json()
  const doc = json.find((item) => item.document)?.document
  return doc?.fields?.idLaporan?.stringValue || null
}

const generateNewReportId = async () => {
  const lastId = await fetchLastReportId()
  if (lastId) {
    const lastNumber = parseInt(lastId.replace('LP', ''), 10)
    const next = lastNumber + 1
    return `LP${String(next).padStart(3, '0')}`
  }
  return 'LP001'
}

const toFirestoreFields = (data) => {
  const fields = {
    nama: { stringValue: data.nama || '' },
    telepon: { stringValue: data.telepon || '' },
    tanggal: { stringValue: data.tanggal || '' },
    jenisSatwa: { stringValue: data.jenisSatwa || '' },
    kategoriKonflik: { stringValue: data.kategoriKonflik || '' },
    lokasi: { stringValue: data.lokasi || '' },
    lat: data.lat ? { doubleValue: Number(data.lat) } : { nullValue: null },
    lng: data.lng ? { doubleValue: Number(data.lng) } : { nullValue: null },
    deskripsi: { stringValue: data.deskripsi || '' },
    idLaporan: { stringValue: data.idLaporan },
    status: { stringValue: data.status || 'Menunggu Verifikasi' },
    createdAt: { timestampValue: data.createdAt || new Date().toISOString() },
    status_satwa_akhir: data.status_satwa_akhir
      ? { stringValue: data.status_satwa_akhir }
      : { nullValue: null },
    estimasi_kerugian:
      data.estimasi_kerugian || data.estimasi_kerugian === 0
        ? { doubleValue: Number(data.estimasi_kerugian) }
        : { nullValue: null },
  }

  fields.imageUrls = {
    arrayValue: {
      values: (data.imageUrls || []).map((url) => ({ stringValue: url })),
    },
  }

  if (data.videoUrl) {
    fields.videoUrl = { stringValue: data.videoUrl }
  }

  return fields
}

const createFirestoreDocument = async (data) => {
  const newId = await generateNewReportId()
  const payload = { ...data, idLaporan: newId }

  const res = await fetch(
    `${FIRESTORE_BASE}/documents/laporan?documentId=${newId}&key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: toFirestoreFields(payload) }),
    },
  )

  if (!res.ok) {
    const message = await res.text()
    throw new Error(`Failed to write Firestore: ${message}`)
  }

  return newId
}

// ====== Background Sync Handler ======
const notifyClients = async (payload) => {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  clientList.forEach((client) => client.postMessage(payload))
}

const processPendingReports = async () => {
  const pending = await getAllPending()

  for (const entry of pending) {
    try {
      const media = await uploadQueuedFiles(entry.files)
      const createdId = await createFirestoreDocument({
        ...entry.reportData,
        ...media,
        status: 'Menunggu Verifikasi',
      })
      await removePending(entry.id)
      await notifyClients({ type: 'OFFLINE_REPORT_SYNCED', reportId: createdId })
    } catch (error) {
      console.error('Gagal sinkronisasi laporan offline:', error)
      // Biarkan entry tetap di antrean untuk dicoba lagi
    }
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-lapor') {
    event.waitUntil(processPendingReports())
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'PROCESS_OFFLINE_REPORTS') {
    event.waitUntil(processPendingReports())
  }
})

// ====== Runtime caching strategis ======
registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'osm-tiles',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)

registerRoute(
  ({ url }) => url.origin.includes('res.cloudinary.com'),
  new StaleWhileRevalidate({
    cacheName: 'cloudinary-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)

registerRoute(
  ({ url }) => url.origin.includes('firestore.googleapis.com'),
  new NetworkFirst({
    cacheName: 'firestore-api',
    networkTimeoutSeconds: 5,
  }),
)
