'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

type Item = {
  slug: string
  name: string
  type: string
  city: string
  year: number | string
  preview: string
  logo: string
}

export function ProjectsCarousel({ items }: { items: Item[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateButtons()
    el.addEventListener('scroll', updateButtons, { passive: true })
    window.addEventListener('resize', updateButtons)
    return () => {
      el.removeEventListener('scroll', updateButtons)
      window.removeEventListener('resize', updateButtons)
    }
  }, [updateButtons])

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-card]')
    const step = card ? card.getBoundingClientRect().width + 30 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div className="flex items-end justify-between gap-6 px-6 lg:px-[52px] mb-8">
        <h2 className="text-[24px] md:text-[40px] leading-[1] font-normal uppercase text-black tracking-[-0.8px]">
          Discover{' '}
          <Link
            href="/projects"
            className="underline underline-offset-4 decoration-[2px] text-black no-underline-hover hover:opacity-70 transition-opacity"
          >
            all our projects
          </Link>
        </h2>
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Previous projects"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black text-black transition-colors duration-200 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Next projects"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black text-black transition-colors duration-200 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-[30px] overflow-x-auto snap-x snap-mandatory scroll-smooth pl-6 lg:pl-[52px] pr-6 lg:pr-[52px] scroll-pl-6 lg:scroll-pl-[52px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            data-card
            className="relative shrink-0 snap-start aspect-[3/4] rounded-2xl overflow-hidden group no-underline w-[78%] sm:w-[55%] md:w-[40%] lg:w-[calc((100%-90px)/3.4)]"
          >
            <Image
              src={project.preview}
              alt={project.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 78vw, (max-width: 1024px) 40vw, 28vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.15)_45%,transparent_70%)]" />

            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Image
                src={project.logo}
                alt={`${project.name} logo`}
                width={180}
                height={100}
                className="object-contain max-w-[60%] max-h-[80px] md:max-h-[100px] drop-shadow-lg"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
              <p className="text-[11px] leading-[14px] font-normal uppercase text-white/80 text-center">
                {project.type} &middot; {project.city} &middot; {project.year}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
