import type { GlobalAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateSiteFooter: GlobalAfterChangeHook = ({ req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating site footer')
    revalidateTag('global_site-footer', 'cache')
    revalidatePath('/', 'layout')
  }
}
