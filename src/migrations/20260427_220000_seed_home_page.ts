import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const HERO_SUBTITLE = `Creation of unique restaurant concepts worldwide.

We combine cutting-edge ideas, creativity and expertise to craft spaces,
where guests can enjoy atmosphere and flavor. Our restaurants are places
to dine, spaces for interaction and unforgettable experiences.`

const MISSION_TEXT =
  'Our Mission is to create unique restaurant concepts that blend cultural heritage with contemporary trends. We aim to be leaders in hospitality innovation, offering our guests fresh, memorable experiences in each of our venues.'

const SERVICES = [
  'Restaurant concept',
  'Development and branding',
  'Staff recruitment',
  'Training',
  'Management',
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const existing = await db.execute(sql`SELECT id FROM "home_page" LIMIT 1;`)
  const rows = (existing as unknown as { rows?: Array<{ id: number }> }).rows ?? []
  let homeId: number

  if (rows.length === 0) {
    const inserted = await db.execute(sql`
      INSERT INTO "home_page" ("hero_subtitle", "mission_text", "updated_at", "created_at")
      VALUES (${HERO_SUBTITLE}, ${MISSION_TEXT}, NOW(), NOW())
      RETURNING id;
    `)
    const insertedRows = (inserted as unknown as { rows: Array<{ id: number }> }).rows
    homeId = insertedRows[0].id
  } else {
    homeId = rows[0].id
    await db.execute(sql`
      UPDATE "home_page"
      SET "hero_subtitle" = ${HERO_SUBTITLE},
          "mission_text" = ${MISSION_TEXT},
          "updated_at" = NOW()
      WHERE id = ${homeId}
        AND (COALESCE("hero_subtitle", '') = '' OR COALESCE("mission_text", '') = '');
    `)
  }

  const servicesCount = await db.execute(
    sql`SELECT COUNT(*)::int AS c FROM "home_page_services" WHERE "_parent_id" = ${homeId};`,
  )
  const countRows = (servicesCount as unknown as { rows: Array<{ c: number }> }).rows
  if ((countRows[0]?.c ?? 0) === 0) {
    for (let i = 0; i < SERVICES.length; i++) {
      const label = SERVICES[i]
      const id = `seed-${homeId}-${i + 1}`
      await db.execute(sql`
        INSERT INTO "home_page_services" ("_order", "_parent_id", "id", "label")
        VALUES (${i + 1}, ${homeId}, ${id}, ${label});
      `)
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: seed data should not be auto-removed on rollback.
}
