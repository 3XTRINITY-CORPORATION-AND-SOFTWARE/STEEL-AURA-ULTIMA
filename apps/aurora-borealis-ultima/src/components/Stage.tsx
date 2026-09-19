import { useEffect, useRef } from 'react'
import { BIN_COUNT, tickSimBins } from '../lib/simBins'

const VOID = '#050505'
const VIOLET = '#A855F7'
const CYAN = '#22d3ee'

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

      // void + aurora wash
      ctx.fillStyle = VOID
      ctx.fillRect(0, 0, w, h)
      const g1 = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.35, h * 0.7)
      g1.addColorStop(0, 'rgba(168,85,247,0.28)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)
      const g2 = ctx.createRadialGradient(w * 0.75, h * 0.15, 0, w * 0.75, h * 0.3, h * 0.65)
      g2.addColorStop(0, 'rgba(34,211,238,0.2)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      // aurora ribbon
      ctx.beginPath()
      for (let x = 0; x <= w; x += 4) {
        const n = Math.sin(x * 0.01 + tSec * 0.9) * 18 + Math.sin(x * 0.023 + tSec * 1.4) * 10
        const y = h * 0.28 + n
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(34,211,238,0.55)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      for (let x = 0; x <= w; x += 4) {
        const n = Math.sin(x * 0.012 + tSec * 1.1 + 1.2) * 22 + Math.sin(x * 0.03 + tSec) * 8
        const y = h * 0.34 + n
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(168,85,247,0.5)'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // frequency bars (SIM)
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
        grad.addColorStop(0, CYAN)
        grad.addColorStop(0.45, VIOLET)
        grad.addColorStop(1, 'rgba(168,85,247,0.15)')
        ctx.fillStyle = grad
        ctx.fillRect(x, baseY - bh, barW, bh)
      }

      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
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
      </div>
      <canvas ref={canvasRef} aria-label="Aurora stage canvas with simulated frequency bins" />
    </div>
  )
}
