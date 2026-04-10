import { getProjects, getMediaUrl } from '@/utilities/getProjects'
import { ProjectsCarousel } from './Carousel'

export const ProjectsSection: React.FC = async () => {
  const projects = await getProjects()

  const items = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    type: p.type,
    city: p.city,
    year: p.year,
    preview: getMediaUrl(p.preview),
    logo: getMediaUrl(p.logo),
  }))

  return <ProjectsCarousel projects={items} />
}
