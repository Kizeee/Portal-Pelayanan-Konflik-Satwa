/**
 * Composable for file storage operations (Cloudinary)
 * @returns Storage functions
 */
export function useStorage() {
  /**
   * Upload files (images and videos) to Cloudinary
   * @param {Array<File>} files - Array of files to upload
   * @returns {Promise<Object>} Object with imageUrls and videoUrl
   */
  const uploadFiles = async (files) => {
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload')
    }

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'drjznlsij'
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'laporan_satwa_unsigned'

    try {
      // Process upload for each file
      const uploadPromises = files.map((file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', UPLOAD_PRESET)

        // Determine resource type (image/video) for Cloudinary
        const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
        const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

        return fetch(apiUrl, {
          method: 'POST',
          body: formData,
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name} to Cloudinary`)
          }
          return response.json()
        })
      })

      const uploadResults = await Promise.all(uploadPromises)

      // Separate image URLs and video URL
      const imageUrls = uploadResults
        .filter((result) => result.resource_type === 'image')
        .map((result) => result.secure_url)

      const videoUrl = uploadResults.find((result) => result.resource_type === 'video')?.secure_url || null

      return {
        imageUrls,
        videoUrl,
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      throw error
    }
  }

  const validateFiles = (files) => {
    if (!files || files.length === 0) {
      return { isValid: false, error: 'No files selected' }
    }

    // Validate: Max 1 video
    const videoFiles = files.filter((file) => file.type.startsWith('video/'))
    if (videoFiles.length > 1) {
      return { isValid: false, error: 'You can only upload a maximum of 1 video' }
    }

    // Validate: Max 5 images
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length > 5) {
      return { isValid: false, error: 'You can only upload a maximum of 5 images' }
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime', 'video/x-matroska']
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      return { isValid: false, error: 'Some files have invalid format' }
    }

    return { isValid: true, error: null }
  }

  return {
    uploadFiles,
    validateFiles,
  }
}
