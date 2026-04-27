'use client'
import React, { useEffect, useRef, useState } from 'react'

const SCROLL_RANGE = 150
const FINAL_SCALE = 0.45
const INITIAL_TOP_VH = 0.295
const FINAL_TOP_PX = 12

export const ScrollLogo: React.FC = () => {
  const [progress, setProgress] = useState(0)
  const [viewportH, setViewportH] = useState<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const update = () => {
      const p = Math.min(Math.max(window.scrollY / SCROLL_RANGE, 0), 1)
      setProgress(p)
      setViewportH(window.innerHeight)
      rafRef.current = null
    }
    const onScroll = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (viewportH == null) return null

  const scale = 1 - (1 - FINAL_SCALE) * progress
  const initialTopPx = viewportH * INITIAL_TOP_VH
  const top = initialTopPx + (FINAL_TOP_PX - initialTopPx) * progress

  return (
    <div
      className="fixed left-1/2 z-40 pointer-events-none text-white select-none"
      style={{
        top: `${top}px`,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: 'center top',
        willChange: 'transform, top',
      }}
    >
      <h1 className="m-0 leading-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/hive-group.png"
          alt="Hive Group"
          width={878}
          height={127}
          className="block w-[280px] md:w-[491px] h-auto"
        />
      </h1>
    </div>
  )
}
