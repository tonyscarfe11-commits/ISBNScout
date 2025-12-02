#!/usr/bin/env tsx
import 'dotenv/config';
import { PostgresStorage } from '../server/postgres-storage';

async function updateUser() {
  console.log('Creating PostgresStorage instance...');
  const pgStorage = new PostgresStorage(process.env.DATABASE_URL!);
  
  const user = await pgStorage.getUserByUsername('test-trial-user');
  console.log('Found user:', user?.id);
  
  if (user) {
    const trialEndsAt = new Date('2025-12-05T12:00:00.000Z');
    const trialStartedAt = new Date('2025-11-21T12:00:00.000Z');
    
    console.log('Updating to:', { trialStartedAt, trialEndsAt });
    
    const updated = await pgStorage.updateUser(user.id, {
      trialStartedAt,
      trialEndsAt,
    });
    
    console.log('Updated user trial date:', updated?.trialEndsAt);
  }
  
  process.exit(0);
}

updateUser().catch(e => {
  console.error(e);
  process.exit(1);
});
