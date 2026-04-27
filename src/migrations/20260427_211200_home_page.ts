import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "home_page_services" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "home_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "hero_subtitle" varchar NOT NULL,
      "mission_text" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    DO $$ BEGIN
      ALTER TABLE "home_page_services"
        ADD CONSTRAINT "home_page_services_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "home_page_services_order_idx"
      ON "home_page_services" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "home_page_services_parent_id_idx"
      ON "home_page_services" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "home_page_services" CASCADE;
    DROP TABLE IF EXISTS "home_page" CASCADE;
  `)
}
