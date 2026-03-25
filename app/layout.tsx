import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { DataProvider } from '@/contexts/data-context'
import { ClerkProvider } from '@clerk/nextjs'
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
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cormorant.variable}>
        <body className="antialiased">
          <AuthProvider>
            <DataProvider>
              <div id="root-content">
                {children}
              </div>
            </DataProvider>
          </AuthProvider>
          <Toaster position="top-right" richColors />
          <Analytics />
          {/* Simple Diagnostic Overlay for fatal JS crashes */}
          <script dangerouslySetInnerHTML={{ __html: `
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              var body = document.body;
              var errorDiv = document.createElement('div');
              errorDiv.style.position = 'fixed';
              errorDiv.style.bottom = '10px';
              errorDiv.style.left = '10px';
              errorDiv.style.background = 'oklch(0.577 0.245 27.325)';
              errorDiv.style.color = 'white';
              errorDiv.style.padding = '10px';
              errorDiv.style.borderRadius = '5px';
              errorDiv.style.zIndex = '9999';
              errorDiv.style.fontSize = '12px';
              errorDiv.style.maxWidth = '80%';
              errorDiv.innerHTML = '<strong>Fatal Error:</strong> ' + msg;
              body.appendChild(errorDiv);
              return false;
            };
          `}} />
        </body>
      </html>
    </ClerkProvider>
  )
}
