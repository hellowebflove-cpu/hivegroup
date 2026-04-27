import * as migration_20260427_211200_home_page from './20260427_211200_home_page'

export const migrations = [
  {
    up: migration_20260427_211200_home_page.up,
    down: migration_20260427_211200_home_page.down,
    name: '20260427_211200_home_page',
  },
]
