import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Accent Detector',
  description: 'AI-powered accent detection from voice recordings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} dark bg-gray-900 text-white`}>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {children}
        </main>
      </body>
    </html>
  )
}
