import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Hive Group creates unique restaurant concepts worldwide. We blend cutting-edge ideas, creativity and expertise to craft spaces where guests enjoy atmosphere, flavor and unforgettable experiences.',
  images: [
    {
      url: `${getServerSideURL()}/og-image.png`,
    },
  ],
  siteName: 'Hive Group',
  title: 'Hive Group — Restaurant Concept Development',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
