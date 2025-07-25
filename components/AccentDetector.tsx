'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Loader2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface DetectionResult {
  accent: string
  confidence: string
  reasoning: string
  transcription: string
}

export default function AccentDetector() {
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await analyzeAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError('')
      setResult(null)
    } catch (error) { // Fixed: Removed unused variable
      console.error('Microphone access error:', error)
      setError('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsAnalyzing(true)
    }
  }

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/detect-accent', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze audio')
      }

      const data = await response.json()
      setResult(data)
    } catch (error) { // Fixed: Removed unused variable
      console.error('Audio analysis error:', error)
      setError('Failed to analyze audio. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError('')
    setIsAnalyzing(false)
    setIsRecording(false)
  }

  const getAccentFlag = (accent: string) => {
    const flags: { [key: string]: string } = {
      'American': '🇺🇸',
      'British': '🇬🇧',
      'Australian': '🇦🇺',
      'Indian': '🇮🇳',
      'Canadian': '🇨🇦',
      'Irish': '🇮🇪',
      'Scottish': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'South African': '🇿🇦',
      'New Zealand': '🇳🇿',
      'Nigerian': '🇳🇬',
    }
    return flags[accent] || '🌐'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Accent Detector</CardTitle>
            <CardDescription>
              Record your voice and discover your accent with AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {!isRecording && !isAnalyzing && !result && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="w-32 h-32 rounded-full text-xl"
                >
                  <Mic className="h-8 w-8" />
                </Button>
                <p className="mt-4 text-gray-600">
                  Click to start recording
                </p>
              </motion.div>
            )}

            {isRecording && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="w-32 h-32 mx-auto rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <MicOff className="h-8 w-8 text-white" />
                </div>
                <p className="text-red-600 font-medium">Recording...</p>
                <Button onClick={stopRecording} variant="outline">
                  Stop Recording
                </Button>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
                <p className="text-blue-600 font-medium">Analyzing your accent...</p>
              </motion.div>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <span className="text-4xl">{getAccentFlag(result.accent)}</span>
                  {result.accent} Accent
                </CardTitle>
                <div className="text-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {result.confidence} Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Analysis:</h4>
                  <p className="text-gray-700">{result.reasoning}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Transcription:</h4>
                  <p className="text-gray-700 italic">&quot;{result.transcription}&quot;</p> {/* Fixed: Escaped quotes */}
                </div>

                <div className="pt-4">
                  <Button onClick={reset} className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
