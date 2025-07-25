import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeAccent(transcription: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  const prompt = `You are an expert in linguistic and regional accents. Based on the English transcription below, identify the speaker's accent (e.g., Indian, British, American, etc.). Return a JSON response with accent, confidence level (%), and reasoning.

Transcription: ${transcription}

Please respond with valid JSON only in this exact format:
{
  "accent": "accent_name",
  "confidence": "percentage%",
  "reasoning": "explanation"
}`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}
