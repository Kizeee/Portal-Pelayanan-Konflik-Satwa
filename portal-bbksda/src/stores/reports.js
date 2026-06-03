import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { useReports } from '../composables/useReports'

/**
 * Reports Store
 * Manages all reports/laporan data and operations
 */
export const useReportsStore = defineStore('reports', () => {
  // Composables
  const { fetchAllReports, createReport, updateReport, getReportByTicketId } = useReports()

  // State
  const reports = ref([])
  const myReportIds = ref([])
  const selectedReportId = ref(null)
  const isLoading = ref(false)
  const isRealtimeListening = ref(false)
  let unsubscribeReports = null

  // Filters State
  const filters = ref({
    search: '',
    dateFrom: null,
    dateTo: null,
    status: [],
    animalType: [],
    prioritas: [],
    sortBy: 'newest',
  })

  // Pagination State
  const pagination = ref({
    currentPage: 1,
    itemsPerPage: 12,
  })

  const statusFilterAliases = {
    'Menunggu Verifikasi': ['Menunggu Verifikasi', 'pending'],
    Diterima: ['Diterima', 'verified'],
    'Dalam Proses': ['Dalam Proses', 'Tim Menuju Lokasi', 'Penanganan di Lokasi', 'Diproses'],
    Selesai: ['Selesai'],
    Ditolak: ['Ditolak', 'Tidak Valid', 'ditolak'],
  }

  // Getters
  /**
   * Get reports that have coordinates
   */
  const reportsWithCoords = computed(() => {
    return reports.value.filter((laporan) => laporan.lat && laporan.lng)
  })

  /**
   * Get currently selected report
   */
  const selectedReport = computed(() => {
    if (!selectedReportId.value) return null
    return reports.value.find((r) => r.id === selectedReportId.value) || null
  })

  /**
   * Get current user's reports
   */
  const myReports = computed(() => {
    return reports.value.filter((report) => myReportIds.value.includes(report.id))
  })

  /**
   * Get unique animal types from all reports
   */
  const animalTypes = computed(() => {
    const types = new Set()
    reports.value.forEach(r => {
      if (r.jenisSatwa) types.add(r.jenisSatwa)
    })
    return Array.from(types).sort()
  })

  /**
   * Get filtered and sorted reports
   */
  const filteredReports = computed(() => {
    let result = [...reports.value]

    // Apply search filter
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      result = result.filter(r =>
        r.idLaporan?.toLowerCase().includes(searchLower) ||
        r.nama?.toLowerCase().includes(searchLower) ||
        r.lokasi?.toLowerCase().includes(searchLower) ||
        r.jenisSatwa?.toLowerCase().includes(searchLower) ||
        r.kategoriKonflik?.toLowerCase().includes(searchLower)
      )
    }

    // Apply date range filter
    if (filters.value.dateFrom || filters.value.dateTo) {
      result = result.filter(r => {
        if (!r.createdAt) return  false
        const reportDate = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt)

        if (filters.value.dateFrom && filters.value.dateTo) {
          return reportDate >= filters.value.dateFrom && reportDate <= filters.value.dateTo
        } else if (filters.value.dateFrom) {
          return reportDate >= filters.value.dateFrom
        } else if (filters.value.dateTo) {
          return reportDate <= filters.value.dateTo
        }
        return true
      })
    }

    // Apply status filter
    if (filters.value.status.length > 0) {
      result = result.filter(r => filters.value.status.some((status) => {
        const aliases = statusFilterAliases[status] || [status]
        return aliases.includes(r.status)
      }))
    }

    // Apply animal type filter
    if (filters.value.animalType.length > 0) {
      result = result.filter(r => filters.value.animalType.includes(r.jenisSatwa))
    }

    // Apply prioritas filter
    if (filters.value.prioritas && filters.value.prioritas.length > 0) {
      result = result.filter(r => {
        const p = r.prioritas || 'Sedang' // Default is Sedang for old data
        return filters.value.prioritas.includes(p)
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)

      switch (filters.value.sortBy) {
        case 'newest':
          return bDate - aDate
        case 'oldest':
          return aDate - bDate
        case 'id-asc':
          return (a.idLaporan || '').localeCompare(b.idLaporan || '')
        case 'id-desc':
          return (b.idLaporan || '').localeCompare(a.idLaporan || '')
        case 'status':
          return (a.status || '').localeCompare(b.status || '')
        default:
          return bDate - aDate
      }
    })

    return result
  })

  /**
   * Get paginated reports
   */
  const paginatedReports = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
    const end = start + pagination.value.itemsPerPage
    return filteredReports.value.slice(start, end)
  })

  /**
   * Get total pages
   */
  const totalPages = computed(() => {
    return Math.ceil(filteredReports.value.length / pagination.value.itemsPerPage)
  })

  /**
   * Check if filters are active
   */
  const hasActiveFilters = computed(() => {
    return (
      filters.value.search ||
      filters.value.dateFrom ||
      filters.value.dateTo ||
      filters.value.status.length > 0 ||
      filters.value.animalType.length > 0 ||
      (filters.value.prioritas && filters.value.prioritas.length > 0)
    )
  })

  /**
   * Get active filter count
   */
  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.value.search) count++
    if (filters.value.dateFrom || filters.value.dateTo) count++
    if (filters.value.status.length > 0) count++
    if (filters.value.animalType.length > 0) count++
    if (filters.value.prioritas && filters.value.prioritas.length > 0) count++
    return count
  })

  // Actions
  const sortReportsByCreatedAt = (items) => {
    return [...items].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return dateB - dateA
    })
  }

  const upsertReport = (reportData) => {
    if (!reportData?.id) return

    const index = reports.value.findIndex((report) => report.id === reportData.id)
    if (index === -1) {
      reports.value = sortReportsByCreatedAt([...reports.value, reportData])
      return
    }

    reports.value.splice(index, 1, {
      ...reports.value[index],
      ...reportData,
    })
    reports.value = sortReportsByCreatedAt(reports.value)
  }

  /**
   * Load all reports from Firestore
   */
  const loadReports = async () => {
    isLoading.value = true
    try {
      reports.value = await fetchAllReports()
    } catch (error) {
      console.error('Error loading reports:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Keep reports synced with Firestore so status changes appear without refresh.
   */
  const startRealtimeSync = () => {
    if (unsubscribeReports) return

    if (!reports.value.length) {
      isLoading.value = true
    }

    const reportsQuery = query(collection(db, 'laporan'))
    unsubscribeReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        reports.value = sortReportsByCreatedAt(
          snapshot.docs.map((reportDoc) => ({
            id: reportDoc.id,
            ...reportDoc.data(),
          })),
        )
        isLoading.value = false
        isRealtimeListening.value = true
      },
      (error) => {
        console.error('Error syncing reports in real-time:', error)
        isLoading.value = false
        isRealtimeListening.value = false
        unsubscribeReports = null
      },
    )
  }

  const stopRealtimeSync = () => {
    if (unsubscribeReports) {
      unsubscribeReports()
      unsubscribeReports = null
    }
    isRealtimeListening.value = false
  }

  /**
   * Add new report
   */
  const addReport = async (reportData) => {
    try {
      const reportId = await createReport(reportData)
      if (!myReportIds.value.includes(reportId)) {
        myReportIds.value.push(reportId)
      }
      await loadReports()
      return reportId
    } catch (error) {
      console.error('Error adding report:', error)
      throw error
    }
  }

  const findReportByTicketId = async (ticketId) => {
    isLoading.value = true
    try {
      const report = await getReportByTicketId(ticketId)
      if (report) {
        upsertReport(report)
      }
      return report
    } catch (error) {
      console.error('Error finding report by ticket ID:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update existing report
   */
  const modifyReport = async (id, data) => {
    try {
      await updateReport(id, data)
      await loadReports()
    } catch (error) {
      console.error('Error updating report:', error)
      throw error
    }
  }

  /**
   * Set selected report ID
   */
  const setSelectedReport = (id) => {
    selectedReportId.value = id
  }

  /**
   * Reset session-scoped tracked report IDs.
   */
  const loadMyReportIds = () => {
    myReportIds.value = []
  }

  /**
   * Update filters
   */
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.currentPage = 1
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filters.value = {
      search: '',
      dateFrom: null,
      dateTo: null,
      status: [],
      animalType: [],
      prioritas: [],
      sortBy: 'newest',
    }
    pagination.value.currentPage = 1
  }

  /**
   * Set page
   */
  const setPage = (page) => {
    pagination.value.currentPage = page
  }

  /**
   * Set items per page
   */
  const setItemsPerPage = (items) => {
    pagination.value.itemsPerPage = items
    pagination.value.currentPage = 1
  }

  /**
   * Initialize store - load data
   */
  const initialize = async () => {
    loadMyReportIds()
    await loadReports()
  }

  return {
    // State
    reports,
    myReportIds,
    selectedReportId,
    isLoading,
    isRealtimeListening,
    filters,
    pagination,

    // Getters
    reportsWithCoords,
    selectedReport,
    myReports,
    animalTypes,
    filteredReports,
    paginatedReports,
    totalPages,
    hasActiveFilters,
    activeFilterCount,

    // Actions
    loadReports,
    startRealtimeSync,
    stopRealtimeSync,
    upsertReport,
    addReport,
    findReportByTicketId,
    modifyReport,
    setSelectedReport,
    loadMyReportIds,
    updateFilters,
    clearFilters,
    setPage,
    setItemsPerPage,
    initialize,
  }
})
