import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Project, Media } from '@/payload-types'

export type ProjectWithMedia = Omit<Project, 'logo' | 'preview' | 'menuPdf' | 'gallery'> & {
  logo: Media
  preview: Media
  menuPdf?: Media | null
  gallery?:
    | {
        image: Media
        id?: string | null
      }[]
    | null
}

export async function getProjects(): Promise<ProjectWithMedia[]> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'projects',
    sort: 'sortOrder',
    limit: 100,
    depth: 1,
  })
  return docs as ProjectWithMedia[]
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithMedia | null> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return (docs[0] as ProjectWithMedia) || null
}

export function getMediaUrl(media: Media): string {
  return media.url || ''
}
