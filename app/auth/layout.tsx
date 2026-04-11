import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Suspense fallback={
          <div className="w-full h-full min-h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  )
}
