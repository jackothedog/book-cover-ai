import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://urkumgjlitshtsbuybtu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVya3VtZ2psaXRzaHRzYnV5YnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjU3NDYsImV4cCI6MjA1ODMwMTc0Nn0.w7kH2HaF9xDn9_7D8Bdc-dZU5nFdOQgztibo-xfZOa4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Extract text from PDF file (client-side only)
export async function extractTextFromPDF(file: File): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    console.log('Starting PDF text extraction...')
    
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Configure worker for client-side
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    console.log(`PDF loaded. Number of pages: ${pdf.numPages}`)
    
    let fullText = ''
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += pageText + '\n'
      
      console.log(`Page ${pageNum} extracted, characters: ${pageText.length}`)
    }
    
    console.log(`Total text extracted: ${fullText.length} characters`)
    
    // Validate text size (max 1MB of text)
    const maxTextSize = 1024 * 1024 // 1MB
    if (fullText.length > maxTextSize) {
      return { 
        success: false, 
        error: `Le texte extrait est trop volumineux (${fullText.length} caractères, max 1MB)` 
      }
    }
    
    if (fullText.trim().length === 0) {
      return { 
        success: false, 
        error: 'Aucun texte n\'a pu être extrait du PDF' 
      }
    }
    
    return { success: true, text: fullText.trim() }
    
  } catch (error) {
    console.error('PDF extraction error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de l\'extraction du texte PDF' 
    }
  }
}

// Save manuscript text to database
export async function saveManuscriptText(
  fileName: string, 
  fileType: string, 
  textContent: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Saving manuscript text to database...')
    
    const manuscriptData = {
      file_name: fileName,
      file_type: fileType,
      file_size: textContent.length, // number of characters
      content: textContent, // extracted text
      status: 'uploaded'
    }
    
    const { data, error } = await supabase
      .from('manuscripts')
      .insert(manuscriptData)
      .select()
      .single()
    
    if (error) {
      console.error('Database save error:', error)
      return { success: false, error: `Erreur sauvegarde: ${error.message}` }
    }
    
    console.log('Manuscript saved to database:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('Unexpected database error:', error)
    return { success: false, error: 'Une erreur inattendue s\'est produite lors de la sauvegarde' }
  }
}

