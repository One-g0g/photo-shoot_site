<script setup lang="ts">
import { Camera, Heart } from '@lucide/vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const MINT = '#20d489'
const WIRE = 'rgba(26, 184, 116, 0.38)'
const WIRE_BRIGHT = 'rgba(26, 184, 116, 0.62)'

const LAT_RINGS = 8
const LON_SEGMENTS = 20

type Marker = {
  phi: number
  theta: number
  kind: 'mint' | 'warm'
}

const markers: Marker[] = [
  { phi: 1.05, theta: 0.4, kind: 'mint' },
  { phi: 1.35, theta: 1.8, kind: 'mint' },
  { phi: 1.65, theta: 3.2, kind: 'warm' },
  { phi: 1.95, theta: 4.6, kind: 'mint' },
  { phi: 2.25, theta: 5.4, kind: 'mint' },
  { phi: 2.55, theta: 2.4, kind: 'warm' },
]

const connections: [number, number][] = [
  [0, 1],
  [1, 3],
  [2, 4],
  [3, 5],
  [0, 4],
]

let animationId = 0
let rotationY = 0
const rotationX = 0.42

let canvasSize = 0
let canvasDpr = 1
let center = 0
let radius = 0
let sizeDirty = true
let isRunning = false
let prefersReducedMotion = false

function syncCanvasSize() {
  if (!sizeDirty) return

  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  sizeDirty = false

  const rect = container.getBoundingClientRect()
  const nextSize = Math.floor(Math.min(rect.width, rect.height))
  if (nextSize <= 0) return

  const nextDpr = Math.min(window.devicePixelRatio || 1, 1.5)

  if (nextSize === canvasSize && nextDpr === canvasDpr) return

  canvasSize = nextSize
  canvasDpr = nextDpr
  center = nextSize / 2
  radius = nextSize * 0.4

  canvas.width = Math.round(nextSize * nextDpr)
  canvas.height = Math.round(nextSize * nextDpr)
  canvas.style.width = `${nextSize}px`
  canvas.style.height = `${nextSize}px`
}

function rotateAndProject(
  phi: number,
  theta: number,
  cosY: number,
  sinY: number,
  cosX: number,
  sinX: number,
) {
  const sinPhi = Math.sin(phi)
  const x0 = sinPhi * Math.cos(theta)
  const y0 = Math.cos(phi)
  const z0 = sinPhi * Math.sin(theta)

  const x1 = x0 * cosY + z0 * sinY
  const z1 = -x0 * sinY + z0 * cosY
  const y1 = y0 * cosX - z1 * sinX
  const z2 = y0 * sinX + z1 * cosX

  const perspective = 2.8
  const scale = perspective / (perspective - z2)

  return {
    x: center + x1 * radius * scale,
    y: center + y1 * radius * scale,
    z: z2,
    scale,
  }
}

