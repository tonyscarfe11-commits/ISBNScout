# Stripe Quick Start - ISBNScout

**5-Minute Setup Guide** | Created: 2025-11-27

---

## 🎯 What You Need to Do

1. Create 4 subscription products in Stripe
2. Update your code with the price IDs
3. Test the checkout flow

---

## 🚀 Quick Steps

### 1. Create Products in Stripe (10 minutes)

**Go to**: https://dashboard.stripe.com/test/products

**Make sure you're in TEST MODE** (toggle in top right)

Create these 4 prices:

| Product | Price | Interval | Trial | Description |
|---------|-------|----------|-------|-------------|
| Pro | £14.99 | Monthly | 14 days | Unlimited scans, AI recognition |
| Pro | £149 | Yearly | 14 days | Same product, yearly price |
| Elite | £19.99 | Monthly | 14 days | Pro + automation & triggers |
| Elite | £199 | Yearly | 14 days | Same product, yearly price |

**After each one**: Copy the **price ID** (looks like `price_1ABC123xyz...`)

📖 **Detailed instructions**: See `STRIPE_PRODUCTS_SETUP.md`

---

### 2. Update Your Code (2 minutes)

**Option A - Automatic (Recommended)**:
```bash
./update-stripe-prices.sh
```
Then paste your 4 price IDs when prompted.

**Option B - Manual**:
Edit `src/config/stripePrices.ts`:
```typescript
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: "price_YOUR_ID_HERE",
  PRO_YEARLY: "price_YOUR_ID_HERE",
  ELITE_MONTHLY: "price_YOUR_ID_HERE",
  ELITE_YEARLY: "price_YOUR_ID_HERE",
} as const;
```

---

### 3. Verify Setup (1 minute)

```bash
npx tsx verify-stripe-setup.ts
```

This will check:
- ✅ All 4 price IDs are valid
- ✅ Correct amounts (£14.99, £149, £19.99, £199)
- ✅ Currency is GBP
- ✅ Intervals are correct (monthly/yearly)
- ✅ Trial periods are 14 days

---

### 4. Test Checkout (5 minutes)

```bash
npm run dev
```

Then:
1. Go to http://localhost:5000/subscription
2. Click "Start 14-Day Pro Trial"
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Verify checkout works

---

## ✅ Checklist

- [ ] Logged into Stripe Dashboard (Test Mode)
- [ ] Created 4 subscription products with prices
- [ ] Copied all 4 price IDs
- [ ] Updated `src/config/stripePrices.ts`
- [ ] Ran `npx tsx verify-stripe-setup.ts` - all passed
- [ ] Tested checkout with test card
- [ ] Verified 14-day trial is applied

---

## 🆘 Troubleshooting

### "Error: Stripe not configured"
- Check `.env` file has `STRIPE_SECRET_KEY=sk_test_...`
- Make sure it starts with `sk_test_` for test mode

### "Invalid price ID"
- Price IDs must start with `price_`
- Make sure you copied from Stripe Dashboard
- Run `npx tsx verify-stripe-setup.ts` to check

### "Wrong currency"
- Delete the product in Stripe
- Create a new one with currency set to **GBP**

### "No trial period showing"
- Edit the price in Stripe Dashboard
- Set "Free trial" to 14 days
- Get the new price ID and update your code

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `STRIPE_PRODUCTS_SETUP.md` | Detailed setup instructions |
| `update-stripe-prices.sh` | Script to update price IDs |
| `verify-stripe-setup.ts` | Verification script |
| `src/config/stripePrices.ts` | Your price IDs (update this!) |

---

## 🚀 Going Live (Do This Later)

When ready to accept real payments:

1. Switch Stripe to **LIVE MODE**
2. Create the same 4 products in live mode
3. Get new live price IDs
4. Update `stripePrices.ts` with live IDs
5. Update `.env`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. Test with a real £1 payment first

---

**Need help?** See `STRIPE_PRODUCTS_SETUP.md` for detailed instructions.

**Ready?** Start at Step 1 above! 👆
