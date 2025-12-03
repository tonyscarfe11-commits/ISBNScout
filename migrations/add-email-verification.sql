-- Email Verification Migration
-- Add email verification fields to users table
-- Run this on both PostgreSQL (production) and SQLite (local)

-- PostgreSQL Migration
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified TEXT NOT NULL DEFAULT 'false',
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token
ON users(email_verification_token)
WHERE email_verification_token IS NOT NULL;

-- SQLite Migration (run separately if using SQLite)
-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS
-- You may need to check if columns exist first or handle errors

-- For SQLite, use these commands:
-- ALTER TABLE users ADD COLUMN email_verified TEXT NOT NULL DEFAULT 'false';
-- ALTER TABLE users ADD COLUMN email_verification_token TEXT;
-- ALTER TABLE users ADD COLUMN email_verification_expires TEXT;
-- CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(email_verification_token);
