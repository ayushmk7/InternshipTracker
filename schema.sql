-- Run this in Neon SQL Editor (Vercel Storage > Postgres) to create the table

CREATE TABLE IF NOT EXISTS internship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL,
  inbox_id TEXT NOT NULL,
  company_name TEXT,
  role_title TEXT,
  status TEXT NOT NULL CHECK (status IN ('offered', 'oa', 'interviewing')),
  sender_email TEXT,
  subject TEXT,
  email_body_preview TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_received_at ON internship_applications(received_at DESC);
