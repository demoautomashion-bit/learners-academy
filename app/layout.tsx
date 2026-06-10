import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { DataProvider } from '@/contexts/data-context'
import { StabilityBoundary } from '@/components/stability/stability-boundary'
import { cn } from '@/lib/utils'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'The Learners Academy',
    template: '%s | The Learners Academy',
  },
  description: 'Premium English Language Institute - Empowering learners with world-class language education',
  keywords: ['English', 'Language', 'Education', 'Academy', 'Learning', 'Institute'],
  authors: [{ name: 'The Learners Academy' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/images/logo-white-bg.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/logo-white-bg.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/images/logo-white-bg.png',
    apple: [
      { url: '/apple-icon.png' },
      { url: '/images/logo-white-bg.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#1d8ae2',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          <DataProvider>
            <StabilityBoundary name="Global Core">
              <div id="root-content">
                {children}
              </div>
            </StabilityBoundary>
          </DataProvider>
        </AuthProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
