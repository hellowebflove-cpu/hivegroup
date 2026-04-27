import React from 'react'
import { ScrollLogo } from './ScrollLogo'
import { HeaderThemeMark } from './HeaderThemeMark'
import { getCachedGlobal } from '@/utilities/getGlobals'

const FALLBACK_SUBTITLE = `Creation of unique restaurant concepts worldwide.

We combine cutting-edge ideas, creativity and expertise to craft spaces,
where guests can enjoy atmosphere and flavor. Our restaurants are places
to dine, spaces for interaction and unforgettable experiences.`

const renderSubtitle = (raw: string) => {
  const blocks = raw.split(/\n{2,}/)
  return blocks.map((block, bi) => (
    <React.Fragment key={bi}>
      {block.split('\n').map((line, li, arr) => (
        <React.Fragment key={li}>
          {line}
          {li < arr.length - 1 && <br />}
        </React.Fragment>
      ))}
      {bi < blocks.length - 1 && (
        <>
          <br />
          <br />
        </>
      )}
    </React.Fragment>
  ))
}

export const VideoHero = async () => {
  const home = await getCachedGlobal('home-page', 1)().catch(() => null)
  const subtitle =
    (home as { heroSubtitle?: string } | null)?.heroSubtitle?.trim() || FALLBACK_SUBTITLE

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden">
      <HeaderThemeMark theme="dark" />
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
        <p className="text-[11px] font-normal uppercase leading-[13px] tracking-normal max-w-[760px]">
          {renderSubtitle(subtitle)}
        </p>
      </div>
    </div>
  )
}
