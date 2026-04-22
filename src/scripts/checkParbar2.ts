import { config as loadEnv } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dir, '../..')
loadEnv({ path: path.join(projectRoot, '.env.local'), override: true })
loadEnv({ path: path.join(projectRoot, '.env'), override: false })

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'parbar2' } },
    depth: 2,
    limit: 1,
  })
  const p = docs[0]
  if (!p) {
    console.log('not found')
    process.exit(0)
  }
  console.log('name:', p.name)
  console.log('preview:', (p.preview as any)?.filename, (p.preview as any)?.url)
  console.log('logo:', (p.logo as any)?.filename)
  console.log(
    'gallery:',
    (p.gallery || []).map((g: any) => ({
      filename: g.image?.filename,
      w: g.image?.width,
      h: g.image?.height,
    })),
  )
  process.exit(0)
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
