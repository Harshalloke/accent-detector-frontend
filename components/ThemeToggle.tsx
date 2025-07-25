'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check for saved theme preference or default to LIGHT
    const savedTheme = localStorage.getItem('accent-detector-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Default to light mode unless explicitly set to dark
    if (savedTheme === 'dark' || (savedTheme === 'system' && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('accent-detector-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('accent-detector-theme', 'light')
    }
  }

  if (!mounted) {
    return (
      <Button size="icon" variant="ghost" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button 
      size="icon" 
      variant="ghost" 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
      className="transition-colors hover:bg-secondary"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 transition-transform rotate-0 scale-100" />
      )}
    </Button>
  )
}
