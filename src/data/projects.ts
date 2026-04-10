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
    preview: '/projects/bunch/preview.png',
  },
  {
    slug: 'parbar',
    name: 'Par Bar',
    type: 'network of bars',
    city: 'Kyiv',
    country: 'Ukraine',
    year: 2015,
    logo: '/projects/parbar/logo.png',
    preview: '/projects/parbar/preview.png',
  },
  {
    slug: 'kiki',
    name: 'Kiki',
    type: 'burger cafe',
    city: 'Warsaw',
    country: 'Poland',
    year: 2025,
    logo: '/projects/kiki/logo.png',
    preview: '/projects/kiki/preview.jpg',
    instagram: 'kiki.warszawa',
    menuPdf: '/projects/kiki/menu.pdf',
    description:
      'Effortlessly stylish yet comfortably casual, Kiki brings a burst of joy to the table with its expertly crafted burgers and beautifully authentic cocktails. Whether you\'re in heels or trainers, you\'re always welcome at Kiki. Come for the flavours, stay for the atmosphere.',
    gallery: [
      { src: '/projects/kiki/gallery/01-food-wraps.jpg', alt: 'Kiki signature wraps' },
      { src: '/projects/kiki/gallery/02-interior-bar.jpg', alt: 'Kiki bar interior' },
      { src: '/projects/kiki/gallery/03-food-overhead.jpg', alt: 'Food overhead shot' },
      { src: '/projects/kiki/gallery/04-food-prep.jpg', alt: 'Food preparation' },
      { src: '/projects/kiki/gallery/05-cocktails.jpg', alt: 'Cocktail crafting' },
      { src: '/projects/kiki/gallery/06-cocktail-red.webp', alt: 'Signature red cocktail' },
      { src: '/projects/kiki/gallery/07-greenery.jpg', alt: 'Fresh ingredients' },
      { src: '/projects/kiki/gallery/08-food-plating.jpg', alt: 'Plated dish' },
      { src: '/projects/kiki/gallery/09-burger-closeup.jpg', alt: 'Burger close-up' },
      { src: '/projects/kiki/gallery/10-interior-atmosphere.jpg', alt: 'Interior atmosphere' },
      { src: '/projects/kiki/gallery/11-interior-panoramic.jpg', alt: 'Panoramic interior view' },
    ],
  },
]
