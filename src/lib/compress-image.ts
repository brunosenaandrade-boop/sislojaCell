import imageCompression from 'browser-image-compression'

export interface CompressedImageResult {
  file: File
  width: number
  height: number
  originalSize: number
  compressedSize: number
}

export interface WatermarkOptions {
  osNumero: number
  imei?: string
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

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Erro ao carregar imagem'))
    }
    img.src = url
  })
}

function canvasToFile(canvas: HTMLCanvasElement, fileName: string, mimeType: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Erro ao converter canvas'))
        resolve(new File([blob], fileName, { type: mimeType }))
      },
      mimeType,
      0.92
    )
  })
}

export async function addWatermark(file: File, options: WatermarkOptions): Promise<File> {
  const img = await loadImage(file)
  const { width, height } = img

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Desenhar imagem original
  ctx.drawImage(img, 0, 0)

  // Calcular tamanho da barra de watermark (proporcional à imagem)
  const barHeight = Math.max(Math.round(height * 0.06), 36)
  const fontSize = Math.max(Math.round(barHeight * 0.42), 13)
  const padding = Math.round(barHeight * 0.25)

  // Barra semi-transparente no rodapé
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillRect(0, height - barHeight, width, barHeight)

  // Texto do watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = `${fontSize}px Arial, sans-serif`
  ctx.textBaseline = 'middle'

  const osText = `OS #${String(options.osNumero).padStart(5, '0')}`
  const imeiText = options.imei ? `IMEI: ${options.imei}` : ''
  const now = new Date()
  const dateText = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const parts = [osText, imeiText, dateText].filter(Boolean)
  const leftText = parts.join('  |  ')

  ctx.textAlign = 'left'
  ctx.fillText(leftText, padding, height - barHeight / 2)

  // "CellFlow" no canto direito
  ctx.textAlign = 'right'
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.fillText('CellFlow', width - padding, height - barHeight / 2)

  // Exportar
  const mimeType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
  const result = await canvasToFile(canvas, file.name, mimeType)
  return result
}

export async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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
