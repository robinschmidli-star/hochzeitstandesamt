CREATE TABLE "verification_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "office_id" uuid NOT NULL,
  "venue_id" uuid, "parent_request_id" uuid REFERENCES "verification_requests"("id"),
  "token_hash" text NOT NULL UNIQUE, "language_code" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active', "source_type" text NOT NULL,
  "source_name" text NOT NULL, "snapshot" jsonb NOT NULL, "expires_at" timestamptz NOT NULL,
  "submitted_at" timestamptz, "completed_at" timestamptz, "revoked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" text, "updated_by" text,
  CONSTRAINT "verification_requests_language_check" CHECK (language_code IN ('de','fr','it')),
  CONSTRAINT "verification_requests_status_check" CHECK (status IN ('active','submitted','completed','expired','revoked'))
);
CREATE INDEX "verification_requests_office_status_idx" ON "verification_requests"("office_id","status");
CREATE INDEX "verification_requests_expiry_idx" ON "verification_requests"("expires_at");

CREATE TABLE "verification_change_proposals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "verification_request_id" uuid NOT NULL REFERENCES "verification_requests"("id"),
  "office_id" uuid NOT NULL, "venue_id" uuid, "entity_type" text NOT NULL, "entity_id" uuid NOT NULL,
  "field_name" text NOT NULL, "old_value" jsonb, "proposed_value" jsonb, "source_type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending', "reviewed_at" timestamptz, "reviewed_by" text,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" text, "updated_by" text
);
CREATE INDEX "verification_proposals_review_idx" ON "verification_change_proposals"("status","created_at");

CREATE TABLE "field_verifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "entity_type" text NOT NULL, "entity_id" uuid NOT NULL,
  "field_name" text NOT NULL, "verified_value" jsonb, "value_hash" text NOT NULL,
  "verified_at" timestamptz NOT NULL, "verified_by_type" text NOT NULL, "verified_by_name" text NOT NULL,
  "verification_request_id" uuid NOT NULL REFERENCES "verification_requests"("id"), "status" text NOT NULL DEFAULT 'active',
  "invalidated_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" text, "updated_by" text,
  UNIQUE("entity_type","entity_id","field_name","verified_by_type")
);
CREATE INDEX "field_verifications_public_idx" ON "field_verifications"("entity_type","entity_id","status");

CREATE TABLE "verification_review_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "proposal_id" uuid NOT NULL REFERENCES "verification_change_proposals"("id"),
  "decision" text NOT NULL, "reviewed_by" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now()
);
