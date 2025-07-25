// components/ThemeDebug.tsx
'use client'
import { useEffect, useState } from 'react'

export default function ThemeDebug() {
  const [info, setInfo] = useState('')
  
  useEffect(() => {
    const update = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const stored = localStorage.getItem('accent-detector-theme')
      const computed = window.getComputedStyle(document.documentElement).getPropertyValue('--background')
      setInfo(`Dark: ${isDark} | Stored: ${stored} | BG: ${computed}`)
    }
    
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true })
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white p-2 text-xs rounded z-50">
      {info}
    </div>
  )
}
