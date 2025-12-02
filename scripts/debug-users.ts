#!/usr/bin/env tsx
import 'dotenv/config';
import { storage } from '../server/storage';

async function debugUsers() {
  const testUser = await storage.getUserByUsername('test-trial-user');
  console.log('Test user:', JSON.stringify(testUser, null, 2));
  
  const now = new Date();
  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);
  
  console.log('\n--- Date Checks ---');
  console.log('Now:', now.toISOString());
  console.log('In 3 days:', in3Days.toISOString());
  console.log('Trial ends:', testUser?.trialEndsAt);
  
  if (testUser?.trialEndsAt) {
    const startOfDay = new Date(in3Days);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(in3Days);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log('\nSearching between:');
    console.log('Start:', startOfDay.toISOString());
    console.log('End:', endOfDay.toISOString());
    
    const users = await storage.getUsersWithTrialExpiringBetween(startOfDay, endOfDay);
    console.log('\nUsers found:', users.length);
    users.forEach(u => console.log(' -', u.username, u.trialEndsAt));
  }
}

debugUsers().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
