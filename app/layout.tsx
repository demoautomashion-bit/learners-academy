// Vercel Deployment Test
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { DataProvider } from '@/contexts/data-context'
import { StabilityBoundary } from '@/components/stability/stability-boundary'
import { cn } from '@/lib/utils'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'The Learners Academy',
    template: '%s | The Learners Academy',
  },
  description: 'Premium English Language Institute - Empowering learners with world-class language education',
  keywords: ['English', 'Language', 'Education', 'Academy', 'Learning', 'Institute'],
  authors: [{ name: 'The Learners Academy' }],
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
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
    <html lang="en" className={cn(cormorant.variable)}>
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
