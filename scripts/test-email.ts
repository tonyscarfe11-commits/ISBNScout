#!/usr/bin/env tsx
/**
 * Test Email Script
 *
 * Simple script to test the Resend email service configuration
 * Usage: tsx scripts/test-email.ts <your-email@example.com>
 */

import 'dotenv/config';
import { emailService } from '../server/email-service';

async function testEmail() {
  const testEmail = process.argv[2];

  if (!testEmail) {
    console.error('Usage: tsx scripts/test-email.ts <your-email@example.com>');
    process.exit(1);
  }

  console.log('🧪 Testing Resend email service...');
  console.log(`📧 Sending test welcome email to: ${testEmail}`);

  try {
    // Send a test welcome email
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days from now

    const result = await emailService.sendWelcomeEmail({
      username: 'Test User',
      email: testEmail,
      trialEndsAt: trialEndsAt,
    });

    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Check your inbox at:', testEmail);
      console.log('\n💡 Tip: Check spam folder if you don\'t see it');
      console.log('📊 View email in Resend dashboard: https://resend.com/emails');
    } else {
      console.log('❌ Email service returned false - check configuration');
      console.log('🔍 Make sure RESEND_API_KEY is set in .env');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    process.exit(1);
  }
}

testEmail();
