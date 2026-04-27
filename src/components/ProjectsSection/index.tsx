import { getProjects, getMediaUrl, getMediaSizeUrl } from '@/utilities/getProjects'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { ProjectsCarousel } from './ProjectsCarousel'

const FALLBACK_HEADING = {
  prefix: 'Discover',
  linkText: 'all our projects',
  linkUrl: '/projects',
}

export const ProjectsSection: React.FC = async () => {
  const [projects, home] = await Promise.all([
    getProjects(),
    getCachedGlobal('home-page', 1)().catch(() => null) as Promise<
      | {
          projectsHeadingPrefix?: string | null
          projectsHeadingLinkText?: string | null
          projectsHeadingLinkUrl?: string | null
        }
      | null
    >,
  ])

  const heading = {
    prefix: home?.projectsHeadingPrefix?.trim() || FALLBACK_HEADING.prefix,
    linkText: home?.projectsHeadingLinkText?.trim() || FALLBACK_HEADING.linkText,
    linkUrl: home?.projectsHeadingLinkUrl?.trim() || FALLBACK_HEADING.linkUrl,
  }

  const items = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    type: p.type,
    city: p.city,
    year: p.year,
    preview: getMediaSizeUrl(p.preview, 'medium', ['small', 'large']),
    logo: getMediaUrl(p.logo),
  }))

  return (
    <section className="bg-white py-16 lg:py-24">
      <ProjectsCarousel items={items} heading={heading} />
    </section>
  )
}
