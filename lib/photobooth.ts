export type Filter = {
  id: string
  name: string
  /** CSS filter string, valid for both `element.style.filter` and canvas `ctx.filter`. */
  css: string
  /** Optional swatch gradient used in the filter picker chips. */
  swatch: string
}

export const FILTERS: Filter[] = [
  {
    id: 'original',
    name: 'original',
    css: 'contrast(1.02) saturate(1.02)',
    swatch: 'linear-gradient(135deg,#8a8f96,#c9ccd1)',
  },
  {
    id: 'noir',
    name: 'noir',
    css: 'grayscale(1) contrast(1.35) brightness(0.95)',
    swatch: 'linear-gradient(135deg,#111,#8a8a8a)',
  },
  {
    id: 'sepia',
    name: 'sepia',
    css: 'sepia(0.85) contrast(1.05) brightness(1.05) saturate(1.3)',
    swatch: 'linear-gradient(135deg,#5a3b1a,#c9a06a)',
  },
  {
    id: 'vintage',
    name: 'vintage',
    css: 'sepia(0.38) saturate(1.35) contrast(1.12) brightness(1.05) hue-rotate(-8deg)',
    swatch: 'linear-gradient(135deg,#7a4a2b,#d8b487)',
  },
  {
    id: 'faded',
    name: 'faded',
    css: 'contrast(0.82) brightness(1.12) saturate(0.78) sepia(0.22)',
    swatch: 'linear-gradient(135deg,#9a8f80,#e6ded2)',
  },
  {
    id: 'seventies',
    name: "6-70s",
    css: 'sepia(0.45) saturate(1.9) hue-rotate(-15deg) contrast(1.08) brightness(1.04)',
    swatch: 'linear-gradient(135deg,#b5642a,#e0a94f)',
  },
  {
    id: 'chrome',
    name: 'chrome',
    css: 'saturate(1.5) contrast(1.12) brightness(1.05) hue-rotate(8deg)',
    swatch: 'linear-gradient(135deg,#2b6b7a,#7fd0d8)',
  },
  {
    id: 'polaroid',
    name: 'polaroid',
    css: 'contrast(1.1) brightness(1.08) saturate(1.25) sepia(0.12) hue-rotate(-4deg)',
    swatch: 'linear-gradient(135deg,#c4a3b0,#efe6d8)',
  },
]

export type Effects = {
  grain: boolean
  vignette: boolean
  lightLeak: boolean
  timestamp: boolean
}

export const DEFAULT_EFFECTS: Effects = {
  grain: true,
  vignette: true,
  lightLeak: false,
  timestamp: true,
}

/** A single captured frame (already filtered) plus the source pixels. */
export type Shot = {
  dataUrl: string
}

/** Draw a center-cropped, mirrored, filtered frame from the video onto a target 2D context. */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  dw: number,
  dh: number,
  filterCss: string,
) {
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return

  const targetRatio = dw / dh
  const videoRatio = vw / vh

  let sx = 0
  let sy = 0
  let sw = vw
  let sh = vh

  // Center-crop the video to match the frame aspect ratio.
  if (videoRatio > targetRatio) {
    sw = vh * targetRatio
    sx = (vw - sw) / 2
  } else {
    sh = vw / targetRatio
    sy = (vh - sh) / 2
  }

  ctx.save()
  ctx.filter = filterCss || 'none'
  // Mirror horizontally so it feels like a real booth mirror.
  ctx.translate(dw, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh)
  ctx.restore()
}

function applyGrain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const density = Math.floor((w * h) / 26)
  ctx.save()
  for (let i = 0; i < density; i++) {
    const gx = x + Math.random() * w
    const gy = y + Math.random() * h
    const shade = Math.random() > 0.5 ? 255 : 0
    ctx.fillStyle = `rgba(${shade},${shade},${shade},${Math.random() * 0.09})`
    ctx.fillRect(gx, gy, 1, 1)
  }
  ctx.restore()
}

function applyVignette(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2
  const cy = y + h / 2
  const grad = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, Math.max(w, h) * 0.72)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(30,15,5,0.55)')
  ctx.save()
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

