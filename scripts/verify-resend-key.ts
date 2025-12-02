#!/usr/bin/env tsx
/**
 * Verify Resend API Key
 *
 * Tests if the API key is valid and can send emails
 */

import 'dotenv/config';
import { Resend } from 'resend';

async function verifyKey() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('❌ No RESEND_API_KEY found');
    process.exit(1);
  }

  console.log('🔍 Verifying Resend API Key...');
  console.log('Key:', apiKey);
  console.log();

  try {
    const resend = new Resend(apiKey);

    // Try to get API key info
    console.log('📡 Attempting to send email...');

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev', // Resend's test email
      subject: 'Test Email',
      html: '<p>Test</p>',
    });

    if (error) {
      console.error('❌ Error from Resend API:');
      console.error(JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('✅ Success!');
    console.log('Response data:', JSON.stringify(data, null, 2));

  } catch (error: any) {
    console.error('❌ Exception occurred:');
    console.error('Message:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

verifyKey();
