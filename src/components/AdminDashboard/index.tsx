import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import './styles.scss'

const fmtDate = (d?: string | null) => {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const day = 1000 * 60 * 60 * 24
  if (diffMs < 60_000) return 'just now'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / 3_600_000)}h ago`
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const AdminDashboard: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })

  const [projects, pages, media, users, recentProjects, recentPages] = await Promise.all([
    payload.count({ collection: 'projects' }),
    payload.count({ collection: 'pages' }),
    payload.count({ collection: 'media' }),
    payload.count({ collection: 'users' }),
    payload.find({
      collection: 'projects',
      limit: 5,
      sort: '-updatedAt',
      depth: 0,
      pagination: false,
    }),
    payload.find({
      collection: 'pages',
      limit: 5,
      sort: '-updatedAt',
      depth: 0,
      pagination: false,
    }),
  ])

  return (
    <div className="hg-dashboard">
      <header className="hg-dashboard__header">
        <h1>Welcome back</h1>
        <p>Manage your projects and site content from one place.</p>
      </header>

      <section className="hg-dashboard__stats">
        <StatCard label="Projects" value={projects.totalDocs} href="/admin/collections/projects" />
        <StatCard label="Pages" value={pages.totalDocs} href="/admin/collections/pages" />
        <StatCard label="Media files" value={media.totalDocs} href="/admin/collections/media" />
        <StatCard label="Users" value={users.totalDocs} href="/admin/collections/users" />
      </section>

      <section className="hg-dashboard__actions">
        <ActionCard
          title="New project"
          description="Add a restaurant or concept to the site."
          href="/admin/collections/projects/create"
        />
        <ActionCard
          title="All projects"
          description="Edit, reorder or delete existing projects."
          href="/admin/collections/projects"
        />
        <ActionCard
          title="Upload media"
          description="Add photos and assets to the library."
          href="/admin/collections/media/create"
        />
      </section>

      <section className="hg-dashboard__recent">
        <RecentBlock
          heading="Recently updated projects"
          docs={recentProjects.docs}
          basePath="/admin/collections/projects"
          getTitle={(d) => (d as { name?: string; title?: string }).name || (d as { title?: string }).title || 'Untitled'}
        />
        <RecentBlock
          heading="Recently updated pages"
          docs={recentPages.docs}
          basePath="/admin/collections/pages"
          getTitle={(d) => (d as { title?: string }).title || 'Untitled'}
        />
      </section>

      <section className="hg-dashboard__analytics">
        <h2>Site analytics</h2>
        <p>
          Web Analytics and Speed Insights are wired into the site. Page views, top pages,
          referrers and Core Web Vitals are tracked automatically — open the Vercel dashboard to
          see live numbers.
        </p>
        <div className="hg-dashboard__analytics-links">
          <a
            href="https://vercel.com/hellowebflove-1429s-projects/hivegroup/analytics"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Web Analytics ↗
          </a>
          <a
            href="https://vercel.com/hellowebflove-1429s-projects/hivegroup/speed-insights"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Speed Insights ↗
          </a>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard

const StatCard: React.FC<{ label: string; value: number; href: string }> = ({
  label,
  value,
  href,
}) => (
  <Link href={href} className="hg-stat">
    <span className="hg-stat__value">{value}</span>
    <span className="hg-stat__label">{label}</span>
  </Link>
)

const ActionCard: React.FC<{ title: string; description: string; href: string }> = ({
  title,
  description,
  href,
}) => (
  <Link href={href} className="hg-action">
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <span className="hg-action__arrow" aria-hidden>
      →
    </span>
  </Link>
)

type RecentDoc = { id: string | number; updatedAt?: string | null; [k: string]: unknown }

const RecentBlock: React.FC<{
  heading: string
  docs: RecentDoc[]
  basePath: string
  getTitle: (d: RecentDoc) => string
}> = ({ heading, docs, basePath, getTitle }) => (
  <div className="hg-recent">
    <h2>{heading}</h2>
    {docs.length === 0 ? (
      <p className="hg-recent__empty">Nothing here yet.</p>
    ) : (
      <ul>
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link href={`${basePath}/${doc.id}`}>
              <span className="hg-recent__title">{getTitle(doc)}</span>
              <span className="hg-recent__meta">{fmtDate(doc.updatedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
)
