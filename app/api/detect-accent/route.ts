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

    console.log('Audio file details:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    })

    // Create proper FormData for Gradio
    const gradioData = new FormData()
    gradioData.append('data', JSON.stringify([audioFile]))

    console.log('Calling Whisper service:', WHISPER_SERVICE_URL)

    // Call Gradio API with proper error handling
    const transcriptionResponse = await fetch(`${WHISPER_SERVICE_URL}/api/predict`, {
      method: 'POST',
      body: gradioData,
      headers: {
        // Don't set Content-Type - let browser set it for FormData
      }
    })

    console.log('Whisper response status:', transcriptionResponse.status)

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error('Whisper service error:', errorText)
      throw new Error(`Whisper service failed: ${transcriptionResponse.status}`)
    }

    const transcriptionResult = await transcriptionResponse.json()
    console.log('Raw transcription result:', transcriptionResult)
    
    // Handle Gradio response format
    let whisperData = transcriptionResult.data?.[0]
    
    if (!whisperData) {
      throw new Error('No transcription data received from Whisper service')
    }

    // Parse if it's a JSON string
    if (typeof whisperData === 'string') {
      try {
        whisperData = JSON.parse(whisperData)
      } catch (e) {
        // If not JSON, treat as plain text
        whisperData = { text: whisperData, language: 'en', confidence: 1.0 }
      }
    }

    if (whisperData.error) {
      throw new Error(`Whisper error: ${whisperData.error}`)
    }

    const textToAnalyze = whisperData.text || whisperData
    if (!textToAnalyze || typeof textToAnalyze !== 'string') {
      throw new Error('No valid transcription text received')
    }

    console.log('Transcribed text:', textToAnalyze)

    // Analyze accent using Gemini
    const accentResult = await analyzeAccent(textToAnalyze)

    return NextResponse.json({
      ...accentResult,
      transcription: textToAnalyze,
      confidence: whisperData.confidence || 1.0,
      source: 'gradio_whisper'
    })

  } catch (error) {
    console.error('Accent detection error:', error)
    return NextResponse.json(
      { error: `Failed to analyze audio: ${error.message}` },
      { status: 500 }
    )
  }
}
