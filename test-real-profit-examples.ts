/**
 * Real-world profit calculator test with UK book selling scenarios
 */

import { calculateProfitAllPlatforms, calculateProfit } from './client/src/lib/profitCalculator';
import { salesVelocityService } from './server/sales-velocity-service';

console.log('═══════════════════════════════════════════════════════════');
console.log('  ISBNScout - Real UK Book Selling Scenarios');
console.log('═══════════════════════════════════════════════════════════\n');

interface BookScenario {
  title: string;
  buyPrice: number;
  sellPrice: number;
  weight: number;
  bsr: number;
  condition: string;
}

const scenarios: BookScenario[] = [
  {
    title: 'Harry Potter (Bestseller)',
    buyPrice: 1.00,
    sellPrice: 8.99,
    weight: 0.35, // Paperback
    bsr: 2500, // Very popular
    condition: 'Good'
  },
  {
    title: 'Vintage Cookbook (Rare)',
    buyPrice: 2.50,
    sellPrice: 24.99,
    weight: 0.65, // Hardcover
    bsr: 45000, // Good seller
    condition: 'Very Good'
  },
  {
    title: 'University Textbook',
    buyPrice: 5.00,
    sellPrice: 35.99,
    weight: 1.2, // Heavy
    bsr: 8500, // Hot item at term start
    condition: 'Acceptable'
  },
  {
    title: 'Charity Shop Paperback',
    buyPrice: 0.50,
    sellPrice: 3.99,
    weight: 0.25, // Light
    bsr: 150000, // Slow mover
    condition: 'Good'
  },
  {
    title: 'Collectible First Edition',
    buyPrice: 15.00,
    sellPrice: 89.99,
    weight: 0.8, // Hardcover
    bsr: 95000, // Niche market
    condition: 'Like New'
  },
  {
    title: 'Box Set (3 books)',
    buyPrice: 3.00,
    sellPrice: 18.99,
    weight: 1.5, // Heavy
    bsr: 18000, // Popular series
    condition: 'Very Good'
  }
];

