import { config as loadEnv } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import fs from 'fs'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dir, '../..')
loadEnv({ path: path.join(projectRoot, '.env.local'), override: true })
loadEnv({ path: path.join(projectRoot, '.env'), override: false })

const mediaDir = path.join(projectRoot, 'public', 'media')

// Records where DB filename is .png but actual file is .jpg with same base name
const orphans = ['gallery-01.png', 'gallery-03.png']

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  for (const dbName of orphans) {
    const base = dbName.replace(/\.png$/i, '')
    const realFile = path.join(mediaDir, `${base}.jpg`)
    if (!fs.existsSync(realFile)) {
      console.warn(`Skip ${dbName}: ${base}.jpg not found`)
      continue
    }

    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { equals: dbName } },
      limit: 1,
      depth: 0,
    })
    const m = docs[0]
    if (!m) {
      console.warn(`Skip ${dbName}: doc not found`)
      continue
    }

    const tmp = path.join('/tmp', `${base}.webp`)
    execSync(`magick "${realFile}" -auto-orient -resize "1440>" -quality 82 "${tmp}"`, {
      stdio: 'pipe',
    })

    const buffer = fs.readFileSync(tmp)
    await payload.update({
      collection: 'media',
      id: m.id,
      data: { alt: m.alt },
      file: {
        data: buffer,
        mimetype: 'image/webp',
        name: `${base}.webp`,
        size: buffer.length,
      },
      context: { disableRevalidate: true },
    })
    fs.unlinkSync(tmp)
    console.log(`✓ ${dbName} -> ${base}.webp (${(buffer.length / 1024).toFixed(0)} KB)`)
  }

  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
