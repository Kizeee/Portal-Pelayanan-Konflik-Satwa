import { db } from '../firebase'
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
  doc,
  query,
  limit,
  where,
} from 'firebase/firestore'

/**
 * Composable for reports/laporan CRUD operations
 * @returns Report management functions
 */
export function useReports() {
  const COLLECTION_NAME = 'laporan'

  const getTicketPeriod = (date = new Date()) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}${month}`
  }

  const createTicketSuffix = () => {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => (byte % 36).toString(36).toUpperCase()).join('')
  }

  const formatTicketId = (period) => {
    return `BKSDA-${period}-${createTicketSuffix()}`
  }

  const normalizeTicketId = (ticketId) => {
    return String(ticketId || '').trim().toUpperCase()
  }

  /**
   * Fetch all reports from Firestore
   * @returns {Promise<Array>} Array of reports
   */
  const fetchAllReports = async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME))
      const querySnapshot = await getDocs(q)
      const reports = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Sort by createdAt descending
      return reports.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || 0
        const dateB = b.createdAt?.toDate?.() || 0
        return dateB - dateA
      })
    } catch (error) {
      console.error('Error fetching reports:', error)
      throw error
    }
  }

  /**
   * Get single report by ID
   * @param {string} id - Report ID
   * @returns {Promise<Object|null>} Report data or null
   */
  const getReportById = async (id) => {
    try {
      const reportRef = doc(db, COLLECTION_NAME, id)
      const reportSnap = await getDoc(reportRef)

      if (reportSnap.exists()) {
        return { id: reportSnap.id, ...reportSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching report:', error)
      throw error
    }
  }

  /**
   * Get single report by public ticket ID.
   * Uses direct document lookup first, then falls back to the idLaporan field
   * for legacy documents whose document ID may differ from the ticket.
   */
  const getReportByTicketId = async (ticketId) => {
    const normalizedTicketId = normalizeTicketId(ticketId)
    if (!normalizedTicketId) return null

    const directReport = await getReportById(normalizedTicketId)
    if (directReport) return directReport

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('idLaporan', '==', normalizedTicketId),
        limit(1),
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return null
      const reportDoc = querySnapshot.docs[0]
      return { id: reportDoc.id, ...reportDoc.data() }
    } catch (error) {
      console.error('Error fetching report by ticket ID:', error)
      throw error
    }
  }

  /**
   * Generate new report ID
   * @returns {Promise<string>} New report ID (e.g., BKSDA-202606-A7K2)
   */
  const generateNewReportId = async () => {
    const period = getTicketPeriod()
    return formatTicketId(period)
  }

  /**
   * Create new report
   * @param {Object} reportData - Report data
   * @returns {Promise<string>} Created report ID
   */
  const createReport = async (reportData) => {
    try {
      const now = new Date()
      const ticketId = await generateNewReportId()
      const reportRef = doc(db, COLLECTION_NAME, ticketId)

      await setDoc(reportRef, {
        ...reportData,
        idLaporan: ticketId,
        status: 'Menunggu Verifikasi',
        createdAt: now,
        statusHistory: [
          {
            status: 'Menunggu Verifikasi',
            timestamp: now,
            updatedBy: 'Sistem',
            notes: 'Laporan diterima oleh sistem dan menunggu verifikasi admin.',
          },
        ],
      })

      return ticketId
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    }
  }

  /**
   * Update existing report
   * @param {string} id - Report ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  const updateReport = async (id, updateData) => {
    try {
      const reportRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(reportRef, updateData)
    } catch (error) {
      console.error('Error updating report:', error)
      throw error
    }
  }

  return {
    fetchAllReports,
    getReportById,
    getReportByTicketId,
    generateNewReportId,
    createReport,
    updateReport,
  }
}
