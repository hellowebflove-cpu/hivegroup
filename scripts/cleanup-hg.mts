// Delete 5 imported projects and their media (logo/preview/gallery) from DB.
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: true })
process.env.PGSSLMODE = 'require'
if (process.env.DATABASE_URL && !/sslmode=/.test(process.env.DATABASE_URL)) {
  const sep = process.env.DATABASE_URL.includes('?') ? '&' : '?'
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${sep}sslmode=require`
}

const { getPayload } = await import('payload')
const config = (await import('@payload-config')).default

const payload = await getPayload({ config })

const SLUGS = ['4844_outlaw_bar', 'chiba', 'lucca', 'parbar2', 'parbar3']

for (const slug of SLUGS) {
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  if (!docs.length) {
    console.log(`Skip (not found): ${slug}`)
    continue
  }
  const proj = docs[0]
  const mediaIds = new Set<number>()
  if (typeof proj.logo === 'object') mediaIds.add(proj.logo.id)
  if (typeof proj.preview === 'object') mediaIds.add(proj.preview.id)
  for (const g of proj.gallery || []) {
    if (typeof g.image === 'object') mediaIds.add(g.image.id)
  }
  console.log(`Delete project ${slug} and ${mediaIds.size} media records`)
  await payload.delete({
    collection: 'projects',
    id: proj.id,
    context: { disableRevalidate: true },
  })
  for (const id of mediaIds) {
    try {
      await payload.delete({ collection: 'media', id })
    } catch (e) {
      console.log(`  failed to delete media ${id}:`, (e as Error).message)
    }
  }
  console.log(`✓ ${slug} cleaned up`)
}

process.exit(0)
