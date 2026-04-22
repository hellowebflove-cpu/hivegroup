// Import scraped projects into Payload CMS. Skips slugs already in DB.
// Run: pnpm tsx scripts/import-hg.mts
import dotenv from 'dotenv'
// Load env BEFORE any payload-related imports (config reads process.env at module load time).
dotenv.config({ path: '.env', override: false })
dotenv.config({ path: '.env.local', override: true })
process.env.PGSSLMODE = 'require'
if (process.env.DATABASE_URL && !/sslmode=/.test(process.env.DATABASE_URL)) {
  const sep = process.env.DATABASE_URL.includes('?') ? '&' : '?'
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${sep}sslmode=require`
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN missing — media would not upload to Vercel Blob. Aborting.')
  process.exit(1)
}
const { getPayload } = await import('payload')
const config = (await import('@payload-config')).default
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = '/tmp/hg-import'

const PROJECT_META: Record<string, { name: string; type: string; city: string; country: string }> = {
  chiba: { name: 'Chiba', type: 'restaurant', city: 'Kyiv', country: 'Ukraine' },
  parbar3: { name: 'Par Bar³', type: 'bar', city: 'Kyiv', country: 'Ukraine' },
  '4844_outlaw_bar': { name: '4844 Outlaw Bar', type: 'bar', city: 'Kyiv', country: 'Ukraine' },
  parbar2: { name: 'Par Bar²', type: 'bar', city: 'Kyiv', country: 'Ukraine' },
  lucca: { name: 'Lucca', type: 'restaurant', city: 'Kyiv', country: 'Ukraine' },
}

function sentenceCase(s: string | null | undefined): string | undefined {
  if (!s) return undefined
  // Keep original punctuation; just convert ALL-CAPS sentences to sentence case.
  const lower = s.toLowerCase()
  return lower.replace(/(^|[.!?]\s+)([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase())
}

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  }
  return map[ext.toLowerCase()] || 'application/octet-stream'
}

async function fileUpload(filePath: string) {
  const data = await readFile(filePath)
  const name = path.basename(filePath)
  const ext = path.extname(name).slice(1)
  return {
    data,
    mimetype: mimeFromExt(ext),
    name,
    size: data.byteLength,
  }
}

const log = (...a: unknown[]) => console.log('[import]', ...a)

const payload = await getPayload({ config })

// Skip existing
const existing = await payload.find({ collection: 'projects', limit: 200, depth: 0 })
const existingSlugs = new Set(existing.docs.map((d) => d.slug))
log('Existing slugs:', [...existingSlugs])

const maxSort = existing.docs.reduce((m, d) => Math.max(m, d.sortOrder ?? 0), 0)
log('Max sortOrder so far:', maxSort)

const dirs = await readdir(ROOT, { withFileTypes: true })
const slugs = dirs.filter((d) => d.isDirectory()).map((d) => d.name)

let sortCursor = maxSort

for (const slug of slugs) {
  if (existingSlugs.has(slug)) {
    log(`Skip (exists): ${slug}`)
    continue
  }
  if (!PROJECT_META[slug]) {
    log(`Skip (no metadata mapping): ${slug}`)
    continue
  }
  const meta = PROJECT_META[slug]
  const dir = path.join(ROOT, slug)
  const metaRaw = JSON.parse(await readFile(path.join(dir, 'meta.json'), 'utf-8')) as {
    year: number | null
    description: string | null
    instagram: string | null
  }
  const files = await readdir(dir)

  const logoFile = files.find((f) => f.startsWith('logo.'))
  const previewFile = files.find((f) => f.startsWith('preview.'))
  const galleryFiles = files.filter((f) => f.startsWith('gallery-')).sort()
  if (!previewFile) {
    log(`Skip (no preview): ${slug}`)
    continue
  }

  log(`→ ${slug}: creating media...`)

  // Preview
  const previewDoc = await payload.create({
    collection: 'media',
    data: { alt: `${meta.name} — hero` },
    file: await fileUpload(path.join(dir, previewFile)),
  })

  // Logo (fallback to preview if not found)
  const logoDoc = logoFile
    ? await payload.create({
        collection: 'media',
        data: { alt: `${meta.name} — logo` },
        file: await fileUpload(path.join(dir, logoFile)),
      })
    : previewDoc

  // Gallery
  const galleryDocs: Array<{ id: number | string }> = []
  for (const g of galleryFiles) {
    const d = await payload.create({
      collection: 'media',
      data: { alt: `${meta.name} — ${g}` },
      file: await fileUpload(path.join(dir, g)),
    })
    galleryDocs.push(d)
  }

  sortCursor += 1

  log(`→ ${slug}: creating project (sortOrder=${sortCursor})`)
  await payload.create({
    collection: 'projects',
    context: { disableRevalidate: true },
    data: {
      name: meta.name,
      type: meta.type,
      city: meta.city,
      country: meta.country,
      year: metaRaw.year || 0,
      description: sentenceCase(metaRaw.description) || null,
      instagram: metaRaw.instagram || null,
      logo: logoDoc.id,
      preview: previewDoc.id,
      gallery: galleryDocs.map((g) => ({ image: g.id })),
      sortOrder: sortCursor,
      slug,
    },
  })
  log(`✓ ${slug} imported`)
}

log('Done.')
process.exit(0)
