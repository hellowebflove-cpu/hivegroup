import { config as loadEnv } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dir, '../..')
loadEnv({ path: path.join(projectRoot, '.env.local'), override: true })
loadEnv({ path: path.join(projectRoot, '.env'), override: false })

const MENU_URLS: Record<string, string> = {
  parbar: 'https://parbar.choiceqr.com/section:special-menu/sezonne-menyu',
  parbar2: 'https://parbar2.choiceqr.com/menu/section:special-menu/pisne-menyu',
  parbar3: 'https://parbar3.choiceqr.com/menu/section:special-menu/pisne-menyu',
  chiba: 'https://chiba-bar-kitchen.choiceqr.com/section:new-menu/nove-menyu',
  '4844_outlaw_bar': 'https://4844.choiceqr.com/section:special-menu/pisne-menyu',
  bunch: 'https://bunchcafe.choiceqr.com/menu',
  kiki: 'https://kiki.choiceqr.com',
  lucca: 'https://expz.menu/69d88bcf-7270-4c7e-9f67-9dcdfedcf0ed/menu?menuId=9786',
}

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  for (const [slug, url] of Object.entries(MENU_URLS)) {
    const { docs } = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const p = docs[0]
    if (!p) {
      console.warn(`Skip ${slug}: project not found`)
      continue
    }
    await payload.update({
      collection: 'projects',
      id: p.id,
      data: { menuUrl: url },
      context: { disableRevalidate: true },
    })
    console.log(`✓ ${slug} → ${url}`)
  }
  process.exit(0)
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
