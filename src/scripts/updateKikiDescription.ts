import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const NEW_DESCRIPTION =
  "Effortlessly stylish yet comfortably casual, Kiki brings a burst of joy to the table with its expertly crafted burgers and beautifully authentic cocktails. Inspired by Warsaw's easy energy and a global love for honest comfort food, the menu balances familiar favourites with playful twists and seasonal accents. Whether you're in heels or trainers, you're always welcome at Kiki — come for the flavours, stay for the atmosphere."

async function main() {
  const { Client } = await import('pg')
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const res = await client.query(
    `UPDATE projects SET description = $1 WHERE slug = $2 RETURNING slug, length(description) AS len`,
    [NEW_DESCRIPTION, 'kiki'],
  )
  console.log('updated rows:', res.rowCount, res.rows)
  await client.end()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
