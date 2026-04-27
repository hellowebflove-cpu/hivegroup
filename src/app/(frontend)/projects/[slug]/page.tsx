import { getProjects, getProjectBySlug, getMediaUrl, getMediaSizeUrl } from '@/utilities/getProjects'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SetDarkHeader } from './page.client'
import { ProjectGallery } from './ProjectGallery'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}
  return {
    title: `${project.name} — HIVE GROUP`,
    description: project.description || undefined,
  }
}

export default async function ProjectPage({ params }: Args) {
  const { slug } = await params
  const [project, allProjects] = await Promise.all([getProjectBySlug(slug), getProjects()])

  if (!project) return notFound()

  const idx = allProjects.findIndex((p) => p.slug === slug)
  const prev = idx > 0 ? allProjects[idx - 1] : allProjects[allProjects.length - 1]
  const next = idx >= 0 && idx < allProjects.length - 1 ? allProjects[idx + 1] : allProjects[0]

  const LOGO_SCALE: Record<string, number> = {
    bunch: 1.6,
  }
  const logoMaxH = (s: string) => Math.round(40 * (LOGO_SCALE[s] ?? 1))

  const BLUR_DATA =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIi8+PC9zdmc+'

  return (
    <article>
      <SetDarkHeader />
      {/* Hero + Info bar fit viewport */}
      <div className="flex flex-col h-screen">
        {/* Hero */}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-neutral-200">
          <Image
            src={getMediaSizeUrl(project.preview, 'xlarge', ['large'])}
            alt={project.name}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA}
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Project logo centered */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Image
              src={getMediaUrl(project.logo)}
              alt={`${project.name} logo`}
              width={220}
              height={120}
              className="object-contain max-w-[70%] max-h-[120px] drop-shadow-lg"
            />
          </div>
        </div>

      {/* Info bar */}
      <div className="bg-white px-5 lg:px-[44px] py-5 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Description */}
          <div className="md:col-span-2">
            {project.description && (
              <p className="text-[11px] md:text-[12px] leading-[1.25] font-normal uppercase text-black max-w-[820px]">
                {project.description}
              </p>
            )}
            {/* Action buttons */}
            <div className="flex gap-2 mt-2">
              {project.menuUrl && (
                <a
                  href={project.menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-[26px] px-3 border border-black rounded-full text-[11px] font-normal uppercase text-black no-underline hover:bg-black/5 transition-colors duration-200"
                >
                  View menu
                </a>
              )}
              {project.instagram && (
                <a
                  href={`https://instagram.com/${project.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-[26px] px-3 border border-black rounded-full text-[11px] font-normal uppercase text-black no-underline hover:bg-black/5 transition-colors duration-200"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1.5 text-[11px] md:text-[13px] leading-[1.2] font-normal uppercase text-black md:text-right">
            <p>{project.city}, {project.country}</p>
            <p>{project.year}</p>
            {project.instagram && (
              <a
                href={`https://instagram.com/${project.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 decoration-1 hover:opacity-70 transition-opacity duration-200"
              >
                @{project.instagram}
              </a>
            )}
          </div>
        </div>
      </div>
      </div>

      {project.gallery && project.gallery.length > 0 && (
        <ProjectGallery
          items={project.gallery.map((g) => ({
            url: getMediaSizeUrl(g.image, 'large', ['medium']),
            fullUrl: getMediaSizeUrl(g.image, 'xlarge', ['large']),
            alt: g.image.alt || '',
          }))}
        />
      )}

      {allProjects.length > 1 && (prev || next) && (
        <nav
          aria-label="Project navigation"
          className="bg-white border-t border-black/10 px-6 lg:px-[52px] py-8 lg:py-10"
        >
          <div className="grid grid-cols-2 gap-6 items-center">
            {prev ? (
              <Link
                href={`/projects/${prev.slug}`}
                className="group flex items-center gap-4 no-underline text-black"
              >
                <span className="text-[11px] leading-[14px] font-normal uppercase text-black/60 group-hover:text-black transition-colors">
                  ← Previous
                </span>
                <Image
                  src={getMediaUrl(prev.logo)}
                  alt={prev.name}
                  width={160}
                  height={64}
                  style={{ maxHeight: logoMaxH(prev.slug) }}
                  className="object-contain w-auto [filter:brightness(0)] opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/projects/${next.slug}`}
                className="group flex items-center justify-end gap-4 no-underline text-black"
              >
                <Image
                  src={getMediaUrl(next.logo)}
                  alt={next.name}
                  width={160}
                  height={64}
                  style={{ maxHeight: logoMaxH(next.slug) }}
                  className="object-contain w-auto [filter:brightness(0)] opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <span className="text-[11px] leading-[14px] font-normal uppercase text-black/60 group-hover:text-black transition-colors">
                  Next →
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>
      )}
    </article>
  )
}
