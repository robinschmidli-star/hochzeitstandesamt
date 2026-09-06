CREATE TABLE "availability_sources" (
    "id" UUID NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_canonical_id" TEXT,
    "target_slug" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "connector_key" TEXT NOT NULL,
    "source_quality" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "sync_frequency_minutes" INTEGER NOT NULL DEFAULT 1440,
    "last_checked_at" TIMESTAMPTZ,
    "last_success_at" TIMESTAMPTZ,
    "last_changed_at" TIMESTAMPTZ,
    "last_error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "availability_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "availability_slots" (
    "id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "external_key" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_at" TIMESTAMPTZ,
    "end_at" TIMESTAMPTZ,
    "status" TEXT NOT NULL,
    "precision" TEXT NOT NULL,
    "checked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_updated_at" TIMESTAMPTZ,
    "raw_reference" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "availability_slots_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "availability_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "availability_sync_runs" (
    "id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "status" TEXT NOT NULL DEFAULT 'running',
    "checked_sources" INTEGER NOT NULL DEFAULT 0,
    "successful_sources" INTEGER NOT NULL DEFAULT 0,
    "failed_sources" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    CONSTRAINT "availability_sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "availability_sources_target_source_key"
ON "availability_sources"("target_type", "target_slug", "source_url");

CREATE INDEX "availability_sources_active_checked_idx"
ON "availability_sources"("active", "last_checked_at");

CREATE INDEX "availability_sources_canonical_idx"
ON "availability_sources"("target_canonical_id");

CREATE INDEX "availability_sources_target_idx"
ON "availability_sources"("target_type", "target_slug");

CREATE UNIQUE INDEX "availability_slots_source_external_key"
ON "availability_slots"("source_id", "external_key");

CREATE INDEX "availability_slots_date_status_idx"
ON "availability_slots"("date", "status");

CREATE INDEX "availability_slots_source_date_idx"
ON "availability_slots"("source_id", "date");

CREATE INDEX "availability_sync_runs_started_idx"
ON "availability_sync_runs"("started_at" DESC);