function applyLightLeak(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const grad = ctx.createLinearGradient(x + w, y, x + w * 0.3, y + h)
  grad.addColorStop(0, 'rgba(255,120,40,0.5)')
  grad.addColorStop(0.4, 'rgba(255,70,60,0.18)')
  grad.addColorStop(1, 'rgba(255,200,80,0)')
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

/**
 * Compose the three captured shots into one tall vintage photo-strip canvas.
 * Returns the finished canvas so callers can export a data URL.
 */
export function composeStrip(
  shots: string[],
  effects: Effects,
  opts?: { caption?: string },
): Promise<HTMLCanvasElement> {
  const SCALE = 2
  const frameW = 480 * SCALE
  const frameH = 360 * SCALE
  const pad = 26 * SCALE
  const gap = 16 * SCALE
  const headerH = 92 * SCALE
  const footerH = 76 * SCALE

  const stripW = frameW + pad * 2
  const stripH = headerH + frameH * 3 + gap * 2 + footerH

  const canvas = document.createElement('canvas')
  canvas.width = stripW
  canvas.height = stripH
  const ctx = canvas.getContext('2d')!

  // Cream paper base with subtle warm tint gradient.
  const paper = ctx.createLinearGradient(0, 0, 0, stripH)
  paper.addColorStop(0, '#f6efe1')
  paper.addColorStop(1, '#efe4cf')
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, stripW, stripH)

  // Header text.
  ctx.fillStyle = '#3a2a17'
  ctx.textAlign = 'center'
  ctx.font = `700 ${34 * SCALE}px Oswald, sans-serif`
  ctx.fillText('vintage photo booth', stripW / 2, headerH * 0.5)
  ctx.font = `500 ${15 * SCALE}px Oswald, sans-serif`
  ctx.fillStyle = '#8a2e22'
  ctx.fillText('★  live in 70s ★', stripW / 2, headerH * 0.78)

  return new Promise((resolve) => {
    let loaded = 0
    const images: HTMLImageElement[] = []

    if (shots.length === 0) {
      finish()
      return
    }

    shots.forEach((src, i) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        images[i] = img
        loaded++
        if (loaded === shots.length) finish()
      }
      img.onerror = () => {
        loaded++
        if (loaded === shots.length) finish()
      }
      img.src = src
    })

    function finish() {
      images.forEach((img, i) => {
        const fx = pad
        const fy = headerH + i * (frameH + gap)
        if (img) {
          ctx.drawImage(img, fx, fy, frameW, frameH)
        } else {
          ctx.fillStyle = '#d8cbb2'
          ctx.fillRect(fx, fy, frameW, frameH)
        }

        if (effects.lightLeak && i % 2 === 0) applyLightLeak(ctx, fx, fy, frameW, frameH)
        if (effects.vignette) applyVignette(ctx, fx, fy, frameW, frameH)
        if (effects.grain) applyGrain(ctx, fx, fy, frameW, frameH)

        // Thin inner border around each frame.
        ctx.strokeStyle = 'rgba(58,42,23,0.35)'
        ctx.lineWidth = 1 * SCALE
        ctx.strokeRect(fx + 0.5, fy + 0.5, frameW - 1, frameH - 1)
      })

      // Footer.
      const footerY = headerH + frameH * 3 + gap * 2
      ctx.fillStyle = '#8a2e22'
      ctx.fillRect(pad, footerY + 10 * SCALE, stripW - pad * 2, 2 * SCALE)

      ctx.textAlign = 'center'
      ctx.fillStyle = '#3a2a17'
      ctx.font = `500 ${16 * SCALE}px Oswald, sans-serif`
      const caption = opts?.caption?.trim()
      const dateStr = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      ctx.fillText(caption ? caption.toLowerCase() : 'let my name echo in song', stripW / 2, footerY + 38 * SCALE)
      if (effects.timestamp) {
        ctx.font = `400 ${12 * SCALE}px Oswald, sans-serif`
        ctx.fillStyle = '#7a5a38'
        ctx.fillText(dateStr, stripW / 2, footerY + 58 * SCALE)
      }

      resolve(canvas)
    }
  })
}
