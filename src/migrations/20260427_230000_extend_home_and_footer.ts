import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const PROJECTS_HEADING_PREFIX = 'Discover'
const PROJECTS_HEADING_LINK_TEXT = 'all our projects'
const PROJECTS_HEADING_LINK_URL = '/projects'

const FOOTER_PARAGRAPHS = [
  'We have a strong intuition for understanding what our guests want and we strive to blend this insight with our passion for quality, comfort and creativity.',
  'Our journey is about building connections, crafting experiences, and making place where everyone feels welcome.',
]

const FOOTER_CTA_TEXT = 'See all projects'
const FOOTER_CTA_URL = '/projects'
const FOOTER_COOPERATION_HEADING = "Let's cooperate"

const FOOTER_CONTACTS: Array<{
  label: string | null
  linkText: string
  linkUrl: string
  opensInNewTab: boolean
}> = [
  {
    label: 'Work in Hive',
    linkText: 'hr.hivegroup@gmail.com',
    linkUrl: 'mailto:hr.hivegroup@gmail.com',
    opensInNewTab: false,
  },
  {
    label: 'Invest with us',
    linkText: 'hi.hivegroup@gmail.com',
    linkUrl: 'mailto:hi.hivegroup@gmail.com',
    opensInNewTab: false,
  },
  {
    label: null,
    linkText: '@hivegroup.ltd',
    linkUrl: 'https://instagram.com/hivegroup.ltd',
    opensInNewTab: true,
  },
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Extend home_page with projects heading columns.
  await db.execute(sql`
    ALTER TABLE "home_page"
      ADD COLUMN IF NOT EXISTS "projects_heading_prefix" varchar,
      ADD COLUMN IF NOT EXISTS "projects_heading_link_text" varchar,
      ADD COLUMN IF NOT EXISTS "projects_heading_link_url" varchar;
  `)

  // 2. Backfill projects heading defaults where missing.
  await db.execute(sql`
    UPDATE "home_page"
    SET
      "projects_heading_prefix" = COALESCE(NULLIF("projects_heading_prefix", ''), ${PROJECTS_HEADING_PREFIX}),
      "projects_heading_link_text" = COALESCE(NULLIF("projects_heading_link_text", ''), ${PROJECTS_HEADING_LINK_TEXT}),
      "projects_heading_link_url" = COALESCE(NULLIF("projects_heading_link_url", ''), ${PROJECTS_HEADING_LINK_URL}),
      "updated_at" = NOW();
  `)

  // 3. Mark new columns NOT NULL now that they have data.
  await db.execute(sql`
    ALTER TABLE "home_page"
      ALTER COLUMN "projects_heading_prefix" SET NOT NULL,
      ALTER COLUMN "projects_heading_link_text" SET NOT NULL,
      ALTER COLUMN "projects_heading_link_url" SET NOT NULL;
  `)

  // 4. Create site_footer parent + child arrays.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_footer" (
      "id" serial PRIMARY KEY NOT NULL,
      "cta_text" varchar NOT NULL,
      "cta_url" varchar NOT NULL,
      "cooperation_heading" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "site_footer_about_paragraphs" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "site_footer_contacts" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "link_text" varchar NOT NULL,
      "link_url" varchar NOT NULL,
      "opens_in_new_tab" boolean DEFAULT false
    );

    DO $$ BEGIN
      ALTER TABLE "site_footer_about_paragraphs"
        ADD CONSTRAINT "site_footer_about_paragraphs_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_footer"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "site_footer_contacts"
        ADD CONSTRAINT "site_footer_contacts_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_footer"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "site_footer_about_paragraphs_order_idx"
      ON "site_footer_about_paragraphs" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_footer_about_paragraphs_parent_id_idx"
      ON "site_footer_about_paragraphs" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_footer_contacts_order_idx"
      ON "site_footer_contacts" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_footer_contacts_parent_id_idx"
      ON "site_footer_contacts" USING btree ("_parent_id");
  `)

  // 5. Seed site_footer with default values if empty.
  const existing = await db.execute(sql`SELECT id FROM "site_footer" LIMIT 1;`)
  const rows = (existing as unknown as { rows?: Array<{ id: number }> }).rows ?? []
  let footerId: number

  if (rows.length === 0) {
    const inserted = await db.execute(sql`
      INSERT INTO "site_footer" ("cta_text", "cta_url", "cooperation_heading", "updated_at", "created_at")
      VALUES (${FOOTER_CTA_TEXT}, ${FOOTER_CTA_URL}, ${FOOTER_COOPERATION_HEADING}, NOW(), NOW())
      RETURNING id;
    `)
    footerId = (inserted as unknown as { rows: Array<{ id: number }> }).rows[0].id
  } else {
    footerId = rows[0].id
  }

  const paraCount = await db.execute(
    sql`SELECT COUNT(*)::int AS c FROM "site_footer_about_paragraphs" WHERE "_parent_id" = ${footerId};`,
  )
  if (((paraCount as unknown as { rows: Array<{ c: number }> }).rows[0]?.c ?? 0) === 0) {
    for (let i = 0; i < FOOTER_PARAGRAPHS.length; i++) {
      const id = `seed-fp-${footerId}-${i + 1}`
      await db.execute(sql`
        INSERT INTO "site_footer_about_paragraphs" ("_order", "_parent_id", "id", "text")
        VALUES (${i + 1}, ${footerId}, ${id}, ${FOOTER_PARAGRAPHS[i]});
      `)
    }
  }

  const contactsCount = await db.execute(
    sql`SELECT COUNT(*)::int AS c FROM "site_footer_contacts" WHERE "_parent_id" = ${footerId};`,
  )
  if (((contactsCount as unknown as { rows: Array<{ c: number }> }).rows[0]?.c ?? 0) === 0) {
    for (let i = 0; i < FOOTER_CONTACTS.length; i++) {
      const c = FOOTER_CONTACTS[i]
      const id = `seed-fc-${footerId}-${i + 1}`
      await db.execute(sql`
        INSERT INTO "site_footer_contacts" ("_order", "_parent_id", "id", "label", "link_text", "link_url", "opens_in_new_tab")
        VALUES (${i + 1}, ${footerId}, ${id}, ${c.label}, ${c.linkText}, ${c.linkUrl}, ${c.opensInNewTab});
      `)
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_footer_about_paragraphs" CASCADE;
    DROP TABLE IF EXISTS "site_footer_contacts" CASCADE;
    DROP TABLE IF EXISTS "site_footer" CASCADE;

    ALTER TABLE "home_page"
      DROP COLUMN IF EXISTS "projects_heading_prefix",
      DROP COLUMN IF EXISTS "projects_heading_link_text",
      DROP COLUMN IF EXISTS "projects_heading_link_url";
  `)
}
