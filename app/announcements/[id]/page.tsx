import { notFound } from 'next/navigation'
import { getAnnouncementById, getAnnouncements } from '@/lib/actions/announcements'
import { ArrowLeft, Calendar, Megaphone } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const announcement = await getAnnouncementById(params.id)
  if (!announcement) return { title: 'Announcement Not Found | TLA' }
  return {
    title: `${announcement.title} | The Learners Academy`,
    description: announcement.summary,
  }
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const announcement = await getAnnouncementById(params.id)

  if (!announcement) notFound()

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">

      {/* Ambient Background Orbs */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.06), transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.04), transparent 70%)' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* Back Navigation */}
        <Link
          href="/#announcements"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors mb-12 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Announcements
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-full">
              <Megaphone className="w-3 h-3" />
              {announcement.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {announcement.date}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] text-foreground mb-6">
            {announcement.title}
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-5">
            {announcement.summary}
          </p>
        </header>

        {/* Divider */}
        <div className="w-full h-px bg-border mb-12" />

        {/* Article Body */}
        <article className="prose prose-sm sm:prose max-w-none text-foreground/80 leading-[1.9] text-sm sm:text-base whitespace-pre-line">
          {announcement.content}
        </article>

        {/* Footer Nav */}
        <div className="mt-16 pt-10 border-t border-border flex items-center justify-between">
          <Link
            href="/#announcements"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
            All Announcements
          </Link>
          <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/40">
            The Learners Academy
          </div>
        </div>

      </div>
    </div>
  )
}
