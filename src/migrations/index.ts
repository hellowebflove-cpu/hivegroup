import * as migration_20260427_211200_home_page from './20260427_211200_home_page'
import * as migration_20260427_220000_seed_home_page from './20260427_220000_seed_home_page'
import * as migration_20260427_230000_extend_home_and_footer from './20260427_230000_extend_home_and_footer'

export const migrations = [
  {
    up: migration_20260427_211200_home_page.up,
    down: migration_20260427_211200_home_page.down,
    name: '20260427_211200_home_page',
  },
  {
    up: migration_20260427_220000_seed_home_page.up,
    down: migration_20260427_220000_seed_home_page.down,
    name: '20260427_220000_seed_home_page',
  },
  {
    up: migration_20260427_230000_extend_home_and_footer.up,
    down: migration_20260427_230000_extend_home_and_footer.down,
    name: '20260427_230000_extend_home_and_footer',
  },
]
