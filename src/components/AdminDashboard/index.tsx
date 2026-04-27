import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { fetchRecentDeployments, type Deployment } from './fetchDeployments'

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

  const [projects, pages, media, users, recentProjects, recentPages, deployments] = await Promise.all([
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
    fetchRecentDeployments(5),
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
          docs={recentProjects.docs.map((p) => ({
            id: p.id,
            updatedAt: p.updatedAt,
            title: (p as { name?: string; title?: string }).name || (p as { title?: string }).title || 'Untitled',
          }))}
          basePath="/admin/collections/projects"
        />
        <RecentBlock
          heading="Recently updated pages"
          docs={recentPages.docs.map((p) => ({
            id: p.id,
            updatedAt: p.updatedAt,
            title: (p as { title?: string }).title || 'Untitled',
          }))}
          basePath="/admin/collections/pages"
        />
      </section>

      {deployments && deployments.length > 0 && (
        <section className="hg-deployments">
          <header>
            <h2>Recent deployments</h2>
            <a
              href="https://vercel.com/hellowebflove-1429s-projects/hivegroup/deployments"
              target="_blank"
              rel="noopener noreferrer"
            >
              All deployments ↗
            </a>
          </header>
          <ul>
            {deployments.map((d) => (
              <li key={d.uid}>
                <span className={`hg-deployments__state hg-deployments__state--${d.state.toLowerCase()}`}>
                  {d.state === 'READY' ? '● Ready' : d.state === 'ERROR' ? '● Error' : d.state === 'BUILDING' ? '● Building' : `● ${d.state}`}
                </span>
                <a href={`https://${d.url}`} target="_blank" rel="noopener noreferrer" className="hg-deployments__msg">
                  {d.commitMessage || d.url}
                </a>
                <span className="hg-deployments__meta">
                  {d.branch && <span>{d.branch}</span>}
                  <span>{fmtDate(new Date(d.created).toISOString())}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

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

type RecentDoc = { id: string | number; updatedAt?: string | null; title: string }

const RecentBlock: React.FC<{
  heading: string
  docs: RecentDoc[]
  basePath: string
}> = ({ heading, docs, basePath }) => (
  <div className="hg-recent">
    <h2>{heading}</h2>
    {docs.length === 0 ? (
      <p className="hg-recent__empty">Nothing here yet.</p>
    ) : (
      <ul>
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link href={`${basePath}/${doc.id}`}>
              <span className="hg-recent__title">{doc.title}</span>
              <span className="hg-recent__meta">{fmtDate(doc.updatedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
)
