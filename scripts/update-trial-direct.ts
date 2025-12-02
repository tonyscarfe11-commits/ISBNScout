#!/usr/bin/env tsx
import 'dotenv/config';
import Database from 'better-sqlite3';

const db = new Database('isbn_scout.db');

const user = db.prepare('SELECT * FROM users WHERE username = ?').get('test-trial-user') as any;
console.log('Found user:', user?.username, user?.id);

if (user) {
  const trialEndsAt = '2025-12-05T12:00:00.000Z';
  const trialStartedAt = '2025-11-21T12:00:00.000Z';
  
  console.log('Updating to:', { trialStartedAt, trialEndsAt });
  
  const result = db.prepare(`
    UPDATE users 
    SET trial_started_at = ?, trial_ends_at = ?, updated_at = ?
    WHERE id = ?
  `).run(trialStartedAt, trialEndsAt, new Date().toISOString(), user.id);
  
  console.log('Update result:', result);
  
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
  console.log('Updated user trial_ends_at:', updated.trial_ends_at);
}

db.close();
