import { authService } from '../server/auth-service';

async function createTestUser() {
  try {
    console.log('Creating test user...');

    const testUser = await authService.signup(
      'demo',
      'demo@isbnscout.com',
      'Demo123!'
    );

    console.log('✅ Test user created successfully!');
    console.log('Username:', testUser.username);
    console.log('Email:', testUser.email);
    console.log('Subscription Tier:', testUser.subscriptionTier);
    console.log('Trial Ends:', testUser.trialEndsAt);
    console.log('\nLogin credentials:');
    console.log('Email: demo@isbnscout.com');
    console.log('Password: Demo123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
