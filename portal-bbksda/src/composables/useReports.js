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
import { createTicketId, isValidTicketId, normalizeTicketId } from '../utils/ticketId'

/**
 * Composable for reports/laporan CRUD operations
 * @returns Report management functions
 */
export function useReports() {
  const COLLECTION_NAME = 'laporan'

  const getTicketLookupCandidates = (ticketId) => {
    const trimmedTicketId = String(ticketId || '').trim()
    const normalizedTicketId = normalizeTicketId(trimmedTicketId)
    const candidates = [trimmedTicketId, normalizedTicketId]

    if (normalizedTicketId === 'LPNAN') {
      candidates.push('LPNaN')
    }

    return [...new Set(candidates.filter(Boolean))]
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
    const ticketCandidates = getTicketLookupCandidates(ticketId)
    if (!ticketCandidates.length) return null

    for (const candidate of ticketCandidates) {
      const directReport = await getReportById(candidate)
      if (directReport) return directReport
    }

    try {
      for (const candidate of ticketCandidates) {
        const q = query(collection(db, COLLECTION_NAME), where('idLaporan', '==', candidate), limit(1))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const reportDoc = querySnapshot.docs[0]
          return { id: reportDoc.id, ...reportDoc.data() }
        }
      }

      return null
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
    const ticketId = createTicketId()
    if (!isValidTicketId(ticketId)) {
      throw new Error(`Generated invalid ticket ID: ${ticketId}`)
    }
    return ticketId
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
