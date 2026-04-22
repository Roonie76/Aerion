-- Phase 1: order_requests (cancel / return workflow)
-- Idempotent: safe to re-run.

DO $$ BEGIN
  CREATE TYPE req_type AS ENUM ('cancel','return');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE req_status AS ENUM ('pending','approved','rejected','info_needed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS order_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type            req_type NOT NULL,
  status          req_status NOT NULL DEFAULT 'pending',
  customer_msg    TEXT NOT NULL,
  llm_decision    VARCHAR(12),
  llm_reason      TEXT,
  customer_reply  TEXT,
  photo_needed    BOOLEAN NOT NULL DEFAULT FALSE,
  photo_url       TEXT,
  raw_llm_json    JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_order_requests_order_id ON order_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_status  ON order_requests(status);
