CREATE TABLE "website_leads" (
    "id" UUID NOT NULL,
    "lead_type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL DEFAULT '',
    "payload" JSONB NOT NULL,
    "dedupe_wedding_date" TEXT,
    "dedupe_location" TEXT,
    "duplicate_of_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "website_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "website_leads_dedupe_idx"
ON "website_leads"("lead_type", lower("email"), "dedupe_wedding_date", "dedupe_location");

CREATE INDEX "website_leads_created_at_idx"
ON "website_leads"("created_at" DESC);