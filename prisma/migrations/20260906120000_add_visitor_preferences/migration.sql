CREATE TYPE "availability_status" AS ENUM (
    'available',
    'unavailable',
    'unknown',
    'manual_check',
    'not_supported'
);

CREATE TABLE "visitor_preference_profiles" (
    "id" UUID NOT NULL,
    "visitor_hash" TEXT NOT NULL,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locale" TEXT,
    "country" TEXT,
    CONSTRAINT "visitor_preference_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "visitor_preference_profiles_visitor_hash_format_check"
        CHECK ("visitor_hash" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "visitor_preference_profiles_country_check"
        CHECK ("country" IS NULL OR "country" IN ('CH', 'AT', 'DE'))
);

CREATE TABLE "search_contexts" (
    "id" UUID NOT NULL,
    "visitor_hash" TEXT NOT NULL,
    "session_id" UUID,
    "canton" TEXT,
    "date" DATE,
    "date_from" DATE,
    "date_to" DATE,
    "guests" INTEGER,
    "saturday_only" BOOLEAN,
    "tag" TEXT,
    "elopement" BOOLEAN,
    "outdoor" BOOLEAN,
    "radius_km" INTEGER,
    "result_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_contexts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "search_contexts_guests_check" CHECK ("guests" IS NULL OR "guests" > 0),
    CONSTRAINT "search_contexts_radius_km_check" CHECK ("radius_km" IS NULL OR "radius_km" >= 0),
    CONSTRAINT "search_contexts_result_count_check" CHECK ("result_count" IS NULL OR "result_count" >= 0),
    CONSTRAINT "search_contexts_date_range_check" CHECK ("date_from" IS NULL OR "date_to" IS NULL OR "date_from" <= "date_to")
);

CREATE TABLE "favorite_venues" (
    "id" UUID NOT NULL,
    "visitor_hash" TEXT NOT NULL,
    "venue_id" UUID NOT NULL,
    "venue_slug" TEXT NOT NULL,
    "search_context_id" UUID,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(3),
    CONSTRAINT "favorite_venues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "availability_interests" (
    "id" UUID NOT NULL,
    "visitor_hash" TEXT NOT NULL,
    "session_id" UUID,
    "venue_id" UUID NOT NULL,
    "venue_slug" TEXT NOT NULL,
    "office_id" UUID,
    "requested_date" DATE,
    "requested_date_from" DATE,
    "requested_date_to" DATE,
    "availability_status" "availability_status" NOT NULL DEFAULT 'unknown',
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "availability_interests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "availability_interests_date_range_check"
        CHECK ("requested_date_from" IS NULL OR "requested_date_to" IS NULL OR "requested_date_from" <= "requested_date_to")
);

CREATE UNIQUE INDEX "visitor_preference_profiles_visitor_hash_key"
ON "visitor_preference_profiles"("visitor_hash");
CREATE INDEX "visitor_preference_profiles_last_seen_at_idx"
ON "visitor_preference_profiles"("last_seen_at" DESC);

CREATE INDEX "search_contexts_visitor_time_idx"
ON "search_contexts"("visitor_hash", "created_at" DESC);
CREATE INDEX "search_contexts_created_at_idx"
ON "search_contexts"("created_at" DESC);
CREATE INDEX "search_contexts_canton_time_idx"
ON "search_contexts"("canton", "created_at" DESC);
CREATE INDEX "search_contexts_date_idx" ON "search_contexts"("date");

-- One row per visitor and canonical venue. Removing sets removed_at; re-adding
-- reactivates the row and refreshes saved_at/search_context_id.
CREATE UNIQUE INDEX "favorite_venues_visitor_venue_key"
ON "favorite_venues"("visitor_hash", "venue_id");
CREATE INDEX "favorite_venues_venue_active_idx"
ON "favorite_venues"("venue_id", "removed_at");
CREATE INDEX "favorite_venues_venue_slug_idx" ON "favorite_venues"("venue_slug");
CREATE INDEX "favorite_venues_search_context_id_idx" ON "favorite_venues"("search_context_id");
CREATE INDEX "favorite_venues_saved_at_idx" ON "favorite_venues"("saved_at" DESC);

CREATE INDEX "availability_interests_visitor_time_idx"
ON "availability_interests"("visitor_hash", "checked_at" DESC);
CREATE INDEX "availability_interests_venue_time_idx"
ON "availability_interests"("venue_id", "checked_at" DESC);
CREATE INDEX "availability_interests_office_time_idx"
ON "availability_interests"("office_id", "checked_at" DESC);
CREATE INDEX "availability_interests_requested_date_idx"
ON "availability_interests"("requested_date");
CREATE INDEX "availability_interests_status_time_idx"
ON "availability_interests"("availability_status", "checked_at" DESC);

ALTER TABLE "search_contexts"
ADD CONSTRAINT "search_contexts_visitor_hash_fkey"
FOREIGN KEY ("visitor_hash") REFERENCES "visitor_preference_profiles"("visitor_hash")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorite_venues"
ADD CONSTRAINT "favorite_venues_visitor_hash_fkey"
FOREIGN KEY ("visitor_hash") REFERENCES "visitor_preference_profiles"("visitor_hash")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorite_venues"
ADD CONSTRAINT "favorite_venues_search_context_id_fkey"
FOREIGN KEY ("search_context_id") REFERENCES "search_contexts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "availability_interests"
ADD CONSTRAINT "availability_interests_visitor_hash_fkey"
FOREIGN KEY ("visitor_hash") REFERENCES "visitor_preference_profiles"("visitor_hash")
ON DELETE CASCADE ON UPDATE CASCADE;
