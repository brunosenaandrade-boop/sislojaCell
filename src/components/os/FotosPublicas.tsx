'use client'

import { useState } from 'react'
import { Camera, X, ShieldCheck } from 'lucide-react'

interface FotosPublicasProps {
  fotos: { id: string; url: string; file_hash?: string }[]
}

export function FotosPublicas({ fotos }: FotosPublicasProps) {
  const [selectedFoto, setSelectedFoto] = useState<{ url: string; file_hash?: string } | null>(null)

  if (!fotos || fotos.length === 0) return null

  const hasProtected = fotos.some(f => f.file_hash)

  return (
    <>
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Fotos do Aparelho ({fotos.length})
          </span>
          {hasProtected && (
            <span className="flex items-center gap-1 ml-auto text-green-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Arquivos protegidos</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((foto) => (
            <button
              key={foto.id}
              onClick={() => setSelectedFoto(foto)}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <img
                src={foto.url}
                alt="Foto do aparelho"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {foto.file_hash && (
                <div className="absolute top-1 left-1 bg-green-600/80 rounded px-1 py-0.5 flex items-center gap-0.5">
                  <ShieldCheck className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        {hasProtected && (
          <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Fotos com marca d&apos;água e hash SHA-256 para garantir autenticidade
          </p>
        )}
      </div>

      {/* Lightbox */}
      {selectedFoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedFoto(null)}
        >
          <button
            onClick={() => setSelectedFoto(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedFoto.url}
            alt="Foto do aparelho"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedFoto.file_hash && (
            <div className="flex items-center gap-1.5 mt-3 bg-green-900/60 rounded-full px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
              <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-green-300 font-medium">Arquivo protegido</span>
              <span className="text-[10px] text-green-400/70">
                SHA-256: {selectedFoto.file_hash.substring(0, 16)}...
              </span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
