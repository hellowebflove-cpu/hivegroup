'use client'
import React, { useRef } from 'react'
import Image from 'next/image'

interface CarouselProject {
  slug: string
  name: string
  type: string
  city: string
  year: number
  preview: string
  logo: string
}

export const ProjectsCarousel: React.FC<{ projects: CarouselProject[] }> = ({ projects }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const card = scrollRef.current.querySelector('[data-card]') as HTMLElement
    if (!card) return
    const amount = card.offsetWidth + 30
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      {/* Header */}
      <div className="px-6 lg:px-[52px] mb-8 flex items-center justify-between">
        <h2 className="text-[24px] md:text-[40px] leading-[1] font-normal uppercase text-black tracking-[-0.8px]">
          Discover{' '}
          <span className="underline underline-offset-4 decoration-[2px]">all our projects</span>
        </h2>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            className="p-2 hover:opacity-50 transition-opacity duration-200"
            aria-label="Previous"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor">
              <path d="M2.996 2.492C3.799 1.783 4.499 0.952 5.096 0H5.432C5.152 1.456 4.489 2.921 3.444 4.396H4.984H17.188V5.096H4.984H3.416C4.48 6.608 5.152 8.083 5.432 9.52H5.096C4.499 8.568 3.799 7.737 2.996 7.028C2.193 6.319 1.195 5.619 0 4.928V4.592C1.195 3.901 2.193 3.201 2.996 2.492Z" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 hover:opacity-50 transition-opacity duration-200"
            aria-label="Next"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor">
              <path d="M15.004 2.492C14.201 1.783 13.501 0.952 12.904 0H12.568C12.848 1.456 13.511 2.921 14.556 4.396H13.016H0.812V5.096H13.016H14.584C13.52 6.608 12.848 8.083 12.568 9.52H12.904C13.501 8.568 14.201 7.737 15.004 7.028C15.807 6.319 16.805 5.619 18 4.928V4.592C16.805 3.901 15.807 3.201 15.004 2.492Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cards carousel */}
      <div
        ref={scrollRef}
        className="flex gap-[30px] overflow-x-auto px-6 lg:px-[52px] pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {projects.map((project) => (
          <a
            key={project.slug}
            href={`/projects/${project.slug}`}
            data-card
            className="relative flex-shrink-0 w-[85vw] md:w-[calc(33.333%-20px)] aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer no-underline"
          >
            {/* Background image */}
            <Image
              src={project.preview}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 85vw, 33vw"
            />

            {/* Subtle gradient for logo contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Project logo centered */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Image
                src={project.logo}
                alt={`${project.name} logo`}
                width={180}
                height={100}
                className="object-contain max-w-[60%] max-h-[80px] md:max-h-[100px] drop-shadow-lg"
              />
            </div>

            {/* Info at bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
              <p className="text-[11px] leading-[14px] font-normal uppercase text-white/80 text-center">
                {project.type} &middot; {project.city} &middot; {project.year}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
