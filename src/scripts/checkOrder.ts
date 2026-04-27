import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

async function main() {
  const { Client } = await import('pg')
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const res = await client.query(
    `SELECT slug, name, sort_order FROM projects ORDER BY sort_order`,
  )
  console.table(res.rows)
  await client.end()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
