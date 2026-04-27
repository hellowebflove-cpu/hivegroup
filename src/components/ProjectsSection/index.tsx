import { getProjects, getMediaUrl, getMediaSizeUrl } from '@/utilities/getProjects'
import { ProjectsCarousel } from './ProjectsCarousel'

export const ProjectsSection: React.FC = async () => {
  const projects = await getProjects()
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
      <ProjectsCarousel items={items} />
    </section>
  )
}