function drawGlobe(ctx: CanvasRenderingContext2D) {
  const rotY = rotationY
  const rotX = rotationX
  const cosY = Math.cos(rotY)
  const sinY = Math.sin(rotY)
  const cosX = Math.cos(rotX)
  const sinX = Math.sin(rotX)

  ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0)
  ctx.clearRect(0, 0, canvasSize, canvasSize)
  ctx.lineWidth = 1
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.strokeStyle = WIRE
  ctx.globalAlpha = 0.55
  ctx.beginPath()

  for (let lat = 1; lat < LAT_RINGS; lat++) {
    const phi = (lat / LAT_RINGS) * Math.PI
    let drawing = false

    for (let lon = 0; lon <= LON_SEGMENTS; lon++) {
      const theta = (lon / LON_SEGMENTS) * Math.PI * 2
      const point = rotateAndProject(phi, theta, cosY, sinY, cosX, sinX)

      if (point.z > -0.15) {
        drawing = false
        continue
      }

      if (!drawing) {
        ctx.moveTo(point.x, point.y)
        drawing = true
      } else {
        ctx.lineTo(point.x, point.y)
      }
    }
  }

  for (let lon = 0; lon < LON_SEGMENTS; lon++) {
    const theta = (lon / LON_SEGMENTS) * Math.PI * 2
    let drawing = false

    for (let lat = 0; lat <= LAT_RINGS; lat++) {
      const phi = (lat / LAT_RINGS) * Math.PI
      const point = rotateAndProject(phi, theta, cosY, sinY, cosX, sinX)

      if (point.z > -0.15) {
        drawing = false
        continue
      }

      if (!drawing) {
        ctx.moveTo(point.x, point.y)
        drawing = true
      } else {
        ctx.lineTo(point.x, point.y)
      }
    }
  }

  ctx.stroke()

  ctx.strokeStyle = WIRE_BRIGHT
  ctx.globalAlpha = 1
  ctx.beginPath()

  for (let lat = 1; lat < LAT_RINGS; lat++) {
    const phi = (lat / LAT_RINGS) * Math.PI
    let drawing = false

    for (let lon = 0; lon <= LON_SEGMENTS; lon++) {
      const theta = (lon / LON_SEGMENTS) * Math.PI * 2
      const point = rotateAndProject(phi, theta, cosY, sinY, cosX, sinX)

      if (point.z <= -0.15) {
        drawing = false
        continue
      }

      if (!drawing) {
        ctx.moveTo(point.x, point.y)
        drawing = true
      } else {
        ctx.lineTo(point.x, point.y)
      }
    }
  }

  for (let lon = 0; lon < LON_SEGMENTS; lon++) {
    const theta = (lon / LON_SEGMENTS) * Math.PI * 2
    let drawing = false

    for (let lat = 0; lat <= LAT_RINGS; lat++) {
      const phi = (lat / LAT_RINGS) * Math.PI
      const point = rotateAndProject(phi, theta, cosY, sinY, cosX, sinX)

      if (point.z <= -0.15) {
        drawing = false
        continue
      }

      if (!drawing) {
        ctx.moveTo(point.x, point.y)
        drawing = true
      } else {
        ctx.lineTo(point.x, point.y)
      }
    }
  }

  ctx.stroke()
  ctx.globalAlpha = 1

  const projectedMarkers = markers.map((marker) => {
    const point = rotateAndProject(marker.phi, marker.theta, cosY, sinY, cosX, sinX)
    return {
      ...point,
      kind: marker.kind,
      visible: point.z > -0.2,
    }
  })

  ctx.setLineDash([4, 6])
  ctx.strokeStyle = 'rgba(26, 184, 116, 0.38)'
  ctx.beginPath()

  for (const [from, to] of connections) {
    const a = projectedMarkers[from]
    const b = projectedMarkers[to]
    if (!a?.visible || !b?.visible) continue

    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  }

  ctx.stroke()
  ctx.setLineDash([])

  for (const marker of projectedMarkers) {
    if (!marker.visible) continue

    const color = marker.kind === 'warm' ? '#f59e0b' : MINT
    const glow = marker.kind === 'warm' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(32, 212, 137, 0.45)'
    const dotRadius = 4 * marker.scale

    ctx.beginPath()
    ctx.fillStyle = glow
    ctx.arc(marker.x, marker.y, dotRadius * 2.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(marker.x, marker.y, dotRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  const gradient = ctx.createRadialGradient(center, center, radius * 0.55, center, center, radius * 1.05)
  gradient.addColorStop(0, 'rgba(32, 212, 137, 0.06)')
  gradient.addColorStop(1, 'rgba(32, 212, 137, 0)')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(center, center, radius * 1.05, 0, Math.PI * 2)
  ctx.fill()
}

function paint() {
  syncCanvasSize()

  const canvas = canvasRef.value
  if (!canvas || canvasSize <= 0) return

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  drawGlobe(ctx)
}

function loop() {
  if (!isRunning) return

  rotationY += 0.0035
  paint()
  animationId = window.requestAnimationFrame(loop)
}

function startLoop() {
  if (isRunning) return
  isRunning = true
  animationId = window.requestAnimationFrame(loop)
}

function stopLoop() {
  isRunning = false
  window.cancelAnimationFrame(animationId)
}

function markSizeDirty() {
  sizeDirty = true
  if (prefersReducedMotion) {
    paint()
  }
}

let resizeObserver: ResizeObserver | null = null
let visibilityObserver: IntersectionObserver | null = null
let resizeRaf = 0

onMounted(() => {
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  paint()

  if (!prefersReducedMotion) {
    startLoop()
  }

  resizeObserver = new ResizeObserver(() => {
    window.cancelAnimationFrame(resizeRaf)
    resizeRaf = window.requestAnimationFrame(() => {
      markSizeDirty()
    })
  })

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)

    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (prefersReducedMotion) return

        if (entry?.isIntersecting) {
          startLoop()
        } else {
          stopLoop()
        }
      },
      { rootMargin: '64px' },
    )
    visibilityObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  stopLoop()
  window.cancelAnimationFrame(resizeRaf)
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
})
</script>

