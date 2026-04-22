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
          {(project.menuUrl || project.menuPdf) && (
            <a
              href={project.menuUrl || getMediaUrl(project.menuPdf)}
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

      {/* Photo gallery — adaptive layout per count, fixed aspect tiles for clean rows */}
      {project.gallery && project.gallery.length > 0 && (() => {
        type GalleryItem = NonNullable<typeof project.gallery>[number]
        const gallery = project.gallery
        const count = gallery.length

        const Tile = ({ item, sizes, aspect }: { item: GalleryItem; sizes: string; aspect: string }) => (
          <div className={`relative overflow-hidden ${aspect}`}>
            <Image
              src={getMediaUrl(item.image)}
              alt={item.image.alt || ''}
              fill
              className="object-cover"
              sizes={sizes}
            />
          </div>
        )

        const RowEl = ({ children }: { children: React.ReactNode }) => (
          <div className="grid gap-[3px]" style={{ gridAutoFlow: 'column', gridAutoColumns: '1fr' }}>{children}</div>
        )

        // Build rows of tiles (each row = array of items + per-row sizes/aspect)
        type RowDef = { items: GalleryItem[]; aspect: string; sizes: string }
        const desktopRows: RowDef[] = (() => {
          const A_FULL = 'aspect-[16/9]'
          const A_HALF = 'aspect-[4/5]'
          const A_THIRD = 'aspect-[4/5]'
          const S_FULL = '100vw'
          const S_HALF = '50vw'
          const S_THIRD = '33vw'
          const rows: RowDef[] = []
          if (count === 1) {
            rows.push({ items: [gallery[0]], aspect: A_FULL, sizes: S_FULL })
          } else if (count === 2) {
            rows.push({ items: gallery.slice(0, 2), aspect: A_HALF, sizes: S_HALF })
          } else if (count === 3) {
            rows.push({ items: gallery.slice(0, 2), aspect: A_HALF, sizes: S_HALF })
            rows.push({ items: [gallery[2]], aspect: A_FULL, sizes: S_FULL })
          } else if (count === 4) {
            rows.push({ items: gallery.slice(0, 2), aspect: A_HALF, sizes: S_HALF })
            rows.push({ items: gallery.slice(2, 4), aspect: A_HALF, sizes: S_HALF })
          } else if (count === 5) {
            rows.push({ items: gallery.slice(0, 2), aspect: A_HALF, sizes: S_HALF })
            rows.push({ items: gallery.slice(2, 5), aspect: A_THIRD, sizes: S_THIRD })
          } else if (count === 6) {
            rows.push({ items: gallery.slice(0, 3), aspect: A_THIRD, sizes: S_THIRD })
            rows.push({ items: gallery.slice(3, 6), aspect: A_THIRD, sizes: S_THIRD })
          } else if (count === 7) {
            rows.push({ items: gallery.slice(0, 2), aspect: A_HALF, sizes: S_HALF })
            rows.push({ items: gallery.slice(2, 5), aspect: A_THIRD, sizes: S_THIRD })
            rows.push({ items: gallery.slice(5, 7), aspect: A_HALF, sizes: S_HALF })
          } else if (count === 8) {
            rows.push({ items: gallery.slice(0, 3), aspect: A_THIRD, sizes: S_THIRD })
            rows.push({ items: gallery.slice(3, 5), aspect: A_HALF, sizes: S_HALF })
            rows.push({ items: gallery.slice(5, 8), aspect: A_THIRD, sizes: S_THIRD })
          } else {
            // 9+: chunk into rows of 3, with the last row balanced (1/2/3 wide)
            let i = 0
            while (i < count) {
              const remaining = count - i
              if (remaining >= 3) {
                rows.push({ items: gallery.slice(i, i + 3), aspect: A_THIRD, sizes: S_THIRD })
                i += 3
              } else if (remaining === 2) {
                rows.push({ items: gallery.slice(i, i + 2), aspect: A_HALF, sizes: S_HALF })
                i += 2
              } else {
                rows.push({ items: [gallery[i]], aspect: A_FULL, sizes: S_FULL })
                i += 1
              }
            }
          }
          return rows
        })()

        const tabletRows: RowDef[] = (() => {
          // 2-column rhythm with full-width fallback for stragglers
          const A_FULL = 'aspect-[16/9]'
          const A_HALF = 'aspect-[4/5]'
          const rows: RowDef[] = []
          let i = 0
          while (i < count) {
            const remaining = count - i
            if (remaining >= 2) {
              rows.push({ items: gallery.slice(i, i + 2), aspect: A_HALF, sizes: '50vw' })
              i += 2
            } else {
              rows.push({ items: [gallery[i]], aspect: A_FULL, sizes: '100vw' })
              i += 1
            }
          }
          return rows
        })()

        return (
          <div className="bg-white px-0">
            {/* desktop (lg+) */}
            <div className="hidden lg:flex flex-col gap-[3px]">
              {desktopRows.map((row, ri) => (
                <RowEl key={`lg-${ri}`}>
                  {row.items.map((item, i) => (
                    <Tile key={`lg-${ri}-${i}`} item={item} sizes={row.sizes} aspect={row.aspect} />
                  ))}
                </RowEl>
              ))}
            </div>
            {/* tablet (md) */}
            <div className="hidden md:flex lg:hidden flex-col gap-[3px]">
              {tabletRows.map((row, ri) => (
                <RowEl key={`md-${ri}`}>
                  {row.items.map((item, i) => (
                    <Tile key={`md-${ri}-${i}`} item={item} sizes={row.sizes} aspect={row.aspect} />
                  ))}
                </RowEl>
              ))}
            </div>
            {/* mobile: single column, taller aspect */}
            <div className="flex md:hidden flex-col gap-[3px]">
              {gallery.map((item, i) => (
                <Tile key={`sm-${i}`} item={item} sizes="100vw" aspect="aspect-[4/5]" />
              ))}
            </div>
          </div>
        )
      })()}
    </article>
  )
}