scenarios.forEach((book, index) => {
  console.log(`\n${'═'.repeat(63)}`);
  console.log(`📚 Scenario ${index + 1}: ${book.title}`);
  console.log(`${'═'.repeat(63)}`);
  console.log(`Buy Price: £${book.buyPrice.toFixed(2)} | Sell Price: £${book.sellPrice.toFixed(2)} | Weight: ${(book.weight * 1000).toFixed(0)}g`);
  console.log(`BSR: ${book.bsr.toLocaleString()} | Condition: ${book.condition}`);

  // Calculate profits for all platforms
  const profits = calculateProfitAllPlatforms(book.sellPrice, book.buyPrice, book.weight);

  // Get sales velocity analysis
  const velocityAnalysis = salesVelocityService.calculateVelocity(book.bsr);

  console.log('\n📊 Platform Comparison:');
  console.log('─'.repeat(63));

  // Format and display each platform
  const platforms = [
    { key: 'amazon-fba', name: 'Amazon FBA' },
    { key: 'amazon-fbm', name: 'Amazon FBM' },
    { key: 'ebay', name: 'eBay' }
  ];

  let bestPlatform = { name: '', roi: -Infinity };

  platforms.forEach(({ key, name }) => {
    const calc = profits[key as keyof typeof profits];
    if (calc.roi > bestPlatform.roi) {
      bestPlatform = { name, roi: calc.roi };
    }

    const isBest = calc.roi === Math.max(
      profits['amazon-fba'].roi,
      profits['amazon-fbm'].roi,
      profits['ebay'].roi
    );

    console.log(`\n${name}${isBest ? ' ⭐ BEST' : ''}:`);
    console.log(`  Commission:     £${calc.commissionFee.toFixed(2)}`);
    console.log(`  Fulfillment:    £${calc.fulfillmentFee.toFixed(2)}`);
    if (calc.shippingCost > 0) {
      console.log(`  Shipping:       £${calc.shippingCost.toFixed(2)}`);
    }
    if (calc.packagingCost > 0) {
      console.log(`  Packaging:      £${calc.packagingCost.toFixed(2)}`);
    }
    console.log(`  ────────────────────────`);
    console.log(`  Total Fees:     £${calc.totalFees.toFixed(2)}`);
    console.log(`  Total Costs:    £${calc.totalCosts.toFixed(2)}`);
    console.log(`  NET PROFIT:     £${calc.netProfit.toFixed(2)}`);
    console.log(`  Profit Margin:  ${calc.profitMargin.toFixed(1)}%`);
    console.log(`  ROI:            ${calc.roi.toFixed(1)}%`);
  });

  // Calculate buy decision
  const bestCalc = profits[bestPlatform.name.toLowerCase().replace(' ', '-') as keyof typeof profits];
  const decision = salesVelocityService.shouldBuy(
    velocityAnalysis.velocity.rating,
    bestCalc.netProfit,
    bestCalc.profitMargin
  );

  console.log('\n\n🎯 Sales Velocity & Recommendation:');
  console.log('─'.repeat(63));
  console.log(`  Velocity:       ${velocityAnalysis.velocity.description}`);
  console.log(`  Est. Sales:     ${velocityAnalysis.velocity.estimatedSalesPerMonth} per month`);
  console.log(`  Category:       ${velocityAnalysis.rankCategory}`);
  console.log(`  Confidence:     ${velocityAnalysis.velocity.confidence.toUpperCase()}`);

  // Display decision with color coding
  let decisionIcon = '';
  let decisionText = '';
  switch (decision.recommendation) {
    case 'strong_buy':
      decisionIcon = '🟢';
      decisionText = 'STRONG BUY';
      break;
    case 'buy':
      decisionIcon = '🟢';
      decisionText = 'BUY';
      break;
    case 'maybe':
      decisionIcon = '🟡';
      decisionText = 'MAYBE';
      break;
    case 'skip':
      decisionIcon = '🔴';
      decisionText = 'SKIP';
      break;
  }

  console.log(`\n  ${decisionIcon} RECOMMENDATION: ${decisionText} (Score: ${decision.score}/100)`);
  console.log(`  Reason: ${decision.reason}`);

  // Add expected turnaround time
  const monthlyProfit = bestCalc.netProfit * parseFloat(velocityAnalysis.velocity.estimatedSalesPerMonth.split('-')[0]);
  console.log(`\n  💰 Expected Monthly Profit: ~£${monthlyProfit.toFixed(2)}`);
  console.log(`  📈 Best Platform: ${bestPlatform.name} (${bestCalc.roi.toFixed(0)}% ROI)`);
});

// Summary statistics
console.log('\n\n');
console.log('═'.repeat(63));
console.log('  Summary Statistics');
console.log('═'.repeat(63));

let strongBuyCount = 0;
let buyCount = 0;
let maybeCount = 0;
let skipCount = 0;
let totalPotentialProfit = 0;

scenarios.forEach(book => {
  const profits = calculateProfitAllPlatforms(book.sellPrice, book.buyPrice, book.weight);
  const bestProfit = Math.max(
    profits['amazon-fba'].netProfit,
    profits['amazon-fbm'].netProfit,
    profits['ebay'].netProfit
  );

  const velocityAnalysis = salesVelocityService.calculateVelocity(book.bsr);
  const decision = salesVelocityService.shouldBuy(
    velocityAnalysis.velocity.rating,
    bestProfit,
    (bestProfit / book.sellPrice) * 100
  );

  switch (decision.recommendation) {
    case 'strong_buy': strongBuyCount++; break;
    case 'buy': buyCount++; break;
    case 'maybe': maybeCount++; break;
    case 'skip': skipCount++; break;
  }

  totalPotentialProfit += bestProfit;
});

console.log(`\nTotal Scenarios Tested: ${scenarios.length}`);
console.log(`\nRecommendations:`);
console.log(`  🟢 Strong Buy: ${strongBuyCount}`);
console.log(`  🟢 Buy:        ${buyCount}`);
console.log(`  🟡 Maybe:      ${maybeCount}`);
console.log(`  🔴 Skip:       ${skipCount}`);
console.log(`\nTotal Investment: £${scenarios.reduce((sum, b) => sum + b.buyPrice, 0).toFixed(2)}`);
console.log(`Total Potential Profit: £${totalPotentialProfit.toFixed(2)}`);
console.log(`Average ROI: ${((totalPotentialProfit / scenarios.reduce((sum, b) => sum + b.buyPrice, 0)) * 100).toFixed(0)}%`);

console.log('\n✅ All profit calculations completed!\n');
