import type { GlobalConfig } from 'payload'
import { revalidateHomePage } from './hooks/revalidateHomePage'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Editable copy for the home page (hero, services, mission). Layout is fixed in code.',
  },
  fields: [
    {
      name: 'heroSubtitle',
      label: 'Hero subtitle',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Shown on the hero video. Use blank lines for paragraph breaks; single newlines = line breaks.',
        rows: 6,
      },
    },
    {
      name: 'services',
      label: 'Services',
      type: 'array',
      minRows: 1,
      maxRows: 10,
      admin: {
        description: 'Each row is one line in the centered services list.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'missionText',
      label: 'Mission text',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Paragraph shown below the services list.',
        rows: 4,
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHomePage],
  },
}
