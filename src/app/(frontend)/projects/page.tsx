import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectsGrid } from './ProjectsGrid'
import { getProjects, getMediaUrl } from '@/utilities/getProjects'

export const metadata: Metadata = {
  title: 'Projects — HIVE GROUP',
  description: 'All restaurant concepts by HIVE GROUP',
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  const items = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    type: p.type,
    city: p.city,
    country: p.country,
    year: p.year,
    preview: getMediaUrl(p.preview),
    logo: getMediaUrl(p.logo),
  }))

  return (
    <article className="bg-white min-h-screen">
      {/* Spacer for fixed header */}
      <div className="h-14" />

      <div className="px-6 lg:px-[52px] pt-10 pb-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] leading-[14px] font-normal uppercase text-black/50 mb-8">
          <Link href="/" className="hover:text-black transition-colors duration-200 no-underline">
            Home
          </Link>
          <span>/</span>
          <span className="text-black">Projects</span>
        </nav>

        {/* Title */}
        <h1 className="text-[28px] md:text-[46px] leading-[1] font-normal uppercase text-black tracking-normal mb-4">
          Our projects
        </h1>

        {/* Description */}
        <p className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase text-[#282828] max-w-[700px] mb-10">
          We create unique restaurant concepts worldwide — from cozy cafes to bar networks.
          Each project reflects our passion for quality, atmosphere and unforgettable guest experiences.
        </p>
      </div>

      <ProjectsGrid projects={items} />
    </article>
  )
}
