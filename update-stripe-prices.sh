#!/bin/bash

# Stripe Price IDs Update Script
# Run this after creating products in Stripe Dashboard

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ISBNScout - Stripe Price IDs Update Script            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will update src/config/stripePrices.ts with your"
echo "Stripe price IDs."
echo ""
echo "Make sure you have created the 4 products in Stripe first!"
echo "See STRIPE_PRODUCTS_SETUP.md for instructions."
echo ""

# Prompt for each price ID
read -p "Enter Pro Monthly price ID (price_xxx): " PRO_MONTHLY
read -p "Enter Pro Yearly price ID (price_xxx): " PRO_YEARLY
read -p "Enter Elite Monthly price ID (price_xxx): " ELITE_MONTHLY
read -p "Enter Elite Yearly price ID (price_xxx): " ELITE_YEARLY

# Validate that IDs start with "price_"
if [[ ! $PRO_MONTHLY =~ ^price_ ]] || [[ ! $PRO_YEARLY =~ ^price_ ]] || \
   [[ ! $ELITE_MONTHLY =~ ^price_ ]] || [[ ! $ELITE_YEARLY =~ ^price_ ]]; then
  echo ""
  echo "❌ Error: All price IDs must start with 'price_'"
  echo "Please check your IDs and try again."
  exit 1
fi

echo ""
echo "You entered:"
echo "  Pro Monthly:   $PRO_MONTHLY"
echo "  Pro Yearly:    $PRO_YEARLY"
echo "  Elite Monthly: $ELITE_MONTHLY"
echo "  Elite Yearly:  $ELITE_YEARLY"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
  echo "Cancelled. Please run the script again."
  exit 0
fi

# Create the updated file
cat > src/config/stripePrices.ts << EOF
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: "$PRO_MONTHLY",
  PRO_YEARLY: "$PRO_YEARLY",
  ELITE_MONTHLY: "$ELITE_MONTHLY",
  ELITE_YEARLY: "$ELITE_YEARLY",
} as const;

export type PlanKey = keyof typeof STRIPE_PRICE_IDS;
EOF

echo ""
echo "✅ Successfully updated src/config/stripePrices.ts!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run build' to verify no errors"
echo "  2. Test the checkout flow"
echo "  3. Verify trial period is applied"
echo ""
echo "To view the updated file:"
echo "  cat src/config/stripePrices.ts"
