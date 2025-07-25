# 🎤 AI-Powered Accent Detector

A modern web application that uses AI to analyze voice recordings and detect accents with high accuracy.

![Accent Detector Demo](https://via.placeholder.com/800x400/1a1a1a/ffffff-time Voice Recording** - Record directly in the browser
- 🤖 **AI-Powered Analysis** - Uses OpenAI Whisper + Google Gemini
- 🌍 **Global Accent Detection** - Identifies accents from around the world
- 👤 **User Authentication** - Secure login/signup with Supabase
- 📊 **Detection History** - View and manage past detections
- 🎨 **Modern Dark UI** - Responsive design with glassmorphism effects
- ⚡ **Real-time Results** - Get instant accent analysis

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Framer Motion** - Smooth animations

### Backend & Services
- **Supabase** - Authentication & PostgreSQL database
- **Google Gemini** - AI accent analysis
- **Whisper (Gradio)** - Speech-to-text transcription
- **Hugging Face Spaces** - Free ML model hosting

### Deployment
- **Vercel** - Frontend hosting
- **Hugging Face Spaces** - Whisper service hosting
- **Supabase Cloud** - Database & auth hosting

## 🚀 Live Demo

**🌐 [Try the Live App](https://accent-detector-frontend.vercel.app/)**

**🎤 [Whisper Service](https://your-username-whisper-accent-detector.hf.space)**

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI Studio account
- Hugging Face account

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/accent-detector.git
cd accent-detector
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
# Fill in your API keys and URLs
```

### 4. Database Setup
1. Create a Supabase project
2. Run the SQL migrations (see database schema below)
3. Update your `.env.local` with Supabase credentials

### 5. Deploy Whisper Service
1. Create a Hugging Face Space
2. Upload the Gradio app files
3. Update `WHISPER_SERVICE_URL` in your environment

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Whisper API    │    │  Google Gemini  │
│   (Vercel)      │───▶│ (HuggingFace)    │───▶│   AI Analysis   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                            ┌─────────────────┐
│   Supabase      │◀───────────────────────────│   Accent Result │
│   Database      │                            │   Storage       │
└─────────────────┘                            └─────────────────┘
```

## 🎯 How It Works

1. **User Records Audio** - Web audio API captures voice
2. **Speech-to-Text** - Whisper transcribes the audio
3. **AI Analysis** - Gemini analyzes linguistic patterns
4. **Accent Detection** - Returns accent type with confidence
5. **Result Storage** - Saves to Supabase for history

## 📱 API Endpoints

### POST `/api/detect-accent`
Analyze audio and detect accent.

**Request:**
```
Content-Type: multipart/form-data
audio: File (audio file)
```

**Response:**
```json
{
  "accent": "American",
  "confidence": "85%",
  "reasoning": "Analysis details...",
  "transcription": "Hello, how are you?",
  "region": "North America"
}
```

## 🗄️ Database Schema

### Supabase SQL Setup

```sql
-- Enable RLS
ALTER TABLE IF EXISTS public.detections ENABLE ROW LEVEL SECURITY;

-- Create detections table
CREATE TABLE IF NOT EXISTS public.detections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transcription TEXT NOT NULL,
    accent TEXT NOT NULL,
    confidence TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
CREATE POLICY "Users can view own detections" ON public.detections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own detections" ON public.detections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own detections" ON public.detections
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS detections_user_id_idx ON public.detections(user_id);
CREATE INDEX IF NOT EXISTS detections_created_at_idx ON public.detections(created_at DESC);
```

## 🚀 Deployment Guide

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Whisper Service (Hugging Face Spaces)
1. Create new Space with Gradio SDK
2. Upload the following files:

**app.py:**
```python
import gradio as gr
import whisper
import tempfile
import os
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model = None

def load_whisper_model():
    global model
    if model is None:
        try:
            logger.info("Loading Whisper model...")
            model = whisper.load_model("tiny")
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            model = None
    return model

def transcribe_audio(audio_file):
    if audio_file is None:
        return {"error": "No audio file provided"}
    
    current_model = load_whisper_model()
    if current_model is None:
        return {"error": "Whisper model not available"}
    
    try:
        result = current_model.transcribe(
            audio_file,
            fp16=False,
            language="en",
            task="transcribe",
            temperature=0.0
        )
        
        transcribed_text = result["text"].strip()
        logger.info(f"Transcription completed: '{transcribed_text[:50]}...'")
        
        return {
            "text": transcribed_text,
            "language": result.get("language", "en"),
            "confidence": abs(result.get("avg_logprob", -1)),
            "source": "gradio_whisper"
        }
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return {"error": f"Transcription failed: {str(e)}"}

load_whisper_model()

with gr.Blocks(title="Whisper Accent Detector Service") as demo:
    gr.Markdown("# 🎤 Whisper Transcription Service")
    
    with gr.Tab("Transcription"):
        audio_input = gr.Audio(
            sources=["microphone", "upload"],
            type="filepath",
            label="Record or Upload Audio"
        )
        transcribe_btn = gr.Button("Transcribe", variant="primary")
        output_text = gr.JSON(label="Transcription Result")
        
        transcribe_btn.click(
            fn=transcribe_audio,
            inputs=audio_input,
            outputs=output_text
        )

if __name__ == "__main__":
    demo.launch()
```

**requirements.txt:**
```txt
gradio==4.44.0
openai-whisper==20231117
torch==2.0.1
torchaudio==2.0.2
```

### Database (Supabase)
1. Create project and configure authentication
2. Run SQL migrations from database schema above
3. Set up Row Level Security policies

## 🔧 Environment Variables

Create a `.env.local` file with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Whisper Service (Hugging Face Spaces)
WHISPER_SERVICE_URL=https://your-username-whisper-accent-detector.hf.space
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `GEMINI_API_KEY` | Google AI Studio API key | ✅ |
| `WHISPER_SERVICE_URL` | Hugging Face Space URL | ✅ |

## 🧪 Testing & Development

### Run Tests
```bash
# Unit tests
npm test

# End-to-end tests
npm run test:e2e

# Type checking
npm run type-check
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Project Structure

```
accent-detector/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── api/                      # API routes
│   │   └── detect-accent/
│   │       └── route.ts
│   ├── dashboard/page.tsx        # User dashboard
│   ├── detect/page.tsx          # Main detection page
│   ├── profile/page.tsx         # User profile
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── AccentDetector.tsx       # Main detector component
│   ├── Dashboard.tsx            # Dashboard component
│   ├── Header.tsx               # Navigation header
│   └── LandingPage.tsx          # Landing page component
├── lib/                         # Utilities and configurations
│   ├── supabase/               # Supabase client & middleware
│   ├── gemini.ts               # Gemini AI integration
│   └── utils.ts                # Utility functions
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind CSS config
└── tsconfig.json                # TypeScript config
```

## 🚨 Troubleshooting

### Common Issues

**1. "Whisper model not available" error:**
- Check if your Hugging Face Space is running
- Verify the `WHISPER_SERVICE_URL` environment variable
- Check Space logs for model loading errors

**2. Authentication errors:**
- Verify Supabase URL and keys in environment variables
- Check if email confirmation is required
- Ensure RLS policies are set up correctly

**3. "Failed to analyze audio" error:**
- Check browser microphone permissions
- Verify audio file format compatibility
- Check network connectivity to Hugging Face

**4. Build/deployment errors:**
- Ensure all environment variables are set in Vercel
- Check for TypeScript errors: `npm run type-check`
- Verify all dependencies are installed

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
NODE_ENV=development
DEBUG=true
```

## 🔒 Security Considerations

- **Row Level Security (RLS)** enabled on all database tables
- **Environment variables** never exposed to client-side
- **API routes** include proper error handling and validation
- **Authentication** handled securely through Supabase
- **CORS** configured properly for cross-origin requests

## 🌟 Performance Optimizations

- **Lazy loading** of components and models
- **Audio compression** for faster uploads
- **Caching** of transcription results
- **Optimized images** and assets
- **Edge functions** for global performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **OpenAI Whisper** - Outstanding speech recognition model
- **Google Gemini** - Powerful AI analysis capabilities
- **Hugging Face** - Free ML model hosting platform
- **Supabase** - Excellent backend-as-a-service
- **Vercel** - Seamless frontend deployment
- **shadcn/ui** - Beautiful and accessible UI components
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support & Community

- 🐛 [Report Issues](https://github.com/Harshalloke/accent-detector/issues)
- 💡 [Feature Requests](https://github.com/Harshalloke/accent-detector/discussions)
- 📧 [Contact](mailto:lokeharshal2004@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/harshal-loke/)

## 🚀 Future Roadmap

- [ ] **Multiple Language Support** - Expand beyond English
- [ ] **Accent Similarity Matching** - Find similar accents
- [ ] **Voice Training Mode** - Help users modify their accent
- [ ] **Mobile App** - React Native version
- [ ] **Batch Processing** - Analyze multiple files
- [ ] **Advanced Analytics** - Detailed pronunciation analysis
- [ ] **Social Features** - Share and compare results
- [ ] **API Monetization** - Premium features for developers

## 📈 Analytics & Metrics

Track your app's performance with built-in analytics:

- **User Engagement** - Recording frequency and duration
- **Accuracy Metrics** - Confidence scores and user feedback
- **Performance** - Response times and error rates
- **Usage Patterns** - Popular features and user flows


  Built with ❤️ using Next.js, AI, and modern web technologies
  Regards Harshal Loke............................................................................



  
  
  
  
  
