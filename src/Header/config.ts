import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Top navigation bar links (left, center, right).',
  },
  fields: [
    {
      type: 'group',
      name: 'leftLink',
      label: 'Left link',
      fields: [
        { name: 'text', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, admin: { description: 'E.g. "/contacts".' } },
      ],
    },
    {
      type: 'group',
      name: 'centerLink',
      label: 'Center link (shown on non-home pages only)',
      fields: [
        { name: 'text', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, admin: { description: 'E.g. "/".' } },
      ],
    },
    {
      type: 'group',
      name: 'rightLink',
      label: 'Right link',
      fields: [
        { name: 'text', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, admin: { description: 'E.g. "/projects".' } },
      ],
    },
    {
      name: 'navItems',
      label: 'Legacy nav items (unused — kept for compatibility)',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        description: 'Legacy field, not rendered. Use the three link fields above.',
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
