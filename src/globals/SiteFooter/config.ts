import type { GlobalConfig } from 'payload'
import { revalidateSiteFooter } from './hooks/revalidateSiteFooter'

export const SiteFooter: GlobalConfig = {
  slug: 'site-footer',
  label: 'Site Footer',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Editable copy for the global site footer (about, CTA, contacts).',
  },
  fields: [
    {
      name: 'aboutParagraphs',
      label: 'About paragraphs',
      type: 'array',
      minRows: 1,
      maxRows: 5,
      admin: {
        description: 'Centered paragraphs above the CTA button.',
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
          admin: { rows: 3 },
        },
      ],
    },
    {
      name: 'ctaText',
      label: 'CTA button text',
      type: 'text',
      required: true,
    },
    {
      name: 'ctaUrl',
      label: 'CTA button URL',
      type: 'text',
      required: true,
      admin: { description: 'Internal path or external URL. E.g. "/projects".' },
    },
    {
      name: 'cooperationHeading',
      label: 'Cooperation heading',
      type: 'text',
      required: true,
      admin: { description: 'Large heading. E.g. "Let\'s cooperate".' },
    },
    {
      name: 'contacts',
      label: 'Contacts row',
      type: 'array',
      minRows: 1,
      maxRows: 10,
      admin: {
        description: 'Each row renders as one item in the contacts row at the bottom.',
      },
      fields: [
        {
          name: 'label',
          label: 'Label (left of the link)',
          type: 'text',
          admin: { description: 'Optional. E.g. "Work in Hive". Leave empty for handle-only entries like Instagram.' },
        },
        {
          name: 'linkText',
          label: 'Link text',
          type: 'text',
          required: true,
          admin: { description: 'E.g. "hr.hivegroup@gmail.com" or "@hivegroup.ltd".' },
        },
        {
          name: 'linkUrl',
          label: 'Link URL',
          type: 'text',
          required: true,
          admin: { description: 'E.g. "mailto:hr.hivegroup@gmail.com" or "https://instagram.com/hivegroup.ltd".' },
        },
        {
          name: 'opensInNewTab',
          label: 'Open in new tab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteFooter],
  },
}
