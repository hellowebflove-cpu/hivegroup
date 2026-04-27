export interface ProjectGalleryImage {
  src: string
  alt: string
}

export interface Project {
  slug: string
  name: string
  type: string
  city: string
  country: string
  year: number
  logo: string
  preview: string
  description?: string
  instagram?: string
  menuPdf?: string
  gallery?: ProjectGalleryImage[]
}

export const projects: Project[] = [
  {
    slug: 'bunch',
    name: 'Bunch',
    type: 'cafe',
    city: 'Warsaw',
    country: 'Poland',
    year: 2024,
    logo: '/projects/bunch/logo.webp',
    preview: '/projects/bunch/preview.webp',
  },
  {
    slug: 'parbar',
    name: 'Par Bar',
    type: 'network of bars',
    city: 'Kyiv',
    country: 'Ukraine',
    year: 2015,
    logo: '/projects/parbar/logo.webp',
    preview: '/projects/parbar/preview.webp',
  },
  {
    slug: 'kiki',
    name: 'Kiki',
    type: 'burger cafe',
    city: 'Warsaw',
    country: 'Poland',
    year: 2025,
    logo: '/projects/kiki/logo.webp',
    preview: '/projects/kiki/preview.webp',
    instagram: 'kiki.warszawa',
    menuPdf: '/projects/kiki/menu.pdf',
    description:
      'Effortlessly stylish yet comfortably casual, Kiki brings a burst of joy to the table with its expertly crafted burgers and beautifully authentic cocktails. Inspired by Warsaw\'s easy energy and a global love for honest comfort food, the menu balances familiar favourites with playful twists and seasonal accents. Whether you\'re in heels or trainers, you\'re always welcome at Kiki — come for the flavours, stay for the atmosphere.',
    gallery: [
      { src: '/projects/kiki/gallery/01-food-wraps.webp', alt: 'Kiki signature wraps' },
      { src: '/projects/kiki/gallery/02-interior-bar.webp', alt: 'Kiki bar interior' },
      { src: '/projects/kiki/gallery/03-food-overhead.webp', alt: 'Food overhead shot' },
      { src: '/projects/kiki/gallery/04-food-prep.webp', alt: 'Food preparation' },
      { src: '/projects/kiki/gallery/05-cocktails.webp', alt: 'Cocktail crafting' },
      { src: '/projects/kiki/gallery/06-cocktail-red.webp', alt: 'Signature red cocktail' },
      { src: '/projects/kiki/gallery/07-greenery.webp', alt: 'Fresh ingredients' },
      { src: '/projects/kiki/gallery/08-food-plating.webp', alt: 'Plated dish' },
      { src: '/projects/kiki/gallery/09-burger-closeup.webp', alt: 'Burger close-up' },
      { src: '/projects/kiki/gallery/10-interior-atmosphere.webp', alt: 'Interior atmosphere' },
      { src: '/projects/kiki/gallery/11-interior-panoramic.webp', alt: 'Panoramic interior view' },
    ],
  },
]
