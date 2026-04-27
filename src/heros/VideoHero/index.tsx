'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { ScrollLogo } from './ScrollLogo'

export const VideoHero: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/video/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/video/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/20" />

      <ScrollLogo />

      <div className="absolute left-1/2 -translate-x-1/2 z-10 text-center text-white px-6 top-[42vh]">
        <p className="text-[11px] md:text-[11px] font-normal uppercase leading-[13px] tracking-normal max-w-[760px]">
          Creation of unique restaurant concepts worldwide.
          We combine cutting-edge ideas, creativity and expertise to craft spaces,
          where guests can enjoy atmosphere and flavor. Our restaurants are places
          to dine, spaces for interaction and unforgettable experiences.
        </p>
      </div>
    </div>
  )
}
