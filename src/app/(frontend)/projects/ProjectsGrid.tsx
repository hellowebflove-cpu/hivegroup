'use client'
import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface GridProject {
  slug: string
  name: string
  type: string
  city: string
  country: string
  year: number
  preview: string
  logo: string
}

type FilterKey = 'all' | string

export const ProjectsGrid: React.FC<{ projects: GridProject[] }> = ({ projects }) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const types = useMemo(() => [...new Set(projects.map((p) => p.type))], [projects])
  const cities = useMemo(() => [...new Set(projects.map((p) => p.city))], [projects])

  const filters: { label: string; value: FilterKey }[] = [
    { label: 'All', value: 'all' },
    ...types.map((t) => ({ label: t, value: `type:${t}` })),
    ...cities.map((c) => ({ label: c, value: `city:${c}` })),
  ]

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return projects
    const [key, val] = activeFilter.split(':')
    return projects.filter((p) => {
      if (key === 'type') return p.type === val
      if (key === 'city') return p.city === val
      return true
    })
  }, [activeFilter, projects])

  return (
    <>
      {/* Filters */}
      <div className="px-6 lg:px-[52px] pb-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`inline-flex items-center justify-center h-[34px] px-5 border rounded-full text-[13px] md:text-[15px] font-normal uppercase transition-colors duration-200 ${
              activeFilter === f.value
                ? 'bg-black text-white border-black'
                : 'bg-transparent text-black border-black/20 hover:border-black'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="px-6 lg:px-[52px] pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
          {filtered.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden group no-underline"
            >
              <Image
                src={project.preview}
                alt={project.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

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

        {/* Empty state */}
        {filtered.length === 0 && (
          <p className="text-[15px] font-normal uppercase text-black/40 text-center py-20">
            No projects found for this filter
          </p>
        )}
      </div>
    </>
  )
}
