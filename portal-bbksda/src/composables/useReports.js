import { db } from '../firebase'
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore'

/**
 * Composable for reports/laporan CRUD operations
 * @returns Report management functions
 */
export function useReports() {
  const COLLECTION_NAME = 'laporan'

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
   * Get last report ID for sequential numbering
   * @returns {Promise<string|null>} Last report ID
   */
  const getLastReportId = async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('idLaporan', 'desc'), limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[0]
        return lastDoc.data().idLaporan
      }
      return null
    } catch (error) {
      console.error('Error fetching last report ID:', error)
      throw error
    }
  }

  /**
   * Generate new report ID
   * @returns {Promise<string>} New report ID (e.g., LP001, LP002)
   */
  const generateNewReportId = async () => {
    const lastId = await getLastReportId()
    if (lastId) {
      const lastNumber = parseInt(lastId.replace('LP', ''), 10)
      const newNumber = lastNumber + 1
      return `LP${newNumber.toString().padStart(3, '0')}`
    }
    return 'LP001'
  }

  /**
   * Create new report
   * @param {Object} reportData - Report data
   * @returns {Promise<string>} Created report ID
   */
  const createReport = async (reportData) => {
    try {
      // Generate report ID
      const newId = await generateNewReportId()
      reportData.idLaporan = newId

      // Add default fields
      reportData.status = 'Menunggu Verifikasi' // status awal sampai diverifikasi admin riset
      reportData.createdAt = new Date()

      // Use setDoc with custom ID
      const docRef = doc(db, COLLECTION_NAME, newId)
      await setDoc(docRef, reportData)

      return newId
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
    getLastReportId,
    generateNewReportId,
    createReport,
    updateReport,
  }
}
