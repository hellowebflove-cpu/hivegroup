// Scrapes projects.hivegroup.ltd and downloads all media per project.
// Output: /tmp/hg-import/<slug>/{meta.json, preview.*, gallery-NN.*}
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import path from 'node:path'

const OUT = '/tmp/hg-import'
const BASE = 'https://projects.hivegroup.ltd'

const log = (...a) => console.log('[scrape]', ...a)

function stripQuery(url) {
  return url.split('?')[0]
}

function extFromUrl(url) {
  const u = stripQuery(url)
  const m = u.match(/\.(jpe?g|png|webp|gif|pdf|mp4)$/i)
  return m ? m[1].toLowerCase() : 'jpg'
}

async function download(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`)
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

// Disable images loading? No — we need their URLs.
log('Listing...')
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(1000)

// Collect listing: slug + type/city/year (from grid)
const listing = await page.evaluate(() => {
  const BASE = 'https://projects.hivegroup.ltd'
  const slugs = []
  for (const a of document.querySelectorAll('a')) {
    let h = a.getAttribute('href') || ''
    if (!h) continue
    if (h.startsWith(BASE)) h = h.slice(BASE.length)
    if (h.includes('://')) continue // external
    if (h.includes('mailto:') || h.includes('instagram')) continue
    const m = h.match(/^\/([a-z0-9_-]+)\/?$/i)
    if (m) slugs.push(m[1])
  }
  const uniq = [...new Set(slugs)]
  // Paragraphs text in order
  const paras = Array.from(document.querySelectorAll('p')).map((p) => p.innerText.trim()).filter(Boolean)
  return { slugs: uniq, paras }
})

log('Found slugs:', listing.slugs)
log('Paragraphs count:', listing.paras.length)

// Slug -> meta (type/city/year) inferred from paras is brittle; we'll parse on each project page too.
await mkdir(OUT, { recursive: true })
await writeFile(path.join(OUT, '_listing.json'), JSON.stringify(listing, null, 2))

const projects = []

for (const slug of listing.slugs) {
  log('Project:', slug)
  const url = `${BASE}/${slug}/`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  } catch (e) {
    log('goto failed', slug, e.message)
    continue
  }
  // Trigger lazy load by scrolling down/up
  await page.evaluate(async () => {
    await new Promise((res) => setTimeout(res, 500))
    const h = document.body.scrollHeight
    for (let y = 0; y <= h; y += 800) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 150))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(2000)

  const data = await page.evaluate(() => {
    const title = document.title
    const paras = Array.from(document.querySelectorAll('p'))
      .map((p) => p.innerText.trim())
      .filter((s) => s.length > 0)
    const instaLinks = Array.from(document.querySelectorAll('a[href*="instagram.com"]'))
      .map((a) => {
        const h = a.getAttribute('href') || ''
        const m = h.match(/instagram\.com\/([^/?#]+)/)
        return m ? m[1] : null
      })
      .filter(Boolean)
    // Find next-project link href
    const nextLinkEl = Array.from(document.querySelectorAll('a')).find((a) =>
      /next\s*project/i.test((a.textContent || '').replace(/\s+/g, ' ')),
    )
    const nextProjectLink = nextLinkEl?.getAttribute('href') || null
    const imgs = Array.from(document.querySelectorAll('img'))
      .map((i) => {
        const rect = i.getBoundingClientRect()
        // Parse natural size from rmcdn URL cW/cH if present (bigger than naturalWidth in thumbnail).
        let sw = i.naturalWidth
        let sh = i.naturalHeight
        try {
          const u = new URL(i.currentSrc || i.src)
          const cw = parseFloat(u.searchParams.get('cW'))
          const ch = parseFloat(u.searchParams.get('cH'))
          if (cw && ch) {
            sw = cw
            sh = ch
          }
        } catch {}
        return {
          src: i.currentSrc || i.src,
          alt: i.alt || '',
          nw: i.naturalWidth,
          nh: i.naturalHeight,
          sw: Math.round(sw),
          sh: Math.round(sh),
          rw: Math.round(rect.width),
          rh: Math.round(rect.height),
          y: Math.round(rect.top + window.scrollY),
          parentHref: (i.closest('a') || {}).getAttribute?.('href') || null,
        }
      })
      .filter((i) => i.src && !i.src.includes('Favicon') && i.nw > 100)
    return { title, paras, instaLinks, imgs, nextProjectLink }
  })

  // Filter gallery: keep images from /{project-id}/{sub-id}/ space — big ones only.
  // Drop images linked to hivegroup.ltd (header logo) and to next-project.
  const nextSlug = data.nextProjectLink ? data.nextProjectLink.replace(/^\/+|\/+$/g, '') : null
  const images = data.imgs.filter((i) => {
    if (i.src.includes('rmcdn.net') === false) return false
    // Drop anything with parentHref pointing to the next project teaser or to the home listing.
    if (i.parentHref) {
      const h = i.parentHref
      if (h.includes('hivegroup.ltd') || h === '/' || (nextSlug && h.includes(nextSlug))) return false
    }
    // Drop shared brand icons (from a different project id than current). Project id is in path.
    // Current project id is last path segment; simplest: take most common path prefix.
    return true
  })

  // Identify the current project's asset path prefix (most common 2-segment path)
  const prefixCount = {}
  for (const im of images) {
    const u = new URL(im.src)
    const parts = u.pathname.split('/').filter(Boolean) // [orgId, projId, ...filename]
    if (parts.length >= 2) {
      const key = `${parts[0]}/${parts[1]}`
      prefixCount[key] = (prefixCount[key] || 0) + 1
    }
  }
  const projectPrefix = Object.entries(prefixCount).sort((a, b) => b[1] - a[1])[0]?.[0]
  log('  prefix:', projectPrefix, '| images total:', images.length, '| nextSlug:', nextSlug)
  const ownImages = images
    .filter((i) => i.src.includes(`/${projectPrefix}/`))
    // Drop images whose parent link points to another project (NEXT PROJECT teaser image).
    .filter((i) => {
      if (!i.parentHref) return true
      const h = i.parentHref.replace(/^\/+|\/+$/g, '').replace(/^https?:\/\/projects\.hivegroup\.ltd\//i, '')
      const cleaned = h.split('/')[0]
      if (cleaned === slug) return true
      // it's a link to another slug (next project teaser). Drop.
      if (/^[a-z0-9_-]+$/i.test(cleaned) && cleaned !== slug) return false
      return true
    })
    // Filter out tiny brand/UI marks: require at least 1200px on long side.
    .filter((i) => Math.max(i.sw, i.sh) >= 1200)
  log('  own images (after filters):', ownImages.length)

  // Sort by y position on page
  ownImages.sort((a, b) => a.y - b.y)

  // Detect brand logo: PNG with wide aspect ratio (>=2:1) — wordmark style.
  const logo = ownImages.find((i) => {
    const isPng = /\.png(\?|$)/i.test(i.src)
    const aspect = i.sw / i.sh
    return isPng && aspect >= 2.0
  }) || null

  // Preview: first (topmost) non-logo image.
  const nonLogo = ownImages.filter((i) => i.src !== logo?.src)
  const preview = nonLogo[0] || ownImages[0]
  const gallery = nonLogo.filter((i) => i.src !== preview?.src)

  // Parse text: year (4-digit 19xx or 20xx paragraph), description (longest), location
  const year = Number(data.paras.find((p) => /^(19|20)\d{2}$/.test(p.trim())))
  const locPara = data.paras.find((p) => /warsaw|kyiv|london|poland|ukraine|uk|\bkyiv\b|,\s*[a-z]/i.test(p) && p.length < 60)
  const cityCountry = locPara ? locPara.split(',').map((s) => s.trim()) : []
  const desc = data.paras
    .filter((p) => p.length > 80 && !/instagram/i.test(p))
    .sort((a, b) => b.length - a.length)[0] || null
  const instagram = data.instaLinks[0] || null

  projects.push({
    slug,
    title: data.title,
    year,
    city: cityCountry[0] || null,
    country: cityCountry[1] || null,
    description: desc,
    instagram,
    logoUrl: logo ? stripQuery(logo.src) : null,
    previewUrl: preview ? stripQuery(preview.src) : null,
    galleryUrls: gallery.map((g) => stripQuery(g.src)),
    raw: { paras: data.paras, imgCount: ownImages.length },
  })

  const dir = path.join(OUT, slug)
  await mkdir(dir, { recursive: true })

  // Download logo
  if (logo) {
    const ext = extFromUrl(logo.src)
    const p = path.join(dir, `logo.${ext}`)
    log('  downloading logo...')
    try { await download(stripQuery(logo.src), p) } catch (e) { log('  logo failed', e.message) }
  }
  // Download preview
  if (preview) {
    const ext = extFromUrl(preview.src)
    const p = path.join(dir, `preview.${ext}`)
    log('  downloading preview...')
    try { await download(stripQuery(preview.src), p) } catch (e) { log('  preview failed', e.message) }
  }
  // Gallery
  for (let i = 0; i < gallery.length; i++) {
    const g = gallery[i]
    const ext = extFromUrl(g.src)
    const p = path.join(dir, `gallery-${String(i + 1).padStart(2, '0')}.${ext}`)
    try { await download(stripQuery(g.src), p) } catch (e) { log('  gallery', i, 'failed', e.message) }
  }

  await writeFile(path.join(dir, 'meta.json'), JSON.stringify(projects.at(-1), null, 2))
}

await writeFile(path.join(OUT, '_all.json'), JSON.stringify(projects, null, 2))
await browser.close()
log('Done. Files in', OUT)
