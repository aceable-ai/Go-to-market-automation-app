-- Migration 0005: Add asset pickup fields
ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS copy TEXT,
  ADD COLUMN IF NOT EXISTS jira_ticket TEXT,
  ADD COLUMN IF NOT EXISTS picked_up BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
