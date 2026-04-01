'use client'

import { useEffect, useRef } from 'react'

// --- Tuning constants ---
const PARTICLE_COUNT  = 80
const HARD_ZONE       = 72    // px — absolute no-touch radius around cursor
const INFLUENCE_ZONE  = 200   // px — outer radius where orbital forces act
const REPULSION_K     = 6     // radial push strength inside HARD_ZONE
const ORBITAL_K       = 1.4   // tangential sideways force (creates orbiting)
const DAMPING         = 0.96  // velocity damping per frame
const WANDER_STRENGTH = 0.012 // random nudge for far-away particles
const MIN_SPEED       = 0.15
const MAX_SPEED       = 0.35

// Brand-aligned colors: 60% primary blue, 25% accent blue, 15% muted
const COLORS = [
  'oklch(0.62 0.17 240)',
  'oklch(0.62 0.17 240)',
  'oklch(0.62 0.17 240)',
  'oklch(0.70 0.14 240)',
  'oklch(0.70 0.14 240)',
  'oklch(0.72 0.04 240)',
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  angle: number       // visual rotation angle of the dash stroke
  length: number
  opacity: number
  color: string
  orbitDir: 1 | -1   // +1 = counterclockwise, -1 = clockwise
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function createParticle(width: number, height: number): Particle {
  const speed = randomBetween(MIN_SPEED, MAX_SPEED)
  const dir   = randomBetween(0, Math.PI * 2)
  return {
    x:        randomBetween(0, width),
    y:        randomBetween(0, height),
    vx:       Math.cos(dir) * speed,
    vy:       Math.sin(dir) * speed,
    angle:    randomBetween(-Math.PI / 3, Math.PI / 3),
    length:   randomBetween(6, 9),
    opacity:  randomBetween(0.25, 0.45),
    color:    COLORS[Math.floor(Math.random() * COLORS.length)],
    orbitDir: Math.random() < 0.5 ? 1 : -1,
  }
}

export function ParticleField() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const mouseRef    = useRef({ x: -9999, y: -9999 })
  const particlesRef = useRef<Particle[]>([])
  const frameRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setSize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height)
    )

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onResize = () => setSize()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize',    onResize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const p of particlesRef.current) {

        // Vector from cursor to particle
        const dx   = p.x - mx
        const dy   = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < INFLUENCE_ZONE && dist > 0) {
          // Normalized radial direction (away from cursor)
          const nx = dx / dist
          const ny = dy / dist

          // Tangential direction — perpendicular to radial, sign = orbitDir
          // orbitDir 1  → counterclockwise  (-ny,  nx)
          // orbitDir -1 → clockwise          ( ny, -nx)
          const tx = -ny * p.orbitDir
          const ty =  nx * p.orbitDir

          // Orbital tangential force — scales with how deep inside INFLUENCE_ZONE
          const influence = 1 - dist / INFLUENCE_ZONE
          p.vx += tx * ORBITAL_K * influence
          p.vy += ty * ORBITAL_K * influence

          // Radial repulsion — only kicks in hard inside HARD_ZONE
          if (dist < HARD_ZONE) {
            const repel = REPULSION_K * (HARD_ZONE - dist) / HARD_ZONE
            p.vx += nx * repel
            p.vy += ny * repel
          }

        } else {
          // Far from cursor — gentle random wander keeps field alive
          p.vx += (Math.random() - 0.5) * WANDER_STRENGTH
          p.vy += (Math.random() - 0.5) * WANDER_STRENGTH
        }

        // Damping
        p.vx *= DAMPING
        p.vy *= DAMPING

        // Move
        p.x += p.vx
        p.y += p.vy

        // Seamless screen wrap
        if (p.x < 0)             p.x = canvas.width
        if (p.x > canvas.width)  p.x = 0
        if (p.y < 0)             p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Tilt stroke slightly toward velocity direction for momentum feel
        if (Math.abs(p.vx) > 0.05 || Math.abs(p.vy) > 0.05) {
          p.angle += (Math.atan2(p.vy, p.vx) - p.angle) * 0.08
        }

        // Draw stroke
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle + Math.PI / 2)
        ctx.beginPath()
        ctx.moveTo(0, -p.length / 2)
        ctx.lineTo(0,  p.length / 2)
        ctx.strokeStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.lineWidth   = 1.5
        ctx.lineCap     = 'round'
        ctx.stroke()
        ctx.restore()
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize',    onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