<template>
  <div
    ref="containerRef"
    class="hero-globe pointer-events-none relative aspect-square w-full"
  >
    <div class="hero-globe-grid pointer-events-none absolute inset-[-12%] rounded-full opacity-70" />

    <div class="hero-globe-orbit pointer-events-none absolute inset-[8%] rounded-full border border-brand-mint/25" />
    <div class="hero-globe-orbit hero-globe-orbit--slow pointer-events-none absolute inset-[2%] rounded-full border border-dashed border-brand-mint/35" />

    <canvas
      ref="canvasRef"
      class="relative z-10 mx-auto block h-full w-full"
      aria-hidden="true"
    />

    <div
      class="hero-globe-badge hero-globe-badge--top pointer-events-none absolute right-[2%] top-[14%] z-20 hidden items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/85 px-3 py-2 text-xs font-medium text-neutral-600 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md lg:flex"
    >
      <span class="relative flex h-2 w-2">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-mint opacity-40" />
        <span class="relative inline-flex h-2 w-2 rounded-full bg-brand-mint" />
      </span>
      Новые работы в каталоге
    </div>

    <div
      class="hero-globe-badge hero-globe-badge--bottom pointer-events-none absolute bottom-[18%] left-[0%] z-20 hidden items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/85 px-3 py-2 text-xs font-medium text-neutral-600 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md lg:flex"
    >
      <Camera class="h-3.5 w-3.5 text-brand-mint-dark" />
      Фотографы по всей РФ
    </div>

    <div
      class="hero-globe-badge hero-globe-badge--side pointer-events-none absolute right-[0%] top-[52%] z-20 hidden items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/85 px-3 py-2 text-xs font-medium text-neutral-600 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md lg:flex"
    >
      <Heart class="h-3.5 w-3.5 text-amber-500" />
      Избранное у клиентов
    </div>
  </div>
</template>

<style scoped>
.hero-globe-grid {
  background-image:
    linear-gradient(rgba(26, 184, 116, 0.14) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26, 184, 116, 0.14) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(circle at center, black 35%, transparent 72%);
}

.hero-globe-orbit {
  animation: hero-orbit-spin 48s linear infinite;
}

.hero-globe-orbit--slow {
  animation-duration: 72s;
  animation-direction: reverse;
}

.hero-globe-badge {
  animation: hero-badge-float 6s ease-in-out infinite;
}

.hero-globe-badge--bottom {
  animation-delay: -2s;
}

.hero-globe-badge--side {
  animation-delay: -4s;
}

@keyframes hero-orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes hero-badge-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-globe-orbit,
  .hero-globe-badge {
    animation: none;
  }
}
</style>
