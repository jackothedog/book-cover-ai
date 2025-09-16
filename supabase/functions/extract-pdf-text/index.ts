import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath, fileName, fileSize, fileType } = await req.json()
    
    console.log('Processing PDF:', { filePath, fileName, fileSize })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Download PDF from Storage
    console.log('Downloading PDF from storage...')
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('manuscripts')
      .download(filePath.replace('manuscripts/', ''))

    if (downloadError) {
      throw new Error(`Download error: ${downloadError.message}`)
    }

    // 2. Extract text from PDF using pdf-parse
    console.log('Extracting text from PDF...')
    const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1')
    
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    const pdfData = await pdfParse.default(buffer)
    const extractedText = pdfData.text

    console.log(`Text extracted: ${extractedText.length} characters`)

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF')
    }

    // Validate text size (max 1MB)
    const maxTextSize = 1024 * 1024 // 1MB
    if (extractedText.length > maxTextSize) {
      throw new Error(`Extracted text too large: ${extractedText.length} characters (max 1MB)`)
    }

    // 3. Save to manuscripts table
    console.log('Saving to database...')
    const { data: manuscript, error: dbError } = await supabase
      .from('manuscripts')
      .insert({
        file_name: fileName,
        file_type: fileType,
        file_size: extractedText.length, // characters count
        content: extractedText,
        status: 'processed'
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log('Manuscript saved:', manuscript.id)

    // 4. TODO: Webhook to n8n (will be implemented later)
    // await fetch('https://your-n8n-webhook.com', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     manuscript_id: manuscript.id,
    //     status: 'ready'
    //   })
    // })

    return new Response(
      JSON.stringify({ 
        success: true, 
        manuscript_id: manuscript.id,
        text_length: extractedText.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
