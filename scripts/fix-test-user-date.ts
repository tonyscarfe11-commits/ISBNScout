#!/usr/bin/env tsx
import 'dotenv/config';
import { storage } from '../server/storage';

async function fixDate() {
  const user = await storage.getUserByUsername('test-trial-user');
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }
  
  const trialEndsAt = new Date('2025-12-05T12:00:00.000Z');
  const trialStartedAt = new Date('2025-11-21T12:00:00.000Z');
  
  console.log('Updating trial dates...');
  console.log('Trial started:', trialStartedAt.toISOString());
  console.log('Trial ends:', trialEndsAt.toISOString());
  
  const updated = await storage.updateUser(user.id, {
    trialStartedAt,
    trialEndsAt,
  });
  
  console.log('Updated user:', updated);
  process.exit(0);
}

fixDate().catch(e => {
  console.error(e);
  process.exit(1);
});
