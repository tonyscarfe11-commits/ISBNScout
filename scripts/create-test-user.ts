#!/usr/bin/env tsx
/**
 * Create a test user with an expiring trial
 */

import 'dotenv/config';
import { storage } from '../server/storage';
import { randomUUID } from 'crypto';

async function createTestUser() {
  console.log('🧪 Creating test user with expiring trial...');

  try {
    // Create a test user
    const testUser = await storage.createUser({
      username: 'test-trial-user',
      email: 'tonyscarfe11@gmail.com',
      password: 'test-password-' + randomUUID(),
    });

    console.log('✅ Created test user:', testUser.username);
    console.log('📧 Email:', testUser.email);

    // Set trial to end in 3 days
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3);
    trialEndsAt.setHours(12, 0, 0, 0);

    const trialStartedAt = new Date();
    trialStartedAt.setDate(trialStartedAt.getDate() - 11);

    const updatedUser = await storage.updateUser(testUser.id, {
      subscriptionTier: 'trial',
      subscriptionStatus: 'trialing',
      trialStartedAt,
      trialEndsAt,
    });

    console.log('📅 Trial ends at:', trialEndsAt.toISOString());
    console.log('⏰ Days remaining: 3');
    console.log('✅ Test user ready!');

    process.exit(0);
  } catch (error: any) {
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      console.log('⚠️  Test user already exists, updating trial date...');

      try {
        const existingUser = await storage.getUserByUsername('test-trial-user');
        if (existingUser) {
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + 3);
          trialEndsAt.setHours(12, 0, 0, 0);

          const trialStartedAt = new Date();
          trialStartedAt.setDate(trialStartedAt.getDate() - 11);

          await storage.updateUser(existingUser.id, {
            subscriptionTier: 'trial',
            subscriptionStatus: 'trialing',
            trialStartedAt,
            trialEndsAt,
          });

          console.log('✅ Updated existing test user');
          console.log('📅 Trial ends at:', trialEndsAt.toISOString());
          console.log('⏰ Days remaining: 3');
          process.exit(0);
        }
      } catch (updateError) {
        console.error('❌ Error updating user:', updateError);
        process.exit(1);
      }
    }

    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUser();
