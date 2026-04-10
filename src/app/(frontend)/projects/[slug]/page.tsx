import { getProjects, getProjectBySlug, getMediaUrl } from '@/utilities/getProjects'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SetDarkHeader } from './page.client'

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
  const project = await getProjectBySlug(slug)

  if (!project) return notFound()

  const allProjects = await getProjects()
  const currentIndex = allProjects.findIndex((p) => p.slug === slug)
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length]

  return (
    <article>
      <SetDarkHeader />
      {/* Hero */}
      <div className="relative h-screen w-full overflow-hidden">
        <Image
          src={getMediaUrl(project.preview)}
          alt={project.name}
          fill
          priority
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
      <div className="bg-white px-6 lg:px-[52px] py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Description */}
          <div className="md:col-span-2">
            {project.description && (
              <p className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase text-black max-w-[700px]">
                {project.description}
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-2 text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase text-black md:text-right">
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

        {/* Action buttons */}
        <div className="flex gap-4 mt-8">
          {project.menuPdf && (
            <a
              href={getMediaUrl(project.menuPdf)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-[37px] px-5 border border-black rounded-full text-[15px] font-normal uppercase text-black no-underline hover:bg-black/5 transition-colors duration-200"
            >
              View menu
            </a>
          )}
          {project.instagram && (
            <a
              href={`https://instagram.com/${project.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-[37px] px-5 border border-black rounded-full text-[15px] font-normal uppercase text-black no-underline hover:bg-black/5 transition-colors duration-200"
            >
              Instagram
            </a>
          )}
        </div>
      </div>

      {/* Photo gallery — masonry 3-col grid */}
      {project.gallery && project.gallery.length > 0 && (
        <div className="bg-white px-0">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-[3px]">
            {project.gallery.map((item, i) => (
              <div key={item.id || i} className="mb-[3px] break-inside-avoid">
                <Image
                  src={getMediaUrl(item.image)}
                  alt={item.image.alt || ''}
                  width={800}
                  height={1000}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next project teaser */}
      <Link
        href={`/projects/${nextProject.slug}`}
        className="block relative h-[40vh] overflow-hidden group no-underline"
      >
        <Image
          src={getMediaUrl(nextProject.preview)}
          alt={nextProject.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white">
          <p className="text-[11px] font-normal uppercase tracking-[0.56px] mb-2">Next project</p>
          <Image
            src={getMediaUrl(nextProject.logo)}
            alt={`${nextProject.name} logo`}
            width={160}
            height={80}
            className="object-contain max-h-[60px]"
          />
        </div>
      </Link>
    </article>
  )
}
