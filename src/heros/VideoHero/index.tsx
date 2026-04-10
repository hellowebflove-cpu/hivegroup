'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

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

      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-6">
        <h1 className="text-[28px] md:text-[46px] font-normal uppercase leading-[1] tracking-normal mb-6">
          HIVE GROUP<sup className="text-[12px] md:text-[16px] align-super ml-1">&reg;</sup>
        </h1>
        <p className="text-[13px] md:text-[15px] font-normal uppercase leading-[1.18] tracking-normal max-w-[600px]">
          Creation of unique restaurant concepts worldwide.
          We combine cutting-edge ideas, creativity and expertise to craft spaces,
          where guests can enjoy atmosphere and flavor. Our restaurants are places
          to dine, spaces for interaction and unforgettable experiences.
        </p>
      </div>
    </div>
  )
}
