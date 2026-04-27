import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const FOLDER_SLUG = 'payload-folders'

async function main() {
  const { getPayload } = await import('payload')
  const config = (await import('../payload.config')).default
  const payload = await getPayload({ config })

  const { docs: projects } = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 200,
    pagination: false,
  })

  for (const project of projects) {
    const name = (project as { name?: string; title?: string }).name || (project as { title?: string }).title || 'Untitled'
    payload.logger.info(`→ project "${name}"`)

    const existing = await payload.find({
      collection: FOLDER_SLUG,
      where: { name: { equals: name } },
      limit: 1,
      pagination: false,
    })

    let folderId: string | number
    if (existing.docs.length > 0) {
      folderId = existing.docs[0].id as string | number
      payload.logger.info(`   folder exists: ${folderId}`)
    } else {
      const created = await payload.create({
        collection: FOLDER_SLUG,
        data: {
          name,
          folderType: ['media'],
        } as Record<string, unknown>,
      })
      folderId = (created as { id: string | number }).id
      payload.logger.info(`   created folder: ${folderId}`)
    }

    const mediaIds = new Set<string | number>()
    const collect = (m: unknown) => {
      if (!m) return
      if (typeof m === 'object' && m !== null && 'id' in m) {
        mediaIds.add((m as { id: string | number }).id)
      } else if (typeof m === 'string' || typeof m === 'number') {
        mediaIds.add(m)
      }
    }
    collect((project as { preview?: unknown }).preview)
    collect((project as { logo?: unknown }).logo)
    collect((project as { menuPdf?: unknown }).menuPdf)
    const gallery = (project as { gallery?: Array<{ image?: unknown }> }).gallery
    if (Array.isArray(gallery)) gallery.forEach((g) => collect(g?.image))

    if (mediaIds.size === 0) {
      payload.logger.info(`   no media to move`)
      continue
    }

    let moved = 0
    for (const mediaId of mediaIds) {
      try {
        await payload.update({
          collection: 'media',
          id: mediaId,
          data: { folder: folderId } as Record<string, unknown>,
        })
        moved += 1
      } catch (err) {
        payload.logger.error(`   failed to move media ${mediaId}: ${(err as Error).message}`)
      }
    }
    payload.logger.info(`   moved ${moved}/${mediaIds.size} media files`)
  }

  payload.logger.info('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
