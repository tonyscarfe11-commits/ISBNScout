/**
 * Stripe Setup Verification Script
 *
 * Run this to verify your Stripe products are configured correctly
 * Usage: npx tsx verify-stripe-setup.ts
 */

import { STRIPE_PRICE_IDS } from './src/config/stripePrices';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

interface VerificationResult {
  priceId: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  trialDays: number | null;
  status: 'ok' | 'error';
  message?: string;
}

async function verifyPrice(
  priceId: string,
  expectedAmount: number,
  expectedInterval: string,
  name: string
): Promise<VerificationResult> {
  try {
    if (priceId.startsWith('price_pro_') || priceId.startsWith('price_elite_')) {
      return {
        priceId,
        name,
        amount: 0,
        currency: 'gbp',
        interval: expectedInterval,
        trialDays: null,
        status: 'error',
        message: '⚠️  Placeholder price ID detected. Please update with real Stripe price ID.',
      };
    }

    const price = await stripe.prices.retrieve(priceId);

    const amount = price.unit_amount ? price.unit_amount / 100 : 0;
    const currency = price.currency;
    const interval = price.recurring?.interval || 'unknown';
    const trialDays = price.recurring?.trial_period_days || null;

    let status: 'ok' | 'error' = 'ok';
    let message = '';

    // Verify amount
    if (amount !== expectedAmount) {
      status = 'error';
      message += `Expected amount £${expectedAmount}, got £${amount}. `;
    }

    // Verify currency
    if (currency !== 'gbp') {
      status = 'error';
      message += `Expected GBP, got ${currency}. `;
    }

    // Verify interval
    if (interval !== expectedInterval) {
      status = 'error';
      message += `Expected ${expectedInterval}, got ${interval}. `;
    }

    // Check trial period
    if (trialDays !== 14) {
      message += `⚠️  Trial period is ${trialDays} days (expected 14). `;
    }

    if (status === 'ok') {
      message = '✅ All checks passed!';
    }

    return {
      priceId,
      name,
      amount,
      currency,
      interval,
      trialDays,
      status,
      message: message || '✅ All checks passed!',
    };
  } catch (error: any) {
    return {
      priceId,
      name,
      amount: 0,
      currency: 'unknown',
      interval: 'unknown',
      trialDays: null,
      status: 'error',
      message: `❌ Error: ${error.message}`,
    };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     ISBNScout - Stripe Setup Verification                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ Error: STRIPE_SECRET_KEY not found in environment variables.');
    console.log('   Please set it in your .env file.\n');
    process.exit(1);
  }

  const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  console.log(`Mode: ${isTestMode ? '🧪 TEST MODE' : '🚀 LIVE MODE'}\n`);

  console.log('Verifying price IDs from src/config/stripePrices.ts...\n');

  const results: VerificationResult[] = [];

  // Verify each price
  results.push(await verifyPrice(STRIPE_PRICE_IDS.PRO_MONTHLY, 14.99, 'month', 'Pro Monthly'));
  results.push(await verifyPrice(STRIPE_PRICE_IDS.PRO_YEARLY, 149, 'year', 'Pro Yearly'));
  results.push(await verifyPrice(STRIPE_PRICE_IDS.ELITE_MONTHLY, 19.99, 'month', 'Elite Monthly'));
  results.push(await verifyPrice(STRIPE_PRICE_IDS.ELITE_YEARLY, 199, 'year', 'Elite Yearly'));

  // Display results
  console.log('═══════════════════════════════════════════════════════════');
  results.forEach((result) => {
    console.log(`\n${result.name}:`);
    console.log(`  Price ID: ${result.priceId}`);
    if (result.status === 'ok') {
      console.log(`  Amount: £${result.amount}`);
      console.log(`  Interval: ${result.interval}`);
      console.log(`  Trial: ${result.trialDays} days`);
    }
    console.log(`  ${result.message}`);
  });
  console.log('\n═══════════════════════════════════════════════════════════');

  // Summary
  const allPassed = results.every((r) => r.status === 'ok');
  console.log('\nSummary:');
  console.log(`  Passed: ${results.filter((r) => r.status === 'ok').length}/4`);
  console.log(`  Failed: ${results.filter((r) => r.status === 'error').length}/4`);

  if (allPassed) {
    console.log('\n✅ All Stripe products configured correctly!');
    console.log('   You can proceed with testing the checkout flow.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some issues found. Please fix them before proceeding.\n');
    console.log('Next steps:');
    console.log('  1. Check STRIPE_PRODUCTS_SETUP.md for instructions');
    console.log('  2. Update src/config/stripePrices.ts with correct IDs');
    console.log('  3. Run this script again to verify\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
