// Utility helpers for storing laporan ketika offline dan memicu background sync
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

const serializeFiles = async (files = []) => {
  const serialized = []
  for (const file of files) {
    const buffer = await file.arrayBuffer()
    serialized.push({
      name: file.name,
      type: file.type,
      data: buffer,
      lastModified: file.lastModified,
    })
  }
  return serialized
}

export const saveReportOffline = async (reportData, files = []) => {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const id = crypto.randomUUID()

  const payload = {
    id,
    reportData,
    files: await serializeFiles(files),
    createdAt: Date.now(),
  }

  store.put(payload)

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

export const triggerBackgroundSync = async () => {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.ready

  // Prioritaskan Background Sync API bila tersedia
  if ('sync' in registration) {
    try {
      await registration.sync.register('sync-lapor')
    } catch (error) {
      console.warn('SyncManager tidak tersedia, fallback ke pesan langsung', error)
      registration.active?.postMessage({ type: 'PROCESS_OFFLINE_REPORTS' })
    }
  } else {
    registration.active?.postMessage({ type: 'PROCESS_OFFLINE_REPORTS' })
  }
}

export const onOnlineProcessQueue = () => {
  const handler = () => triggerBackgroundSync()
  window.addEventListener('online', handler)
  return () => window.removeEventListener('online', handler)
}
