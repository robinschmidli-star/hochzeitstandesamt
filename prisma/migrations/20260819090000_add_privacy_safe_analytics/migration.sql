CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "event_name" TEXT NOT NULL,
    "session_id" UUID NOT NULL,
    "visitor_hash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'CH',
    "properties" JSONB NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "analytics_events_occurred_at_idx" ON "analytics_events"("occurred_at" DESC);
CREATE INDEX "analytics_events_name_time_idx" ON "analytics_events"("event_name", "occurred_at" DESC);
