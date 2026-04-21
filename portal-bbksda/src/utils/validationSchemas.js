import * as yup from 'yup'

/**
 * Validation schema for report submission form
 */
export const laporanSchema = yup.object({
  nama: yup
    .string()
    .required('Nama pelapor wajib diisi')
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),

  telepon: yup
    .string()
    .required('Nomor telepon wajib diisi')
    .matches(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid (contoh: 081234567890)'),

  tanggal: yup
    .date()
    .required('Tanggal kejadian wajib diisi')
    .max(new Date(), 'Tanggal tidak boleh di masa depan')
    .typeError('Format tanggal tidak valid'),

  jenisSatwa: yup
    .string()
    .required('Jenis satwa wajib dipilih'),

  lokasi: yup
    .string()
    .required('Lokasi wajib diisi')
    .min(5, 'Lokasi minimal 5 karakter')
    .max(200, 'Lokasi maksimal 200 karakter'),

  lat: yup
    .number()
    .required('Koordinat lokasi wajib dipilih dari peta')
    .min(-90, 'Latitude tidak valid')
    .max(90, 'Latitude tidak valid')
    .typeError('Koordinat latitude harus berupa angka'),

  lng: yup
    .number()
    .required('Koordinat lokasi wajib dipilih dari peta')
    .min(-180, 'Longitude tidak valid')
    .max(180, 'Longitude tidak valid')
    .typeError('Koordinat longitude harus berupa angka'),

  deskripsi: yup
    .string()
    .required('Deskripsi kejadian wajib diisi')
    .min(20, 'Deskripsi minimal 20 karakter')
    .max(1000, 'Deskripsi maksimal 1000 karakter'),
})

/**
 * Validation schema for login form
 */
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email wajib diisi')
    .email('Format email tidak valid'),

  password: yup
    .string()
    .required('Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
})
