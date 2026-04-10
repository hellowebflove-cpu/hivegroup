import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Project } from '../../../payload-types'

export const revalidateProject: CollectionAfterChangeHook<Project> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/projects/${doc.slug}`
    payload.logger.info(`Revalidating project at path: ${path}`)
    revalidatePath(path)
    revalidatePath('/projects')
    revalidatePath('/')
  }
  return doc
}

export const revalidateProjectDelete: CollectionAfterDeleteHook<Project> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/projects/${doc?.slug}`)
    revalidatePath('/projects')
    revalidatePath('/')
  }
  return doc
}
