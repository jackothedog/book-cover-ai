import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Forward the request to n8n
    const response = await fetch('https://n8n.srv850293.hstgr.cloud/form/274283dc-9413-4264-bba4-c66f1eb3512e', {
      method: 'POST',
      body: formData,
    })

    console.log('n8n response status:', response.status)
    console.log('n8n response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n error response:', errorText)
      throw new Error(`n8n responded with status: ${response.status} - ${errorText}`)
    }

    // n8n form might return text or JSON, handle both
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
