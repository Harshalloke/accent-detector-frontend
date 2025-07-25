'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Globe, BarChart3, Shield, Zap } from 'lucide-react' // Fixed: Removed unused import
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const getUser = useCallback(async () => { // Fixed: Memoized function
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
    setLoading(false)
  }, [supabase.auth])
  
  useEffect(() => {
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [getUser]) // Fixed: Added proper dependency

  const features = [
    {
      icon: <Mic className="h-10 w-10 text-blue-600" />,
      title: "Voice Recognition",
      description: "Advanced AI-powered speech-to-text technology for accurate transcription"
    },
    {
      icon: <Globe className="h-10 w-10 text-green-600" />,
      title: "Global Accents",
      description: "Detect and analyze accents from around the world with high precision"
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-purple-600" />,
      title: "Detailed Analytics",
      description: "Get confidence scores and detailed reasoning for each detection"
    },
    {
      icon: <Shield className="h-10 w-10 text-red-600" />,
      title: "Secure & Private",
      description: "Your voice data is processed securely and never stored permanently"
    }
  ]

  const steps = [
    {
      step: "1",
      title: "Record Your Voice",
      description: "Click record and speak naturally for a few seconds"
    },
    {
      step: "2",
      title: "AI Analysis",
      description: "Our AI analyzes your speech patterns and linguistic features"
    },
    {
      step: "3",
      title: "Get Results",
      description: "Receive your accent detection with confidence score and explanation"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Discover Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Accent
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Use cutting-edge AI to analyze your voice and discover your unique accent pattern. 
            Fast, accurate, and insightful.
          </p>
          
          {/* Conditional Button Rendering */}
          {!loading && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                // Show this when user is logged in
                <Link href="/detect">
                  <Button size="lg" className="text-lg px-8 py-4 hover-glow">
                    <Mic className="mr-2 h-5 w-5" />
                    Start Detecting
                  </Button>
                </Link>
              ) : (
                // Show these when user is not logged in
                <>
                  <Link href="/register">
                    <Button size="lg" className="text-lg px-8 py-4">
                      <Mic className="mr-2 h-5 w-5" />
                      Start Detecting
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need for accurate accent detection
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow glass-card">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="glass-card py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Simple process, powerful results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Only show if user is not logged in */}
      {!loading && !user && (
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Discover Your Accent?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of users who have discovered their unique voice
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-4 hover-glow">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </section>
      )}

      {/* Welcome Back Section - Only show if user is logged in */}
      {!loading && user && (
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Welcome Back!
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Ready to analyze another accent? Let&apos;s get started. {/* Fixed: Escaped apostrophe */}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/detect">
                <Button size="lg" className="text-lg px-8 py-4 hover-glow">
                  <Mic className="mr-2 h-5 w-5" />
                  Detect Accent
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
