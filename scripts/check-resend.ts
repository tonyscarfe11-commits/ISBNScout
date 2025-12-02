#!/usr/bin/env tsx
/**
 * Check Resend API Key
 *
 * Verifies the Resend API key and checks email sending status
 */

import 'dotenv/config';
import { Resend } from 'resend';

async function checkResend() {
  console.log('🔍 Checking Resend configuration...\n');

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  console.log('✅ RESEND_API_KEY found:', apiKey.substring(0, 10) + '...');
  console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('🔄 EMAIL_REPLY_TO:', process.env.EMAIL_REPLY_TO);
  console.log('🌐 APP_URL:', process.env.APP_URL);
  console.log();

  try {
    const resend = new Resend(apiKey);

    console.log('🧪 Testing Resend API connection...');

    // Try to send a simple test email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'ISBN Scout <onboarding@resend.dev>',
      to: 'support@isbnscout.com',
      subject: 'Resend API Test - ISBN Scout',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify Resend configuration.</p>
        <p>If you receive this, your Resend API is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('📨 Email ID:', result.data?.id);
    console.log();
    console.log('📊 Check email status in Resend dashboard:');
    console.log('   https://resend.com/emails/' + result.data?.id);
    console.log();
    console.log('💡 Tips:');
    console.log('   - Check spam/junk folder');
    console.log('   - Verify support@isbnscout.com is a valid mailbox');
    console.log('   - Check Resend dashboard for delivery status');
    console.log('   - If using a custom domain, verify DNS records');

  } catch (error: any) {
    console.error('❌ Error testing Resend API:');
    console.error(error.message);

    if (error.statusCode === 401 || error.statusCode === 403) {
      console.error('\n🔑 Invalid API key. Please check:');
      console.error('   1. API key is correct in .env file');
      console.error('   2. API key is active in Resend dashboard');
      console.error('   3. No extra spaces in the API key');
    }

    process.exit(1);
  }
}

checkResend();
