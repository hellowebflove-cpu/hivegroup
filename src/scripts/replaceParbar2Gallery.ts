import { config as loadEnv } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dir, '../..')
loadEnv({ path: path.join(projectRoot, '.env.local'), override: true })
loadEnv({ path: path.join(projectRoot, '.env'), override: false })

const REF_DIR = '/tmp/parbar2-ref'
// Order: outdoor terrace (wide), interior chairs (wide), guys laughing (square), parbar² sign (square)
const PHOTOS = [
  { file: 'ref-wide-1.webp', name: 'parbar2-terrace.webp', alt: 'Par Bar² outdoor terrace' },
  { file: 'ref-sq-2.webp', name: 'parbar2-exterior.webp', alt: 'Par Bar² exterior signage' },
  { file: 'ref-wide-2.webp', name: 'parbar2-interior.webp', alt: 'Par Bar² interior with leather couches' },
  { file: 'ref-sq-1.webp', name: 'parbar2-guests.webp', alt: 'Par Bar² guests' },
]

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'parbar2' } },
    limit: 1,
    depth: 0,
  })
  const project = docs[0]
  if (!project) {
    console.error('parbar2 project not found')
    process.exit(1)
  }

  // Upload 4 new media items
  const newGalleryIds: number[] = []
  for (const p of PHOTOS) {
    const filePath = path.join(REF_DIR, p.file)
    const buffer = fs.readFileSync(filePath)
    const created = await payload.create({
      collection: 'media',
      data: { alt: p.alt },
      file: {
        data: buffer,
        mimetype: 'image/webp',
        name: p.name,
        size: buffer.length,
      },
      context: { disableRevalidate: true },
    })
    newGalleryIds.push(created.id as number)
    console.log(`✓ uploaded ${p.name} → media id ${created.id}`)
  }

  // Replace gallery
  await payload.update({
    collection: 'projects',
    id: project.id,
    data: {
      gallery: newGalleryIds.map((id) => ({ image: id })),
    },
    context: { disableRevalidate: true },
  })
  console.log(`✓ parbar2 gallery replaced with ${newGalleryIds.length} photos`)
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
