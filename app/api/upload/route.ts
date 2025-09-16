import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Forward the request to n8n form
    const response = await fetch('https://n8n.srv850293.hstgr.cloud/form/4b98c84c-638f-4bd8-bf7e-7ffbf3c8e104', {
      method: 'POST',
      body: formData,
    })

    console.log('n8n response status:', response.status)
    console.log('n8n response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n error response:', errorText)
      
      // Parse error message if it's JSON
      let errorMessage = `n8n responded with status: ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.message) {
          errorMessage = `n8n error: ${errorJson.message}`
          if (errorJson.hint) {
            errorMessage += ` - ${errorJson.hint}`
          }
        }
      } catch {
        errorMessage += ` - ${errorText}`
      }
      
      throw new Error(errorMessage)
    }

    // Handle response
    const contentType = response.headers.get('content-type')
    let result
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json()
    } else {
      result = await response.text()
    }
    
    console.log('n8n response:', result)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Upload proxy error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
