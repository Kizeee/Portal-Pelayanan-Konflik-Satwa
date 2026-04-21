import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useReports } from '../composables/useReports'

/**
 * Reports Store
 * Manages all reports/laporan data and operations
 */
export const useReportsStore = defineStore('reports', () => {
  // Composables
  const { fetchAllReports, createReport, updateReport, getReportById } = useReports()

  // State
  const reports = ref([])
  const myReportIds = ref([])
  const selectedReportId = ref(null)
  const isLoading = ref(false)

  // Filters State
  const filters = ref({
    search: '',
    dateFrom: null,
    dateTo: null,
    status: [],
    animalType: [],
    sortBy: 'newest',
  })

  // Pagination State
  const pagination = ref({
    currentPage: 1,
    itemsPerPage: 12,
  })

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
      result = result.filter(r => filters.value.status.includes(r.status))
    }

    // Apply animal type filter
    if (filters.value.animalType.length > 0) {
      result = result.filter(r => filters.value.animalType.includes(r.jenisSatwa))
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
      filters.value.animalType.length > 0
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
    return count
  })

  // Actions
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
   * Add new report
   */
  const addReport = async (reportData) => {
    try {
      const reportId = await createReport(reportData)
      myReportIds.value.push(reportId)
      localStorage.setItem('myReportIds', JSON.stringify(myReportIds.value))
      await loadReports()
      return reportId
    } catch (error) {
      console.error('Error adding report:', error)
      throw error
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
   * Load my report IDs from localStorage
   */
  const loadMyReportIds = () => {
    myReportIds.value = JSON.parse(localStorage.getItem('myReportIds') || '[]')
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
    addReport,
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
