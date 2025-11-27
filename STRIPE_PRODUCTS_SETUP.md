# Stripe Products Setup Guide

**Created**: 2025-11-27
**Status**: ACTION REQUIRED - Set up products before launch

---

## 🎯 Goal

Create 4 subscription products in Stripe with 14-day free trials:
- Pro Monthly (£14.99/month)
- Pro Yearly (£149/year)
- Elite Monthly (£19.99/month)
- Elite Yearly (£199/year)

---

## 📋 Step-by-Step Instructions

### Option A: Using Stripe Dashboard (Recommended for First Time)

#### 1. Log into Stripe Dashboard
- Go to https://dashboard.stripe.com/
- Make sure you're in **Test Mode** (toggle in top right)

#### 2. Create Pro Monthly Product

1. Navigate to **Products** in the left sidebar
2. Click **+ Add Product**
3. Fill in the details:
   - **Name**: `ISBNScout Pro`
   - **Description**: `Unlimited scans, AI recognition, and profit calculator for UK book sellers`
   - **Pricing Model**: `Recurring`
   - **Price**: `14.99`
   - **Currency**: `GBP`
   - **Billing Period**: `Monthly`
   - **Free Trial**: `14 days`
4. Click **Add Product**
5. **COPY THE PRICE ID** - it will look like `price_1ABC123xyz...`

#### 3. Create Pro Yearly Product

1. Go back to **Products**
2. Find the "ISBNScout Pro" product you just created
3. Click on it, then click **Add another price**
4. Fill in:
   - **Price**: `149`
   - **Currency**: `GBP`
   - **Billing Period**: `Yearly`
   - **Free Trial**: `14 days`
5. Click **Add Price**
6. **COPY THE PRICE ID**

#### 4. Create Elite Monthly Product

1. Navigate to **Products** in the left sidebar
2. Click **+ Add Product**
3. Fill in the details:
   - **Name**: `ISBNScout Elite`
   - **Description**: `Pro features plus automation, triggers, and multi-device access`
   - **Pricing Model**: `Recurring`
   - **Price**: `19.99`
   - **Currency**: `GBP`
   - **Billing Period**: `Monthly`
   - **Free Trial**: `14 days`
4. Click **Add Product**
5. **COPY THE PRICE ID**

#### 5. Create Elite Yearly Product

1. Go back to **Products**
2. Find the "ISBNScout Elite" product
3. Click on it, then click **Add another price**
4. Fill in:
   - **Price**: `199`
   - **Currency**: `GBP`
   - **Billing Period**: `Yearly`
   - **Free Trial**: `14 days`
5. Click **Add Price**
6. **COPY THE PRICE ID**

---

### Option B: Using Stripe CLI (Advanced)

If you have Stripe CLI installed, you can create all products at once:

```bash
# Make sure you're logged in
stripe login

# Create Pro Monthly
stripe products create \
  --name="ISBNScout Pro" \
  --description="Unlimited scans, AI recognition, and profit calculator for UK book sellers"

# Copy the product ID (prod_xxx), then create price
stripe prices create \
  --product=prod_YOUR_PRODUCT_ID_HERE \
  --unit-amount=1499 \
  --currency=gbp \
  --recurring[interval]=month \
  --recurring[trial_period_days]=14

# Repeat for other products...
```

---

## 📝 Record Your Price IDs

After creating the products, you'll have 4 price IDs. Save them here:

```
Pro Monthly:   price_________________________________
Pro Yearly:    price_________________________________
Elite Monthly: price_________________________________
Elite Yearly:  price_________________________________
```

---

## 🔧 Update Your Code

Once you have the price IDs, update `src/config/stripePrices.ts`:

```typescript
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: "price_YOUR_ACTUAL_ID_HERE",
  PRO_YEARLY: "price_YOUR_ACTUAL_ID_HERE",
  ELITE_MONTHLY: "price_YOUR_ACTUAL_ID_HERE",
  ELITE_YEARLY: "price_YOUR_ACTUAL_ID_HERE",
} as const;
```

---

## ✅ Quick Copy Template

Once you have your price IDs, use this template:

```typescript
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: "price_[PASTE HERE]",
  PRO_YEARLY: "price_[PASTE HERE]",
  ELITE_MONTHLY: "price_[PASTE HERE]",
  ELITE_YEARLY: "price_[PASTE HERE]",
} as const;
```

---

## 🧪 Testing in Test Mode

Before going live:

1. ✅ Keep Stripe in **Test Mode**
2. ✅ Update `stripePrices.ts` with TEST mode price IDs
3. ✅ Test checkout flow using test card: `4242 4242 4242 4242`
4. ✅ Verify trial period is applied
5. ✅ Test webhook events

---

## 🚀 Going to Production

When ready to launch:

1. Switch Stripe to **Live Mode**
2. Repeat product creation in Live Mode (same prices)
3. Get NEW price IDs for live mode
4. Update `stripePrices.ts` with LIVE price IDs
5. Update `.env` with live Stripe keys:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. Set up live webhook endpoint in Stripe Dashboard
7. Test with real card (small amount)

---

## 💡 Pro Tips

### Tax Configuration
- Enable **Stripe Tax** in Dashboard > Settings > Tax
- Configure UK VAT (20%) for automatic calculation
- Set your business location to UK

### Billing Portal
- Configure Customer Portal in Dashboard > Settings > Billing
- Enable customers to:
  - Cancel subscriptions
  - Update payment method
  - View invoices
  - Change plans

### Important Settings for UK
- **Currency**: Always GBP
- **3D Secure**: Enable automatic (required for UK SCA)
- **Payment Methods**: Enable Card + PayPal
- **Billing Address**: Required (for VAT)

---

## 🔍 Verification Checklist

Before launch, verify:
- [ ] All 4 products created (2 Pro, 2 Elite)
- [ ] All prices in GBP
- [ ] All have 14-day free trial
- [ ] Price IDs copied to `stripePrices.ts`
- [ ] Test mode checkout works
- [ ] Trial period applied correctly
- [ ] Webhooks configured and working
- [ ] Customer portal configured
- [ ] Tax calculation enabled

---

## 📞 Need Help?

- Stripe Dashboard: https://dashboard.stripe.com/
- Stripe Docs: https://stripe.com/docs/billing/subscriptions/trials
- Stripe Support: https://support.stripe.com/

---

**Next Step**: Create the products in Stripe and come back with your 4 price IDs!
