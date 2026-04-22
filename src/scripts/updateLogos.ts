import { config as loadEnv } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __dir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dir, '../..')
loadEnv({ path: path.join(projectRoot, '.env.local'), override: true })
loadEnv({ path: path.join(projectRoot, '.env'), override: false })
console.log('SECRET set:', !!process.env.PAYLOAD_SECRET, 'DB set:', !!process.env.DATABASE_URL)
import fs from 'fs'

const dirname = __dir
const logosDir = path.resolve(dirname, '../../../logos')

const mapping: Record<string, string> = {
  bunch: 'bunch.png',
  kiki: 'kiki.png',
  parbar: 'parbar.png',
  parbar2: 'parbar2.png',
  parbar3: 'parbar3.png',
  chiba: 'chiba.png',
  lucca: 'lucca.png',
  '4844_outlaw_bar': '4844_outlaw_bar.png',
}

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  for (const [slug, fileName] of Object.entries(mapping)) {
    const filePath = path.join(logosDir, fileName)
    if (!fs.existsSync(filePath)) {
      console.warn(`Skip ${slug}: file not found ${filePath}`)
      continue
    }

    const { docs } = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const project = docs[0]
    if (!project) {
      console.warn(`Skip ${slug}: project not found`)
      continue
    }

    const buffer = fs.readFileSync(filePath)
    const newMedia = await payload.create({
      collection: 'media',
      data: { alt: `${project.name} logo` },
      file: {
        data: buffer,
        mimetype: 'image/png',
        name: `${slug}-logo-white.png`,
        size: buffer.length,
      },
    })

    await payload.update({
      collection: 'projects',
      id: project.id,
      data: { logo: newMedia.id },
      context: { disableRevalidate: true },
    })

    console.log(`✓ ${slug}: logo media ${newMedia.id}`)
  }

  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
