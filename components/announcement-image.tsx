'use client'

import React, { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

interface AnnouncementImageProps {
  imageUrl: string
  title: string
}

export function AnnouncementImage({ imageUrl, title }: AnnouncementImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Normal View Image */}
      <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-md mb-8">
        <img
          src={imageUrl}
          alt={title}
          onClick={() => setIsOpen(true)}
          className="w-full h-auto max-h-[400px] md:max-h-[500px] object-contain transition-transform duration-500 group-hover:scale-[1.01]"
        />
        <div 
          onClick={() => setIsOpen(true)}
          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
        >
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-primary shadow-lg">
            <ZoomIn className="w-4 h-4" />
            Click to Zoom / View Timetable
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Zoom Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex justify-between items-center w-full max-w-6xl mx-auto z-10">
            <h4 className="text-white text-xs md:text-sm font-medium tracking-tight truncate max-w-[70%]">
              {title}
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors text-white px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-2 md:p-6 my-4">
            <img
              src={imageUrl}
              alt={title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
            />
          </div>

          {/* Footer Instruction */}
          <div className="text-center text-[10px] uppercase tracking-widest font-bold text-white/40 pb-2">
            Pinch to zoom on mobile screen
          </div>
        </div>
      )}
    </>
  )
}
