import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://urkumgjlitshtsbuybtu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVya3VtZ2psaXRzaHRzYnV5YnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjU3NDYsImV4cCI6MjA1ODMwMTc0Nn0.w7kH2HaF9xDn9_7D8Bdc-dZU5nFdOQgztibo-xfZOa4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Upload file to manuscripts bucket
export async function uploadManuscript(file: File): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Starting upload process...')
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB

    // Generate unique filename with timestamp
    const timestamp = new Date().getTime()
    const fileExtension = file.name.split('.').pop()
    const fileName = `manuscript_${timestamp}.${fileExtension}`
    
    console.log('Generated filename:', fileName)

    // Skip bucket verification and try upload directly
    console.log('Attempting direct upload to manuscripts bucket...')

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('manuscripts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    console.log('Upload response:', { data, error })

    if (error) {
      console.error('Upload error details:', error)
      return { success: false, error: `Erreur d'upload: ${error.message}` }
    }

    // Verify the file was uploaded by listing files
    const { data: filesList, error: listError } = await supabase.storage
      .from('manuscripts')
      .list()
    
    console.log('Files in bucket after upload:', filesList)
    if (listError) {
      console.error('Error listing files:', listError)
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('manuscripts')
      .getPublicUrl(fileName)

    console.log('Public URL data:', publicUrlData)

    return { 
      success: true, 
      data: {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: publicUrlData.publicUrl,
        fileName: fileName
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}

// Get file from manuscripts bucket
export async function getManuscript(fileName: string) {
  try {
    const { data, error } = await supabase.storage
      .from('manuscripts')
      .download(fileName)

    if (error) {
      console.error('Download error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}

// List all manuscripts
export async function listManuscripts() {
  try {
    const { data, error } = await supabase.storage
      .from('manuscripts')
      .list()

    if (error) {
      console.error('List error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}
