import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

async function main() {
  const { getPayload } = await import('payload')
  const config = (await import('../payload.config')).default
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    limit: 50,
    pagination: false,
    depth: 0,
  })
  console.log('Pages count:', docs.length)
  for (const d of docs) {
    console.log(' -', d.slug, '|', d.title)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
