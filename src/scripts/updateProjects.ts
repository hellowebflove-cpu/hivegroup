import 'dotenv/config'
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'
import fs from 'fs'
import config from '../payload.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const projectsDir = path.resolve(dirname, '../../public/projects')

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

async function run() {
  const payload = await getPayload({ config })

  // --- UPDATE BUNCH ---
  console.log('\n=== Updating Bunch ===')

  const bunchGalleryFiles = [
    { file: 'bunch/gallery/01-interior-portrait.jpg', alt: 'Purple cocktail with cherry on marble countertop' },
    { file: 'bunch/gallery/02-interior-dining.jpg', alt: 'Cafe BUNCH exterior facade with illuminated sign' },
    { file: 'bunch/gallery/03-food-detail.jpg', alt: 'Salad dish on decorative plate' },
    { file: 'bunch/gallery/04-cafe-detail.jpg', alt: 'Guest with wine glass at dinner' },
    { file: 'bunch/gallery/05-atmosphere.jpg', alt: 'Salmon dish with broccoli' },
    { file: 'bunch/gallery/06-cafe-bunch-sign.png', alt: 'Marble tables with candles and wine glasses' },
    { file: 'bunch/gallery/07-wine-food.jpg', alt: 'Interior dining room with cloud-shaped wall lamps' },
    { file: 'bunch/gallery/08-evening-candle.jpg', alt: 'Lemon tart dessert on silver tray' },
    { file: 'bunch/gallery/09-guest-portrait.jpg', alt: 'Passionfruit cocktail being poured' },
    { file: 'bunch/gallery/10-food-plating.jpg', alt: 'Steak dish with red wine and candlelight' },
    { file: 'bunch/gallery/11-interior-wide.jpg', alt: 'Fresh salad on vintage leather chair' },
    { file: 'bunch/gallery/12-cafe-closeup.jpg', alt: 'Tiramisu dessert in coupe glass' },
  ]

  const bunchGallery: { image: number }[] = []
  for (const g of bunchGalleryFiles) {
    const imageId = await uploadMedia(payload, g.file, g.alt)
    bunchGallery.push({ image: imageId })
  }

  // Find Bunch project
  const bunchResult = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'bunch' } },
    limit: 1,
  })

  if (bunchResult.docs.length > 0) {
    await payload.update({
      collection: 'projects',
      id: bunchResult.docs[0].id,
      data: {
        description:
          'BUNCH is where good food meets great moments. Mornings are for lingering over warm, comforting breakfasts, while evenings invite you to unwind with natural wine and soft candlelight. Perfect for date nights, brunch with the girls, or simply settling into the cozy, welcoming atmosphere.',
        instagram: 'cafe.bunch',
        gallery: bunchGallery,
      },
      context: { disableRevalidate: true },
    })
    console.log('  Updated Bunch project!')
  }

  // --- UPDATE PAR BAR ---
  console.log('\n=== Updating Par Bar ===')

  const parbarGalleryFiles = [
    { file: 'parbar/gallery/03-gallery-interior.webp', alt: 'Par Bar terrace with outdoor seating' },
    { file: 'parbar/gallery/04-gallery-atmosphere.webp', alt: 'Guests at the bar in candlelight' },
    { file: 'parbar/gallery/05-gallery-wide.webp', alt: 'Panoramic interior with neon Par Bar sign' },
  ]

  const parbarGallery: { image: number }[] = []
  for (const g of parbarGalleryFiles) {
    const imageId = await uploadMedia(payload, g.file, g.alt)
    parbarGallery.push({ image: imageId })
  }

  // Find Par Bar project
  const parbarResult = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'parbar' } },
    limit: 1,
  })

  if (parbarResult.docs.length > 0) {
    await payload.update({
      collection: 'projects',
      id: parbarResult.docs[0].id,
      data: {
        description:
          'First Par Bar blends European and Asian cuisine with expertly crafted cocktails and premium hookahs. More than a restaurant, it redefines the hookah experience with style and sophistication. A place to unwind, connect, and enjoy the moment.',
        instagram: 'par.bar',
        gallery: parbarGallery,
      },
      context: { disableRevalidate: true },
    })
    console.log('  Updated Par Bar project!')
  }

  console.log('\nAll projects updated successfully!')
  process.exit(0)
}

run().catch((err) => {
  console.error('Update failed:', err)
  process.exit(1)
})
