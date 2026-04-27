export type Deployment = {
  uid: string
  url: string
  state: string
  created: number
  branch: string | null
  commitMessage: string | null
}

export async function fetchRecentDeployments(limit = 5): Promise<Deployment[] | null> {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) return null

  const params = new URLSearchParams({
    projectId,
    limit: String(limit),
    target: 'production',
  })
  if (teamId) params.set('teamId', teamId)

  try {
    const res = await fetch(`https://api.vercel.com/v6/deployments?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      deployments: Array<{
        uid: string
        url: string
        state?: string
        readyState?: string
        created: number
        meta?: {
          githubCommitRef?: string
          githubCommitMessage?: string
        }
      }>
    }
    return data.deployments.map((d) => ({
      uid: d.uid,
      url: d.url,
      state: d.state || d.readyState || 'UNKNOWN',
      created: d.created,
      branch: d.meta?.githubCommitRef || null,
      commitMessage: d.meta?.githubCommitMessage?.split('\n')[0] || null,
    }))
  } catch {
    return null
  }
}
