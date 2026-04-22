import Image from 'next/image'
import Link from 'next/link'
import { getProjects, getMediaUrl } from '@/utilities/getProjects'

export const ProjectsSection: React.FC = async () => {
  const projects = await getProjects()
  const items = projects.slice(0, 6).map((p) => ({
    slug: p.slug,
    name: p.name,
    type: p.type,
    city: p.city,
    year: p.year,
    preview: getMediaUrl(p.preview),
    logo: getMediaUrl(p.logo),
  }))

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="px-6 lg:px-[52px] mb-8">
        <h2 className="text-[24px] md:text-[40px] leading-[1] font-normal uppercase text-black tracking-[-0.8px]">
          Discover{' '}
          <span className="underline underline-offset-4 decoration-[2px]">all our projects</span>
        </h2>
      </div>

      <div className="px-6 lg:px-[52px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
        {items.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden group no-underline"
          >
            <Image
              src={project.preview}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Image
                src={project.logo}
                alt={`${project.name} logo`}
                width={180}
                height={100}
                className="object-contain max-w-[60%] max-h-[80px] md:max-h-[100px] drop-shadow-lg"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
              <p className="text-[11px] leading-[14px] font-normal uppercase text-white/80 text-center">
                {project.type} &middot; {project.city} &middot; {project.year}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/projects"
          className="inline-flex items-center justify-center h-[44px] px-7 border border-black rounded-full text-[13px] font-normal uppercase text-black no-underline hover:bg-black hover:text-white transition-colors duration-200"
        >
          View all projects
        </Link>
      </div>
    </section>
  )
}
