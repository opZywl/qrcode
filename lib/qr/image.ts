export type ImageReadError = "unsupported" | "tooLarge" | "decode"

export class ImageReadFailure extends Error {
  readonly reason: ImageReadError

  constructor(reason: ImageReadError) {
    super(reason)
    this.reason = reason
  }
}

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
]

export const IMAGE_ACCEPT = ACCEPTED_TYPES.join(",")

export const LOGO_LIMITS = { maxBytes: 5 * 1024 * 1024, maxDimension: 512, output: "png" } as const
export const BACKGROUND_LIMITS = { maxBytes: 10 * 1024 * 1024, maxDimension: 1280, output: "photo" } as const

export interface ReadImageOptions {
  maxBytes: number
  maxDimension: number
  output: "png" | "photo"
}

export function isAcceptedImageType(type: string): boolean {
  return ACCEPTED_TYPES.includes(type)
}

function targetSize(width: number, height: number, maxDimension: number, allowUpscale: boolean) {
  const safeWidth = width || maxDimension
  const safeHeight = height || maxDimension
  const largest = Math.max(safeWidth, safeHeight)
  const scale = largest > maxDimension || allowUpscale ? maxDimension / largest : 1
  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
  }
}

export async function readImageFile(file: File, options: ReadImageOptions): Promise<string> {
  if (!isAcceptedImageType(file.type)) {
    throw new ImageReadFailure("unsupported")
  }
  if (file.size > options.maxBytes) {
    throw new ImageReadFailure("tooLarge")
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.decoding = "async"
    image.src = objectUrl
    await image.decode()

    const { width, height } = targetSize(
      image.naturalWidth,
      image.naturalHeight,
      options.maxDimension,
      file.type === "image/svg+xml",
    )
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) {
      throw new ImageReadFailure("decode")
    }
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"
    context.drawImage(image, 0, 0, width, height)

    if (options.output === "png") {
      return canvas.toDataURL("image/png")
    }
    const webp = canvas.toDataURL("image/webp", 0.88)
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.88)
  } catch (error) {
    if (error instanceof ImageReadFailure) {
      throw error
    }
    throw new ImageReadFailure("decode")
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
