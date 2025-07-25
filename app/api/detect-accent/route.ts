import { NextRequest, NextResponse } from 'next/server'
import { analyzeAccent } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'

const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Prepare form data for Whisper service
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile)

    // Send to local Whisper service
    console.log('Sending audio to Whisper service...')
    const whisperResponse = await fetch(`${WHISPER_SERVICE_URL}/transcribe`, {
      method: 'POST',
      body: whisperFormData,
    })

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text()
      console.error('Whisper service error:', errorText)
      throw new Error(`Transcription failed: ${whisperResponse.status}`)
    }

    const whisperResult = await whisperResponse.json()
    const transcript = whisperResult.text

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'No speech detected in audio' }, { status: 400 })
    }

    console.log('Transcription successful:', transcript)

    // Analyze accent with Gemini
    const accentResult = await analyzeAccent(transcript)

    // Save to database if user is authenticated
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      await supabase
        .from('detections')
        .insert({
          user_id: session.user.id,
          transcription: transcript,
          accent: accentResult.accent,
          confidence: accentResult.confidence,
          reasoning: accentResult.reasoning,
        })
    }

    return NextResponse.json({
      ...accentResult,
      transcription: transcript,
    })

  } catch (error) {
    console.error('Accent detection error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}
