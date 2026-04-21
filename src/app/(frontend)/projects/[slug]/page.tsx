import { getProjects, getProjectBySlug, getMediaUrl } from '@/utilities/getProjects'
import { notFound } from 'next/navigation'
import Image from 'next/image'
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

  return (
    <article>
      <SetDarkHeader />
      {/* Hero + Info bar fit viewport */}
      <div className="flex flex-col h-screen">
        {/* Hero */}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden">
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
      <div className="bg-white px-5 lg:px-[44px] py-7 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Description */}
          <div className="md:col-span-2">
            {project.description && (
              <p className="text-[11px] md:text-[13px] leading-[1.2] font-normal uppercase text-black max-w-[640px]">
                {project.description}
              </p>
            )}
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

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          {project.menuPdf && (
            <a
              href={getMediaUrl(project.menuPdf)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-[32px] px-4 border border-black rounded-full text-[12px] font-normal uppercase text-black no-underline hover:bg-black/5 transition-colors duration-200"
            >
              View menu
            </a>
          )}
          {project.instagram && (
            <a
              href={`https://instagram.com/${project.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-[32px] px-4 border border-black rounded-full text-[12px] font-normal uppercase text-black no-underline hover:bg-black/5 transition-colors duration-200"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
      </div>

      {/* Photo gallery — balanced masonry (shortest-column) */}
      {project.gallery && project.gallery.length > 0 && (() => {
        type GalleryItem = NonNullable<typeof project.gallery>[number]
        const gallery = project.gallery
        const distribute = (count: number): GalleryItem[][] => {
          const cols = Array.from({ length: count }, () => ({ h: 0, items: [] as GalleryItem[], idx: [] as number[] }))
          // LPT scheduling — sort by aspect desc for balance, restore order within each column.
          const indexed = gallery.map((item, i) => ({ item, i, asp: (item.image.height || 1) / (item.image.width || 1) }))
          indexed.sort((a, b) => b.asp - a.asp)
          for (const { item, i, asp } of indexed) {
            const target = cols.reduce((a, b) => (a.h <= b.h ? a : b))
            target.items.push(item)
            target.idx.push(i)
            target.h += asp
          }
          return cols.map((c) => {
            const paired = c.items.map((it, k) => ({ it, i: c.idx[k] }))
            paired.sort((a, b) => a.i - b.i)
            return paired.map((p) => p.it)
          })
        }
        const cols3 = distribute(3)
        const cols2 = distribute(2)
        const renderItem = (item: GalleryItem, key: string, sizes: string) => (
          <div key={key} className="overflow-hidden">
            <Image
              src={getMediaUrl(item.image)}
              alt={item.image.alt || ''}
              width={item.image.width || 800}
              height={item.image.height || 1000}
              className="w-full h-auto object-cover block"
              sizes={sizes}
            />
          </div>
        )
        return (
          <div className="bg-white px-0">
            {/* lg: 3 balanced columns */}
            <div className="hidden lg:flex gap-[3px] items-start">
              {cols3.map((col, ci) => (
                <div key={ci} className="flex-1 flex flex-col gap-[3px]">
                  {col.map((item, i) => renderItem(item, `lg-${ci}-${i}`, '33vw'))}
                </div>
              ))}
            </div>
            {/* md: 2 balanced columns */}
            <div className="hidden md:flex lg:hidden gap-[3px] items-start">
              {cols2.map((col, ci) => (
                <div key={ci} className="flex-1 flex flex-col gap-[3px]">
                  {col.map((item, i) => renderItem(item, `md-${ci}-${i}`, '50vw'))}
                </div>
              ))}
            </div>
            {/* mobile: 1 column in order */}
            <div className="flex md:hidden flex-col gap-[3px]">
              {project.gallery.map((item, i) => renderItem(item, `sm-${i}`, '100vw'))}
            </div>
          </div>
        )
      })()}
    </article>
  )
}
