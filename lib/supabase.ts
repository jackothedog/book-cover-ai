import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://urkumgjlitshtsbuybtu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVya3VtZ2psaXRzaHRzYnV5YnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjU3NDYsImV4cCI6MjA1ODMwMTc0Nn0.w7kH2HaF9xDn9_7D8Bdc-dZU5nFdOQgztibo-xfZOa4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Upload manuscript to Supabase Storage and save to database
export async function uploadManuscript(file: File) {
  try {
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `manuscript_${timestamp}.pdf`
    
    console.log('Generated filename:', fileName)
    console.log('Attempting direct upload to manuscripts bucket...')

    // Upload file to manuscripts bucket
    const { data, error } = await supabase.storage
      .from('manuscripts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    console.log('Upload response:', { data, error })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('manuscripts')
      .getPublicUrl(fileName)

    console.log('Public URL data:', publicUrlData)

    // Save to manuscripts table (this will trigger the webhook)
    const { data: manuscript, error: dbError } = await supabase
      .from('manuscripts')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: data.path,
        public_url: publicUrlData.publicUrl,
        status: 'uploaded'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from('manuscripts').remove([fileName])
      return { success: false, error: 'Erreur lors de la sauvegarde: ' + dbError.message }
    }

    const result = {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl: publicUrlData.publicUrl,
      fileName: fileName,
      manuscriptId: manuscript.id
    }

    console.log('File uploaded and saved successfully:', result)
    return { success: true, data: result }

  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite' }
  }
}

