'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

export type GalleryImage = {
  url: string
  fullUrl?: string
  alt: string
}

const BLUR_DATA =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIi8+PC9zdmc+'

type RowDef = { items: GalleryImage[]; startIndex: number; aspect: string; sizes: string }

function buildDesktopRows(items: GalleryImage[]): RowDef[] {
  const A_FULL = 'aspect-[16/9]'
  const A_HALF = 'aspect-[4/5]'
  const A_THIRD = 'aspect-[4/5]'
  const S_FULL = '100vw'
  const S_HALF = '50vw'
  const S_THIRD = '33vw'
  const rows: RowDef[] = []
  const count = items.length
  const push = (start: number, slice: GalleryImage[], aspect: string, sizes: string) =>
    rows.push({ items: slice, startIndex: start, aspect, sizes })

  if (count === 1) push(0, [items[0]], A_FULL, S_FULL)
  else if (count === 2) push(0, items.slice(0, 2), A_HALF, S_HALF)
  else if (count === 3) {
    push(0, items.slice(0, 2), A_HALF, S_HALF)
    push(2, [items[2]], A_FULL, S_FULL)
  } else if (count === 4) {
    push(0, items.slice(0, 2), A_HALF, S_HALF)
    push(2, items.slice(2, 4), A_HALF, S_HALF)
  } else if (count === 5) {
    push(0, items.slice(0, 2), A_HALF, S_HALF)
    push(2, items.slice(2, 5), A_THIRD, S_THIRD)
  } else if (count === 6) {
    push(0, items.slice(0, 3), A_THIRD, S_THIRD)
    push(3, items.slice(3, 6), A_THIRD, S_THIRD)
  } else if (count === 7) {
    push(0, items.slice(0, 2), A_HALF, S_HALF)
    push(2, items.slice(2, 5), A_THIRD, S_THIRD)
    push(5, items.slice(5, 7), A_HALF, S_HALF)
  } else if (count === 8) {
    push(0, items.slice(0, 3), A_THIRD, S_THIRD)
    push(3, items.slice(3, 5), A_HALF, S_HALF)
    push(5, items.slice(5, 8), A_THIRD, S_THIRD)
  } else {
    let i = 0
    while (i < count) {
      const remaining = count - i
      if (remaining >= 3) {
        push(i, items.slice(i, i + 3), A_THIRD, S_THIRD)
        i += 3
      } else if (remaining === 2) {
        push(i, items.slice(i, i + 2), A_HALF, S_HALF)
        i += 2
      } else {
        push(i, [items[i]], A_FULL, S_FULL)
        i += 1
      }
    }
  }
  return rows
}

function buildTabletRows(items: GalleryImage[]): RowDef[] {
  const A_FULL = 'aspect-[16/9]'
  const A_HALF = 'aspect-[4/5]'
  const rows: RowDef[] = []
  let i = 0
  while (i < items.length) {
    const remaining = items.length - i
    if (remaining >= 2) {
      rows.push({ items: items.slice(i, i + 2), startIndex: i, aspect: A_HALF, sizes: '50vw' })
      i += 2
    } else {
      rows.push({ items: [items[i]], startIndex: i, aspect: A_FULL, sizes: '100vw' })
      i += 1
    }
  }
  return rows
}

export function ProjectGallery({ items }: { items: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = openIndex !== null

  const close = useCallback(() => setOpenIndex(null), [])
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length],
  )
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, close, prev, next])

  useEffect(() => {
    if (openIndex === null) return
    const preload = (i: number) => {
      const item = items[i]
      if (!item) return
      const img = new window.Image()
      img.src = item.fullUrl || item.url
    }
    preload((openIndex + 1) % items.length)
    preload((openIndex - 1 + items.length) % items.length)
  }, [openIndex, items])

  const desktopRows = buildDesktopRows(items)
  const tabletRows = buildTabletRows(items)

  const Tile = ({
    item,
    index,
    sizes,
    aspect,
    eager,
  }: {
    item: GalleryImage
    index: number
    sizes: string
    aspect: string
    eager?: boolean
  }) => (
    <button
      type="button"
      onClick={() => setOpenIndex(index)}
      aria-label={`Open photo ${index + 1}`}
      className={`relative overflow-hidden bg-neutral-200 cursor-zoom-in group ${aspect}`}
    >
      <Image
        src={item.url}
        alt={item.alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        sizes={sizes}
        placeholder="blur"
        blurDataURL={BLUR_DATA}
        loading={eager ? 'eager' : 'lazy'}
        unoptimized
        {...(eager ? { fetchPriority: 'high' as const } : {})}
      />
    </button>
  )

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div
      className="grid gap-[3px]"
      style={{ gridAutoFlow: 'column', gridAutoColumns: '1fr' }}
    >
      {children}
    </div>
  )

  const current = openIndex !== null ? items[openIndex] : null

  return (
    <>
      <div className="bg-white px-0">
        <div className="hidden lg:flex flex-col gap-[3px]">
          {desktopRows.map((row, ri) => (
            <Row key={`lg-${ri}`}>
              {row.items.map((item, i) => (
                <Tile
                  key={`lg-${ri}-${i}`}
                  item={item}
                  index={row.startIndex + i}
                  sizes={row.sizes}
                  aspect={row.aspect}
                  eager={ri === 0}
                />
              ))}
            </Row>
          ))}
        </div>
        <div className="hidden md:flex lg:hidden flex-col gap-[3px]">
          {tabletRows.map((row, ri) => (
            <Row key={`md-${ri}`}>
              {row.items.map((item, i) => (
                <Tile
                  key={`md-${ri}-${i}`}
                  item={item}
                  index={row.startIndex + i}
                  sizes={row.sizes}
                  aspect={row.aspect}
                  eager={ri === 0}
                />
              ))}
            </Row>
          ))}
        </div>
        <div className="flex md:hidden flex-col gap-[3px]">
          {items.map((item, i) => (
            <Tile
              key={`sm-${i}`}
              item={item}
              index={i}
              sizes="100vw"
              aspect="aspect-[4/5]"
              eager={i === 0}
            />
          ))}
        </div>
      </div>

      {open && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              close()
            }}
            aria-label="Close"
            className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 text-white/70 text-[12px] uppercase font-normal tracking-wide">
            {(openIndex! + 1).toString().padStart(2, '0')} / {items.length.toString().padStart(2, '0')}
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                aria-label="Previous photo"
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path d="M14 17L8 11L14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                aria-label="Next photo"
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path d="M8 5L14 11L8 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative w-[92vw] h-[88vh] md:w-[88vw] md:h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={openIndex}
              src={current.fullUrl || current.url}
              alt={current.alt}
              fill
              priority
              sizes="92vw"
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
