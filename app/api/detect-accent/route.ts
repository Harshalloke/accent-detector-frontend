import { NextRequest, NextResponse } from 'next/server'
import { analyzeAccent } from '@/lib/gemini'

const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Create FormData for Gradio (simpler approach)
    const gradioFormData = new FormData()
    gradioFormData.append('data', JSON.stringify([audioFile]))
    
    // Call Gradio API
    const transcriptionResponse = await fetch(`${WHISPER_SERVICE_URL}/api/predict`, {
      method: 'POST',
      body: gradioFormData  // Send as FormData instead of JSON
    })

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription service failed: ${transcriptionResponse.status}`)
    }

    const transcriptionResult = await transcriptionResponse.json()
    
    // Parse the response from Gradio
    const whisperData = transcriptionResult.data[0]
    
    if (whisperData.error) {
      throw new Error(whisperData.error)
    }

    // Analyze accent using Gemini
    const accentResult = await analyzeAccent(whisperData.text)

    return NextResponse.json({
      ...accentResult,
      transcription: whisperData.text,
      confidence: whisperData.confidence || 1.0,
      source: 'gradio_whisper'
    })

  } catch (error) {
    console.error('Accent detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect accent' },
      { status: 500 }
    )
  }
}

