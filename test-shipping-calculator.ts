/**
 * Test script for shipping calculator
 */

import { calculateShippingCost, getAllShippingOptions, getRecommendedShipping } from './client/src/lib/shippingCalculator';
import { calculateProfit, calculateProfitAllPlatforms } from './client/src/lib/profitCalculator';

console.log('═══════════════════════════════════════════════════════════');
console.log('  ISBNScout - Shipping & Profit Calculator Test');
console.log('═══════════════════════════════════════════════════════════\n');

// Test 1: Light paperback (250g)
console.log('📚 Test 1: Light Paperback (250g)');
console.log('─────────────────────────────────────────────────────');
const lightBook = getAllShippingOptions(0.25);
lightBook.forEach(rate => {
  console.log(`  ${rate.carrier} ${rate.service}: £${rate.cost.toFixed(2)} (${rate.estimatedDays})${rate.tracked ? ' 📍 Tracked' : ''}`);
});

// Test 2: Standard paperback (400g)
console.log('\n📚 Test 2: Standard Paperback (400g)');
console.log('─────────────────────────────────────────────────────');
const standardBook = getAllShippingOptions(0.4);
standardBook.forEach(rate => {
  console.log(`  ${rate.carrier} ${rate.service}: £${rate.cost.toFixed(2)} (${rate.estimatedDays})${rate.tracked ? ' 📍 Tracked' : ''}`);
});

// Test 3: Hardcover (750g)
console.log('\n📚 Test 3: Hardcover (750g)');
console.log('─────────────────────────────────────────────────────');
const hardcover = getAllShippingOptions(0.75);
hardcover.forEach(rate => {
  console.log(`  ${rate.carrier} ${rate.service}: £${rate.cost.toFixed(2)} (${rate.estimatedDays})${rate.tracked ? ' 📍 Tracked' : ''}`);
});

// Test 4: Heavy textbook (1.5kg)
console.log('\n📚 Test 4: Heavy Textbook (1.5kg)');
console.log('─────────────────────────────────────────────────────');
const heavyBook = getAllShippingOptions(1.5);
heavyBook.forEach(rate => {
  console.log(`  ${rate.carrier} ${rate.service}: £${rate.cost.toFixed(2)} (${rate.estimatedDays})${rate.tracked ? ' 📍 Tracked' : ''}`);
});

// Test 5: Recommended shipping based on value
console.log('\n\n💡 Recommended Shipping Examples');
console.log('═══════════════════════════════════════════════════════════');

const lowValueBook = getRecommendedShipping(0.3, 8); // £8 book
console.log(`\n£8 book (300g): ${lowValueBook.carrier} ${lowValueBook.service} - £${lowValueBook.cost.toFixed(2)}`);
console.log(`  Reason: Low value item, use cheapest option`);

const midValueBook = getRecommendedShipping(0.3, 25); // £25 book
console.log(`\n£25 book (300g): ${midValueBook.carrier} ${midValueBook.service} - £${midValueBook.cost.toFixed(2)}`);
console.log(`  Reason: Over £20, use tracked shipping for protection`);

const highValueBook = getRecommendedShipping(0.6, 50); // £50 book
console.log(`\n£50 book (600g): ${highValueBook.carrier} ${highValueBook.service} - £${highValueBook.cost.toFixed(2)}`);
console.log(`  Reason: High value, use tracked shipping`);

// Test 6: Full profit calculation with dynamic shipping
console.log('\n\n💰 Profit Calculation with Dynamic Shipping');
console.log('═══════════════════════════════════════════════════════════');

const profitExample = {
  salePrice: 15.99,
  purchaseCost: 2.50,
  bookWeight: 0.35, // 350g paperback
};

console.log(`\nBook: Selling for £${profitExample.salePrice}, bought for £${profitExample.purchaseCost} (${profitExample.bookWeight * 1000}g)`);
console.log('\n');

const allPlatforms = calculateProfitAllPlatforms(
  profitExample.salePrice,
  profitExample.purchaseCost,
  profitExample.bookWeight
);

Object.entries(allPlatforms).forEach(([platform, calc]) => {
  console.log(`${platform.toUpperCase()}:`);
  console.log(`  Fees: £${calc.totalFees.toFixed(2)}`);
  console.log(`  Shipping: £${calc.shippingCost.toFixed(2)}`);
  console.log(`  Total Costs: £${calc.totalCosts.toFixed(2)}`);
  console.log(`  Net Profit: £${calc.netProfit.toFixed(2)}`);
  console.log(`  ROI: ${calc.roi.toFixed(1)}%`);
  console.log('');
});

// Test 7: Compare old vs new shipping cost
console.log('📊 Shipping Cost Impact Analysis');
console.log('═══════════════════════════════════════════════════════════');
console.log('Book Weight | Old (Fixed) | New (Dynamic) | Savings');
console.log('─────────────────────────────────────────────────────────');

const testWeights = [0.2, 0.3, 0.4, 0.6, 1.0, 1.5];
testWeights.forEach(weight => {
  const oldCost = 2.50; // Old hardcoded value
  const newCost = calculateShippingCost(weight, 'royal-mail-2nd').cost;
  const savings = oldCost - newCost;
  const savingsPercent = (savings / oldCost) * 100;

  console.log(
    `${(weight * 1000).toString().padEnd(11)} | £${oldCost.toFixed(2).padEnd(11)} | £${newCost.toFixed(2).padEnd(13)} | ` +
    `${savings >= 0 ? '+' : ''}£${savings.toFixed(2)} (${savingsPercent >= 0 ? '+' : ''}${savingsPercent.toFixed(0)}%)`
  );
});

console.log('\n✅ All tests completed!\n');
