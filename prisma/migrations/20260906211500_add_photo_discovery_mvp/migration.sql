CREATE TABLE "photographers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "website_url" TEXT,
  "instagram_handle" TEXT,
  "email" TEXT,
  "region" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "photographers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "photographers_website_url_key" ON "photographers"("website_url") WHERE "website_url" IS NOT NULL;
CREATE INDEX "photographers_name_idx" ON "photographers"("name");

CREATE TABLE "photo_leads" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "target_type" TEXT NOT NULL DEFAULT 'venue',
  "target_canonical_id" TEXT,
  "target_slug" TEXT NOT NULL,
  "photographer_id" UUID,
  "source" TEXT NOT NULL,
  "source_url" TEXT NOT NULL,
  "image_url" TEXT,
  "post_date" TIMESTAMP(3),
  "confidence" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'found',
  "contacted_at" TIMESTAMP(3),
  "last_checked_at" TIMESTAMP(3),
  "fingerprint" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "photo_leads_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "photo_leads_photographer_id_fkey" FOREIGN KEY ("photographer_id") REFERENCES "photographers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "photo_leads_confidence_check" CHECK ("confidence" >= 0 AND "confidence" <= 100)
);

CREATE UNIQUE INDEX "photo_leads_fingerprint_key" ON "photo_leads"("fingerprint");
CREATE UNIQUE INDEX "photo_leads_source_url_key" ON "photo_leads"("source_url");
CREATE INDEX "photo_leads_target_idx" ON "photo_leads"("target_type", "target_slug");
CREATE INDEX "photo_leads_status_idx" ON "photo_leads"("status", "confidence" DESC);
CREATE INDEX "photo_leads_photographer_idx" ON "photo_leads"("photographer_id");

CREATE TABLE "photo_permissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "photo_lead_id" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "requested_at" TIMESTAMP(3),
  "responded_at" TIMESTAMP(3),
  "usage_terms" TEXT,
  "attribution_required" BOOLEAN NOT NULL DEFAULT TRUE,
  "attribution_text" TEXT,
  "attribution_url" TEXT,
  "proof_reference" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "photo_permissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "photo_permissions_photo_lead_id_fkey" FOREIGN KEY ("photo_lead_id") REFERENCES "photo_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "photo_permissions_photo_lead_id_key" ON "photo_permissions"("photo_lead_id");
CREATE INDEX "photo_permissions_status_idx" ON "photo_permissions"("status");

CREATE TABLE "venue_photos" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "target_canonical_id" TEXT,
  "target_slug" TEXT NOT NULL,
  "photo_lead_id" UUID,
  "image_url" TEXT NOT NULL,
  "alt_text" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "photographer_name" TEXT,
  "attribution_text" TEXT,
  "attribution_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "venue_photos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "venue_photos_photo_lead_id_fkey" FOREIGN KEY ("photo_lead_id") REFERENCES "photo_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "venue_photos_target_idx" ON "venue_photos"("target_slug", "active", "sort_order");
CREATE INDEX "venue_photos_photo_lead_idx" ON "venue_photos"("photo_lead_id");
