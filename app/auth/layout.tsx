export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
