import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

async function main() {
  const { getPayload } = await import('payload')
  const config = (await import('../payload.config')).default
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'kiki' } },
    limit: 1,
  })
  console.log('description:', docs[0]?.description)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
