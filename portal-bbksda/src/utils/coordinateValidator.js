/**
 * Utilitas validasi koordinat wilayah layanan BBKSDA Riau.
 *
 * Menggunakan algoritma Ray-Casting (point-in-polygon) untuk menentukan
 * apakah sebuah titik koordinat berada di dalam batas wilayah Provinsi Riau.
 *
 * @module coordinateValidator
 */

import riauBoundary from '@/data/riau-boundary.json'

// ── Bounding Box cepat untuk Provinsi Riau ──
// Digunakan sebagai filter awal sebelum menjalankan algoritma PIP yang lebih berat.
const RIAU_BBOX = {
  minLat: -0.25,
  maxLat: 2.25,
  minLng: 99.90,
  maxLng: 103.70,
}

// Bounding box longgar untuk Indonesia (sebagai fallback validasi minimal)
const INDONESIA_BBOX = {
  minLat: -11.0,
  maxLat: 6.5,
  minLng: 94.5,
  maxLng: 141.5,
}

/**
 * Mengambil koordinat polygon Riau dari GeoJSON.
 * @returns {Array<[number, number]>} Array koordinat [lng, lat]
 */
const getRiauPolygon = () => {
  return riauBoundary.features[0].geometry.coordinates[0]
}

/**
 * Algoritma Ray-Casting untuk menentukan apakah sebuah titik
 * berada di dalam polygon.
 *
 * Referensi: https://en.wikipedia.org/wiki/Point_in_polygon
 *
 * @param {number} lat - Latitude titik yang akan dicek
 * @param {number} lng - Longitude titik yang akan dicek
 * @param {Array<[number, number]>} polygon - Array koordinat polygon [lng, lat]
 * @returns {boolean} true jika titik berada di dalam polygon
 */
const isPointInPolygon = (lat, lng, polygon) => {
  let inside = false
  const n = polygon.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    // Koordinat GeoJSON disimpan sebagai [lng, lat]
    const xi = polygon[i][1] // lat
    const yi = polygon[i][0] // lng
    const xj = polygon[j][1] // lat
    const yj = polygon[j][0] // lng

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Cek apakah koordinat berada dalam bounding box.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {object} bbox - Bounding box { minLat, maxLat, minLng, maxLng }
 * @returns {boolean}
 */
const isInBoundingBox = (lat, lng, bbox) => {
  return (
    lat >= bbox.minLat &&
    lat <= bbox.maxLat &&
    lng >= bbox.minLng &&
    lng <= bbox.maxLng
  )
}

/**
 * Validasi apakah koordinat berada dalam wilayah layanan BBKSDA Riau.
 *
 * Urutan pengecekan:
 * 1. Cek apakah koordinat valid (bukan NaN/null)
 * 2. Cek apakah berada di Indonesia (bounding box)
 * 3. Cek apakah berada di bounding box Riau (filter cepat)
 * 4. Cek apakah berada di dalam polygon Riau (presisi)
 *
 * @param {number|string} lat - Latitude titik
 * @param {number|string} lng - Longitude titik
 * @returns {{ valid: boolean, code: string, message: string }}
 */
export const validateCoordinate = (lat, lng) => {
  const numLat = parseFloat(lat)
  const numLng = parseFloat(lng)

  // 1. Cek apakah koordinat valid
  if (isNaN(numLat) || isNaN(numLng)) {
    return {
      valid: false,
      code: 'INVALID_COORD',
      message: 'Koordinat tidak valid. Silakan pilih lokasi di peta.',
    }
  }

  // 2. Cek apakah berada di Indonesia
  if (!isInBoundingBox(numLat, numLng, INDONESIA_BBOX)) {
    return {
      valid: false,
      code: 'OUTSIDE_INDONESIA',
      message: 'Lokasi yang dipilih berada di luar wilayah Indonesia.',
    }
  }

  // 3. Filter cepat: cek bounding box Riau
  if (!isInBoundingBox(numLat, numLng, RIAU_BBOX)) {
    return {
      valid: false,
      code: 'OUTSIDE_RIAU',
      message:
        'Lokasi yang dipilih berada di luar wilayah layanan BBKSDA Riau. Silakan periksa kembali titik lokasi.',
    }
  }

  // 4. Cek presisi dengan polygon Riau
  const polygon = getRiauPolygon()
  if (!isPointInPolygon(numLat, numLng, polygon)) {
    return {
      valid: false,
      code: 'OUTSIDE_RIAU',
      message:
        'Lokasi yang dipilih berada di luar wilayah layanan BBKSDA Riau. Silakan periksa kembali titik lokasi.',
    }
  }

  return {
    valid: true,
    code: 'VALID',
    message: 'Lokasi berada dalam wilayah layanan BBKSDA Riau.',
  }
}
