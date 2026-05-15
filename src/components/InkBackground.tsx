'use client'

import { motion, useMotionValue, useMotionTemplate, useTransform, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

interface InkDropData {
  x: number
  y: number
  size: number
  delay: number
  duration: number
  opacity: number
  id: number
}

function InkDrop({ d, mouseX, mouseY, windowSize }: {
  d: InkDropData
  mouseX: ReturnType<typeof useMotionValue<number>>
  mouseY: ReturnType<typeof useMotionValue<number>>
  windowSize: { w: number; h: number }
}) {
  const dropX = (d.x / 100) * windowSize.w
  const dropY = (d.y / 100) * windowSize.h

  const dx = useTransform(mouseX, (mx: number) => {
    const diff = mx - dropX
    return Math.abs(diff) < 200 ? -diff * 0.06 : 0
  })
  const dy = useTransform(mouseY, (my: number) => {
    const diff = my - dropY
    return Math.abs(diff) < 200 ? -diff * 0.06 : 0
  })
  const smoothDx = useSpring(dx, { stiffness: 40, damping: 30 })
  const smoothDy = useSpring(dy, { stiffness: 40, damping: 30 })

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${d.x}%`,
        top: `${d.y}%`,
        width: d.size,
        height: d.size,
        background: `radial-gradient(circle, rgba(10,8,5,${d.opacity}) 0%, transparent 70%)`,
        x: smoothDx,
        y: smoothDy,
      }}
      animate={{ scale: [1, 1.1, 0.93, 1.05, 1] }}
      transition={{
        duration: d.duration,
        repeat: Infinity,
        delay: d.delay,
        ease: [0.45, 0, 0.55, 1],
      }}
    />
  )
}

export default function InkBackground() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [drops, setDrops] = useState<InkDropData[]>([])
  const [splatters, setSplatters] = useState<
    Array<{ x: number; y: number; size: number; rotation: number }>
  >([])
  const [windowSize, setWindowSize] = useState({ w: 1, h: 1 })

  useEffect(() => {
    const newDrops: InkDropData[] = []
    for (let i = 0; i < 6; i++) {
      newDrops.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 350 + 200,
        delay: Math.random() * 6,
        duration: 18 + Math.random() * 10,
        opacity: 0.014 + Math.random() * 0.018,
        id: i,
      })
    }
    setDrops(newDrops)

    const newSplatters = Array.from({ length: 8 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      rotation: Math.random() * 360,
    }))
    setSplatters(newSplatters)

    setWindowSize({ w: window.innerWidth, h: window.innerHeight })

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [mouseX, mouseY])

  const mouseFollowX = useMotionTemplate`${mouseX}px`
  const mouseFollowY = useMotionTemplate`${mouseY}px`

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {drops.map((d) => (
        <InkDrop key={d.id} d={d} mouseX={mouseX} mouseY={mouseY} windowSize={windowSize} />
      ))}

      {splatters.map((s, i) => (
        <motion.div
          key={`splat-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: `rgba(10,8,5,${0.04 + Math.random() * 0.05})`,
            transform: `rotate(${s.rotation}deg)`,
          }}
          animate={{ opacity: [0.3, 0.75, 0.3] }}
          transition={{
            duration: 8 + i * 0.5,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
            delay: i * 0.4,
          }}
        />
      ))}

      {[20, 40, 60, 80].map((xPos, i) => (
        <motion.div
          key={`vline-${i}`}
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: `${xPos}%`,
            background:
              'linear-gradient(180deg, transparent 5%, rgba(10,8,5,0.025) 20%, rgba(10,8,5,0.04) 50%, rgba(10,8,5,0.025) 80%, transparent 95%)',
          }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{
            duration: 14,
            delay: i * 2.5,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        />
      ))}

      {[25, 50, 75].map((yPos, i) => (
        <motion.div
          key={`hline-${i}`}
          className="absolute left-0 right-0 h-px"
          style={{
            top: `${yPos}%`,
            background:
              'linear-gradient(90deg, transparent 5%, rgba(10,8,5,0.015) 25%, rgba(10,8,5,0.025) 50%, rgba(10,8,5,0.015) 75%, transparent 95%)',
          }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{
            duration: 16,
            delay: i * 3,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        />
      ))}

      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full"
        style={{
          x: mouseFollowX,
          y: mouseFollowY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(10,8,5,0.015) 0%, transparent 55%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(200,185,155,0.08) 100%)',
        }}
      />
    </div>
  )
}
