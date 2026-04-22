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
  const { docs } = await payload.find({ collection: 'projects', depth: 0, limit: 50 })
  for (const p of docs) console.log(p.slug, '|', p.name)
  process.exit(0)
}
run().catch(e => { console.error(e); process.exit(1) })
