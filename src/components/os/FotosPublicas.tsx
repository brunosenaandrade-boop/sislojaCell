'use client'

import { useState } from 'react'
import { Camera, X } from 'lucide-react'

interface FotosPublicasProps {
  fotos: { id: string; url: string }[]
}

export function FotosPublicas({ fotos }: FotosPublicasProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  if (!fotos || fotos.length === 0) return null

  return (
    <>
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Fotos do Aparelho ({fotos.length})
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((foto) => (
            <button
              key={foto.id}
              onClick={() => setSelectedUrl(foto.url)}
              className="aspect-square rounded-lg overflow-hidden border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <img
                src={foto.url}
                alt="Foto do aparelho"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedUrl(null)}
        >
          <button
            onClick={() => setSelectedUrl(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedUrl}
            alt="Foto do aparelho"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
