import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const LEFT_TEXT = 'Contacts'
const LEFT_URL = '/contacts'
const CENTER_TEXT = 'Hive Group®'
const CENTER_URL = '/'
const RIGHT_TEXT = 'Projects'
const RIGHT_URL = '/projects'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Add new columns (group fields are flattened to <group>_<field>).
  await db.execute(sql`
    ALTER TABLE "header"
      ADD COLUMN IF NOT EXISTS "left_link_text" varchar,
      ADD COLUMN IF NOT EXISTS "left_link_url" varchar,
      ADD COLUMN IF NOT EXISTS "center_link_text" varchar,
      ADD COLUMN IF NOT EXISTS "center_link_url" varchar,
      ADD COLUMN IF NOT EXISTS "right_link_text" varchar,
      ADD COLUMN IF NOT EXISTS "right_link_url" varchar;
  `)

  // 2. Ensure a header row exists so the global is editable in admin.
  const existing = await db.execute(sql`SELECT id FROM "header" LIMIT 1;`)
  const rows = (existing as unknown as { rows?: Array<{ id: number }> }).rows ?? []

  if (rows.length === 0) {
    await db.execute(sql`
      INSERT INTO "header" (
        "left_link_text", "left_link_url",
        "center_link_text", "center_link_url",
        "right_link_text", "right_link_url",
        "updated_at", "created_at"
      ) VALUES (
        ${LEFT_TEXT}, ${LEFT_URL},
        ${CENTER_TEXT}, ${CENTER_URL},
        ${RIGHT_TEXT}, ${RIGHT_URL},
        NOW(), NOW()
      );
    `)
  } else {
    // 3. Backfill defaults only where empty.
    await db.execute(sql`
      UPDATE "header"
      SET
        "left_link_text" = COALESCE(NULLIF("left_link_text", ''), ${LEFT_TEXT}),
        "left_link_url" = COALESCE(NULLIF("left_link_url", ''), ${LEFT_URL}),
        "center_link_text" = COALESCE(NULLIF("center_link_text", ''), ${CENTER_TEXT}),
        "center_link_url" = COALESCE(NULLIF("center_link_url", ''), ${CENTER_URL}),
        "right_link_text" = COALESCE(NULLIF("right_link_text", ''), ${RIGHT_TEXT}),
        "right_link_url" = COALESCE(NULLIF("right_link_url", ''), ${RIGHT_URL}),
        "updated_at" = NOW();
    `)
  }

  // 4. Mark NOT NULL now that defaults are populated.
  await db.execute(sql`
    ALTER TABLE "header"
      ALTER COLUMN "left_link_text" SET NOT NULL,
      ALTER COLUMN "left_link_url" SET NOT NULL,
      ALTER COLUMN "center_link_text" SET NOT NULL,
      ALTER COLUMN "center_link_url" SET NOT NULL,
      ALTER COLUMN "right_link_text" SET NOT NULL,
      ALTER COLUMN "right_link_url" SET NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "header"
      DROP COLUMN IF EXISTS "left_link_text",
      DROP COLUMN IF EXISTS "left_link_url",
      DROP COLUMN IF EXISTS "center_link_text",
      DROP COLUMN IF EXISTS "center_link_url",
      DROP COLUMN IF EXISTS "right_link_text",
      DROP COLUMN IF EXISTS "right_link_url";
  `)
}
