import imageCompression from 'browser-image-compression'

export interface CompressedImageResult {
  file: File
  width: number
  height: number
  originalSize: number
  compressedSize: number
}

function supportsWebP(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').startsWith('data:image/webp')
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

export async function compressImage(file: File): Promise<CompressedImageResult> {
  const originalSize = file.size
  const useWebP = supportsWebP()

  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: useWebP ? 'image/webp' : 'image/jpeg',
    initialQuality: 0.92,
    preserveExif: false,
  } as const

  const compressed = await imageCompression(file, options)

  const { width, height } = await getImageDimensions(compressed)

  const ext = useWebP ? '.webp' : '.jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const renamedFile = new File(
    [compressed],
    `${baseName}${ext}`,
    { type: compressed.type }
  )

  return {
    file: renamedFile,
    width,
    height,
    originalSize,
    compressedSize: renamedFile.size,
  }
}

export function isValidImageType(file: File): boolean {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  return allowed.includes(file.type)
}

export function isValidImageSize(file: File): boolean {
  return file.size <= 20 * 1024 * 1024
}
