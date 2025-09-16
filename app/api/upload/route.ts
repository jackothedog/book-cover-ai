import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Forward the request to n8n
    const response = await fetch('https://n8n.srv850293.hstgr.cloud/form/274283dc-9413-4264-bba4-c66f1eb3512e', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`n8n responded with status: ${response.status}`)
    }

    const result = await response.json()
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Upload proxy error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
