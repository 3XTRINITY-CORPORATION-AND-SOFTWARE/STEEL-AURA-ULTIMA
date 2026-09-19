import { useEffect, useRef } from 'react'
import { BIN_COUNT, tickSimBins } from '../lib/simBins'

/* Interior bible — Ultima: magenta wash + VU green meters + cyan edges */
const VOID = '#050508'
const VU_GREEN = '#39ff14'
const VU_SOFT = '#00ff88'
const NEON_CYAN = '#00e5ff'

export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const binsRef = useRef<Float32Array>(new Float32Array(BIN_COUNT).fill(0.12))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const start = performance.now()

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = Math.max(parent.clientHeight, 260)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const draw = (now: number) => {
      if (!running) return
      const tSec = (now - start) / 1000
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      binsRef.current = tickSimBins(binsRef.current, tSec)
      const bins = binsRef.current

      // void + magenta underglow wash + cyan edge bloom (aurora curtain)
      ctx.fillStyle = VOID
      ctx.fillRect(0, 0, w, h)
      const gMagenta = ctx.createRadialGradient(w * 0.5, h * 1.05, 0, w * 0.5, h * 0.85, h * 0.85)
      gMagenta.addColorStop(0, 'rgba(255,43,214,0.32)')
      gMagenta.addColorStop(1, 'transparent')
      ctx.fillStyle = gMagenta
      ctx.fillRect(0, 0, w, h)
      const gCyan = ctx.createRadialGradient(w * 0.78, h * 0.12, 0, w * 0.78, h * 0.28, h * 0.6)
      gCyan.addColorStop(0, 'rgba(0,229,255,0.18)')
      gCyan.addColorStop(1, 'transparent')
      ctx.fillStyle = gCyan
      ctx.fillRect(0, 0, w, h)
      const gVu = ctx.createRadialGradient(w * 0.22, h * 0.18, 0, w * 0.22, h * 0.35, h * 0.55)
      gVu.addColorStop(0, 'rgba(0,255,136,0.12)')
      gVu.addColorStop(1, 'transparent')
      ctx.fillStyle = gVu
      ctx.fillRect(0, 0, w, h)

      // aurora curtain ribbons (cyan + magenta)
      ctx.beginPath()
      for (let x = 0; x <= w; x += 4) {
        const n = Math.sin(x * 0.01 + tSec * 0.9) * 18 + Math.sin(x * 0.023 + tSec * 1.4) * 10
        const y = h * 0.26 + n
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(0,229,255,0.55)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      for (let x = 0; x <= w; x += 4) {
        const n = Math.sin(x * 0.012 + tSec * 1.1 + 1.2) * 22 + Math.sin(x * 0.03 + tSec) * 8
        const y = h * 0.32 + n
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(255,43,214,0.55)'
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.beginPath()
      for (let x = 0; x <= w; x += 4) {
        const n = Math.sin(x * 0.008 + tSec * 0.7 + 0.4) * 14
        const y = h * 0.38 + n
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(58,160,255,0.35)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // VU-style frequency bars (SIM — green meters per interior bible)
      const pad = 16
      const barAreaH = h * 0.42
      const baseY = h - pad
      const gap = 2
      const barW = Math.max(2, (w - pad * 2) / BIN_COUNT - gap)
      for (let i = 0; i < BIN_COUNT; i++) {
        const v = bins[i]
        const bh = v * barAreaH
        const x = pad + i * (barW + gap)
        const grad = ctx.createLinearGradient(0, baseY - bh, 0, baseY)
        grad.addColorStop(0, VU_GREEN)
        grad.addColorStop(0.35, VU_SOFT)
        grad.addColorStop(0.75, NEON_CYAN)
        grad.addColorStop(1, 'rgba(255,43,214,0.12)')
        ctx.fillStyle = grad
        ctx.fillRect(x, baseY - bh, barW, bh)
      }

      // faint radar grid
      ctx.strokeStyle = 'rgba(58,160,255,0.05)'
      ctx.lineWidth = 1
      for (let gx = 0; gx < w; gx += 48) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, h)
        ctx.stroke()
      }
      for (let gy = 0; gy < h; gy += 48) {
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(w, gy)
        ctx.stroke()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="glass stage-wrap">
      <div className="stage-label">
        <span className="chip">STAGE</span>
        <span className="chip sim">SIM bins</span>
        <span className="chip mock">MOCK viz</span>
        <span className="chip vu">VU green</span>
        <span className="chip magenta">magenta wash</span>
      </div>
      <canvas ref={canvasRef} aria-label="Aurora stage canvas with simulated VU frequency bins" />
    </div>
  )
}
