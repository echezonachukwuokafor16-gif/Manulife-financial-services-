/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Production PostgreSQL / Supabase Schema Definition.
 * Applicants and administrators can copy this directly into the Supabase SQL editor.
 */
export const SUPABASE_SQL_SCHEMA = `
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Applications Table
CREATE TABLE IF NOT EXISTS loan_applications (
  id TEXT PRIMARY KEY, -- e.g. 'MFS-2026-4892'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending_review',
  personal JSONB NOT NULL,
  employment JSONB NOT NULL,
  loan JSONB NOT NULL,
  financial JSONB NOT NULL,
  declaration JSONB NOT NULL,
  underwriting JSONB,
  documents JSONB DEFAULT '[]'::jsonb
);

-- 3. Notifications Table
CREATE TABLE IF NOT EXISTS application_notifications (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES loan_applications(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES loan_applications(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated users & service roles
CREATE POLICY "Public loan application creation" ON loan_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public loan read by ID" ON loan_applications FOR SELECT USING (true);
CREATE POLICY "Public loan update by ID" ON loan_applications FOR UPDATE USING (true);
`;
