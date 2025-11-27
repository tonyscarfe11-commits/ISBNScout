/**
 * Test script to verify Stripe checkout works
 */

import { stripeService } from './server/stripe-service';
import * as dotenv from 'dotenv';

dotenv.config();

async function testCheckout() {
  console.log('Testing Stripe checkout session creation...\n');

  if (!stripeService.isConfigured()) {
    console.log('❌ Stripe not configured. Check STRIPE_SECRET_KEY in .env');
    process.exit(1);
  }

  console.log('✅ Stripe configured\n');

  const plans = ['pro_monthly', 'pro_yearly', 'elite_monthly', 'elite_yearly'];

  for (const planId of plans) {
    try {
      console.log(`Testing ${planId}...`);

      const result = await stripeService.createCheckoutSession(
        planId,
        null, // No existing customer
        'https://workspace.tonyscarfe11.repl.co/subscription?session_id={CHECKOUT_SESSION_ID}',
        'https://workspace.tonyscarfe11.repl.co/subscription?cancelled=true'
      );

      console.log(`✅ ${planId}: Checkout URL created`);
      console.log(`   URL: ${result.url}\n`);
    } catch (error: any) {
      console.log(`❌ ${planId}: ${error.message}\n`);
    }
  }
}

testCheckout().catch(console.error);
