'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Camera, Trash2, Loader2, ImagePlus, ZoomIn } from 'lucide-react'
import { toast } from 'sonner'
import type { FotoOS } from '@/types/database'
import { compressImage, isValidImageType, isValidImageSize } from '@/lib/compress-image'
import { ordensServicoService } from '@/services/ordens-servico.service'

interface FotosOSProps {
  osId: string
  fotos: FotoOS[]
  onFotosChange: (fotos: FotoOS[]) => void
  readonly?: boolean
  maxFotos?: number
}

export function FotosOS({ osId, fotos, onFotosChange, readonly = false, maxFotos = 10 }: FotosOSProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [selectedFoto, setSelectedFoto] = useState<FotoOS | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)

    const remaining = maxFotos - fotos.length
    if (remaining <= 0) {
      toast.error(`Limite de ${maxFotos} fotos atingido`)
      return
    }

    const filesToProcess = fileArray.slice(0, remaining)
    if (fileArray.length > remaining) {
      toast.warning(`Apenas ${remaining} foto(s) podem ser adicionadas`)
    }

    const valid = filesToProcess.filter(f => {
      if (!isValidImageType(f)) {
        toast.error(`${f.name}: formato não suportado`)
        return false
      }
      if (!isValidImageSize(f)) {
        toast.error(`${f.name}: arquivo muito grande (max 20MB)`)
        return false
      }
      return true
    })

    if (valid.length === 0) return

    setUploading(true)
    setUploadingCount(valid.length)
    setUploadProgress(0)

    const newFotos: FotoOS[] = []
    for (let i = 0; i < valid.length; i++) {
      try {
        setUploadProgress(Math.round((i / valid.length) * 100))

        const compressed = await compressImage(valid[i])

        const { data, error } = await ordensServicoService.uploadFoto(osId, compressed.file, {
          nomeOriginal: valid[i].name,
          tamanhoBytes: compressed.compressedSize,
          largura: compressed.width,
          altura: compressed.height,
          tipoMime: compressed.file.type,
        })

        if (error) {
          toast.error(`Erro ao enviar ${valid[i].name}: ${error}`)
        } else if (data) {
          newFotos.push(data)
        }
      } catch {
        toast.error(`Erro ao processar ${valid[i].name}`)
      }
    }

    setUploadProgress(100)

    if (newFotos.length > 0) {
      onFotosChange([...fotos, ...newFotos])
      toast.success(`${newFotos.length} foto(s) enviada(s)`)
    }

    setUploading(false)
    setUploadingCount(0)
    setUploadProgress(0)

    if (inputRef.current) inputRef.current.value = ''
  }, [osId, fotos, maxFotos, onFotosChange])

  const handleDelete = async (fotoId: string) => {
    setDeleting(fotoId)
    const { error } = await ordensServicoService.removerFoto(fotoId)
    if (error) {
      toast.error('Erro ao remover foto: ' + error)
      setDeleting(null)
      return
    }
    onFotosChange(fotos.filter(f => f.id !== fotoId))
    toast.success('Foto removida')
    setDeleting(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (readonly || uploading) return
    handleFiles(e.dataTransfer.files)
  }, [readonly, uploading, handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Camera className="h-4 w-4" />
          Fotos do Aparelho
          <span className="text-sm font-normal text-muted-foreground">
            ({fotos.length}/{maxFotos})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload zone */}
        {!readonly && fotos.length < maxFotos && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !uploading && inputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Clique ou arraste fotos aqui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG ou WebP &middot; Max 20MB por foto
            </p>
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                Comprimindo e enviando {uploadingCount} foto(s)...
              </span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Photo grid */}
        {fotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {fotos.map((foto) => (
              <div key={foto.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                <img
                  src={foto.url}
                  alt={foto.nome_original}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedFoto(foto)}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFoto(foto)
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  {!readonly && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      disabled={deleting === foto.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(foto.id)
                      }}
                    >
                      {deleting === foto.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {fotos.length === 0 && readonly && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma foto registrada
          </p>
        )}

        {/* Lightbox */}
        <Dialog open={!!selectedFoto} onOpenChange={() => setSelectedFoto(null)}>
          <DialogContent className="max-w-4xl p-2">
            {selectedFoto && (
              <div>
                <img
                  src={selectedFoto.url}
                  alt={selectedFoto.nome_original}
                  className="w-full h-auto max-h-[80vh] object-contain rounded"
                />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {selectedFoto.nome_original}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
