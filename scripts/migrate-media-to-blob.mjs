import { put, list } from '@vercel/blob'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../.env.local') })
const MEDIA_DIR = path.resolve(__dirname, '../public/media')
const token = process.env.BLOB_READ_WRITE_TOKEN

if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN missing')
  process.exit(1)
}

const existing = new Set()
let cursor
do {
  const page = await list({ token, cursor, limit: 1000 })
  for (const b of page.blobs) existing.add(b.pathname)
  cursor = page.cursor
} while (cursor)

console.log(`Already in blob: ${existing.size}`)

const files = (await readdir(MEDIA_DIR)).filter((f) => !f.startsWith('.'))
console.log(`Local files:     ${files.length}`)

let uploaded = 0
let skipped = 0
let failed = 0

for (const name of files) {
  const fp = path.join(MEDIA_DIR, name)
  const s = await stat(fp)
  if (!s.isFile()) continue
  if (existing.has(name)) {
    skipped++
    continue
  }
  try {
    const buf = await readFile(fp)
    await put(name, buf, {
      access: 'public',
      token,
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    uploaded++
    if (uploaded % 20 === 0) console.log(`  uploaded ${uploaded}/${files.length}`)
  } catch (e) {
    failed++
    console.error(`  FAIL ${name}: ${e.message}`)
  }
}

console.log(`\nDone. uploaded=${uploaded} skipped=${skipped} failed=${failed}`)
