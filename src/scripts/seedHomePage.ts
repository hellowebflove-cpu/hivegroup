import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const HERO_SUBTITLE = `Creation of unique restaurant concepts worldwide.

We combine cutting-edge ideas, creativity and expertise to craft spaces,
where guests can enjoy atmosphere and flavor. Our restaurants are places
to dine, spaces for interaction and unforgettable experiences.`

const SERVICES = [
  'Restaurant concept',
  'Development and branding',
  'Staff recruitment',
  'Training',
  'Management',
]

const MISSION =
  'Our Mission is to create unique restaurant concepts that blend cultural heritage with contemporary trends. We aim to be leaders in hospitality innovation, offering our guests fresh, memorable experiences in each of our venues.'

async function main() {
  const { getPayload } = await import('payload')
  const config = (await import('../payload.config')).default
  const payload = await getPayload({ config })

  const existing = (await payload.findGlobal({ slug: 'home-page' as const })) as Record<
    string,
    unknown
  >

  if (existing && existing.heroSubtitle) {
    payload.logger.info('Home page already populated; skipping.')
    process.exit(0)
  }

  await payload.updateGlobal({
    slug: 'home-page' as const,
    data: {
      heroSubtitle: HERO_SUBTITLE,
      services: SERVICES.map((label) => ({ label })),
      missionText: MISSION,
    } as Record<string, unknown>,
  })

  payload.logger.info('Seeded home-page global with defaults.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
