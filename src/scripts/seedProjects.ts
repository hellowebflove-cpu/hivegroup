import 'dotenv/config'
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'
import fs from 'fs'
import config from '../payload.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const projectsDir = path.resolve(dirname, '../../public/projects')

interface ProjectSeed {
  slug: string
  name: string
  type: string
  city: string
  country: string
  year: number
  logoFile: string
  previewFile: string
  description?: string
  instagram?: string
  menuPdfFile?: string
  galleryFiles?: { file: string; alt: string }[]
  sortOrder: number
}

const projectsData: ProjectSeed[] = [
  {
    slug: 'bunch',
    name: 'Bunch',
    type: 'cafe',
    city: 'Warsaw',
    country: 'Poland',
    year: 2024,
    logoFile: 'bunch/logo.webp',
    previewFile: 'bunch/preview.png',
    sortOrder: 1,
  },
  {
    slug: 'parbar',
    name: 'Par Bar',
    type: 'network of bars',
    city: 'Kyiv',
    country: 'Ukraine',
    year: 2015,
    logoFile: 'parbar/logo.png',
    previewFile: 'parbar/preview.png',
    sortOrder: 2,
  },
  {
    slug: 'kiki',
    name: 'Kiki',
    type: 'burger cafe',
    city: 'Warsaw',
    country: 'Poland',
    year: 2025,
    logoFile: 'kiki/logo.png',
    previewFile: 'kiki/preview.jpg',
    instagram: 'kiki.warszawa',
    menuPdfFile: 'kiki/menu.pdf',
    description:
      "Effortlessly stylish yet comfortably casual, Kiki brings a burst of joy to the table with its expertly crafted burgers and beautifully authentic cocktails. Whether you're in heels or trainers, you're always welcome at Kiki. Come for the flavours, stay for the atmosphere.",
    galleryFiles: [
      { file: 'kiki/gallery/01-food-wraps.jpg', alt: 'Kiki signature wraps' },
      { file: 'kiki/gallery/02-interior-bar.jpg', alt: 'Kiki bar interior' },
      { file: 'kiki/gallery/03-food-overhead.jpg', alt: 'Food overhead shot' },
      { file: 'kiki/gallery/04-food-prep.jpg', alt: 'Food preparation' },
      { file: 'kiki/gallery/05-cocktails.jpg', alt: 'Cocktail crafting' },
      { file: 'kiki/gallery/06-cocktail-red.webp', alt: 'Signature red cocktail' },
      { file: 'kiki/gallery/07-greenery.jpg', alt: 'Fresh ingredients' },
      { file: 'kiki/gallery/08-food-plating.jpg', alt: 'Plated dish' },
      { file: 'kiki/gallery/09-burger-closeup.jpg', alt: 'Burger close-up' },
      { file: 'kiki/gallery/10-interior-atmosphere.jpg', alt: 'Interior atmosphere' },
      { file: 'kiki/gallery/11-interior-panoramic.jpg', alt: 'Panoramic interior view' },
    ],
    sortOrder: 3,
  },
]

async function uploadMedia(
  payload: any,
  filePath: string,
  alt: string,
): Promise<number> {
  const absolutePath = path.resolve(projectsDir, filePath)
  const fileName = path.basename(filePath)
  const ext = path.extname(fileName).toLowerCase()

  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  }

  const data = fs.readFileSync(absolutePath)

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: mimeTypes[ext] || 'application/octet-stream',
      name: fileName,
      size: data.length,
    },
  })

  console.log(`  Uploaded: ${fileName} -> ID ${media.id}`)
  return media.id
}

async function seed() {
  const payload = await getPayload({ config })

  // Delete existing projects to re-seed cleanly
  const existing = await payload.find({ collection: 'projects', limit: 100 })
  if (existing.totalDocs > 0) {
    console.log(`Deleting ${existing.totalDocs} existing projects...`)
    for (const doc of existing.docs) {
      await payload.delete({
        collection: 'projects',
        id: doc.id,
        context: { disableRevalidate: true },
      })
    }
  }

  for (const p of projectsData) {
    console.log(`\nSeeding project: ${p.name}`)

    // Upload logo and preview
    const logoId = await uploadMedia(payload, p.logoFile, `${p.name} logo`)
    const previewId = await uploadMedia(payload, p.previewFile, `${p.name} preview`)

    // Upload menu PDF if exists
    let menuPdfId: number | undefined
    if (p.menuPdfFile) {
      menuPdfId = await uploadMedia(payload, p.menuPdfFile, `${p.name} menu`)
    }

    // Upload gallery images
    let gallery: { image: number }[] | undefined
    if (p.galleryFiles && p.galleryFiles.length > 0) {
      gallery = []
      for (const g of p.galleryFiles) {
        const imageId = await uploadMedia(payload, g.file, g.alt)
        gallery.push({ image: imageId })
      }
    }

    // Create project
    const projectData: Record<string, any> = {
      name: p.name,
      slug: p.slug,
      type: p.type,
      city: p.city,
      country: p.country,
      year: p.year,
      logo: logoId,
      preview: previewId,
      sortOrder: p.sortOrder,
      generateSlug: false,
    }
    if (p.description) projectData.description = p.description
    if (p.instagram) projectData.instagram = p.instagram
    if (menuPdfId) projectData.menuPdf = menuPdfId
    if (gallery && gallery.length > 0) projectData.gallery = gallery

    await payload.create({
      collection: 'projects',
      data: projectData,
      context: { disableRevalidate: true },
    })

    console.log(`  Created project: ${p.name}`)
  }

  console.log('\nAll projects seeded successfully!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
