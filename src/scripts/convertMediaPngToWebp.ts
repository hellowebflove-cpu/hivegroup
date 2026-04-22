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
const MIN_SIZE = 50_000 // bytes — skip small logos

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'media',
    where: { mimeType: { equals: 'image/png' } },
    limit: 200,
    depth: 0,
  })

  const targets = docs.filter((m) => (m.filesize || 0) > MIN_SIZE)
  console.log(`Converting ${targets.length} PNG -> WebP (>=${MIN_SIZE / 1000}KB)`)

  let totalBefore = 0
  let totalAfter = 0

  for (const m of targets) {
    const filename = m.filename
    if (!filename) continue
    const srcPath = path.join(mediaDir, filename)
    if (!fs.existsSync(srcPath)) {
      console.warn(`Skip ${filename}: not found on disk`)
      continue
    }

    const beforeBytes = fs.statSync(srcPath).size
    const tmpWebp = path.join('/tmp', `${path.basename(filename, '.png')}.webp`)

    try {
      execSync(`magick "${srcPath}" -auto-orient -resize "1440>" -quality 82 "${tmpWebp}"`, {
        stdio: 'pipe',
      })
    } catch (e) {
      console.error(`Convert failed: ${filename}`)
      continue
    }

    const buffer = fs.readFileSync(tmpWebp)
    const newName = filename.replace(/\.png$/i, '.webp')

    try {
      await payload.update({
        collection: 'media',
        id: m.id,
        data: { alt: m.alt },
        file: {
          data: buffer,
          mimetype: 'image/webp',
          name: newName,
          size: buffer.length,
        },
        context: { disableRevalidate: true },
      })
      totalBefore += beforeBytes
      totalAfter += buffer.length
      console.log(
        `✓ ${filename} ${(beforeBytes / 1024).toFixed(0)}KB -> ${newName} ${(buffer.length / 1024).toFixed(0)}KB`,
      )
    } catch (e: any) {
      console.error(`Update failed for ${filename}:`, e?.message || e)
    } finally {
      fs.unlinkSync(tmpWebp)
    }
  }

  console.log(
    `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)} MB -> ${(totalAfter / 1024 / 1024).toFixed(2)} MB (saved ${((totalBefore - totalAfter) * 100) / totalBefore || 0}%)`,
  )
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
