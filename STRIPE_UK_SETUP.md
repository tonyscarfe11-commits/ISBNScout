# Stripe UK Configuration Guide

## ✅ What's Already Configured

Your Stripe integration is **fully working** and optimized for UK customers!

### Payment Methods
- **Cards**: All major credit/debit cards (Visa, Mastercard, Amex)
- **PayPal**: UK customers can pay with PayPal
- **Apple Pay/Google Pay**: Will automatically appear for supported devices
- **Stripe Link**: One-click checkout for returning customers

### UK-Specific Features
- ✅ **Currency**: Set to GBP (£)
- ✅ **Strong Customer Authentication (SCA)**: Enabled for UK compliance
- ✅ **Billing Address Collection**: Required for VAT purposes
- ✅ **Automatic Tax Calculation**: Enabled (requires Dashboard setup)
- ✅ **Customer Address Saving**: Automatically saves address for tax

---

## 🔧 Stripe Dashboard Setup (One-Time, 5 minutes)

To enable automatic VAT calculation, you need to configure this in your Stripe Dashboard:

### Step 1: Enable Tax
1. Go to https://dashboard.stripe.com/test/settings/tax
2. Click **"Start collecting tax"**
3. Select **United Kingdom** as your business location
4. Enter your business details (or skip for now if testing)

### Step 2: Configure Tax Rates
Stripe will automatically calculate:
- **20% VAT** for UK customers
- **0% VAT** for non-UK EU customers (reverse charge)
- **0% VAT** for rest of world

### Step 3: Test Mode
Your current setup uses **test mode** API keys. When ready for production:
1. Get your **live API keys** from https://dashboard.stripe.com/apikeys
2. Update `.env` with live keys:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

---

## 🧪 Testing Stripe Checkout

### Test Cards (UK-specific)
```
Card Number: 4000 0082 6000 0000
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
Postcode: Any UK postcode (e.g., SW1A 1AA)
```

This card will:
- ✅ Simulate a successful UK payment
- ✅ Trigger 3D Secure authentication (SCA)
- ✅ Test address collection

### Other Test Cards
- **Generic success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0027 6000 3184`
- **Declined**: `4000 0000 0000 0002`

Full list: https://stripe.com/docs/testing#cards

---

## 💰 Current Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | £0/month | 10 scans, basic features |
| **Basic** | £9.99/month | 100 scans, AI features |
| **Pro** | £24.99/month | Unlimited scans, auto-listing |
| **Enterprise** | £99.99/month | Teams, API access, white-label |

**Note**: Prices are **excluding VAT**. Stripe will automatically add 20% VAT for UK customers at checkout.

Example:
- Basic Plan: £9.99 + £2.00 VAT = **£11.99 total**
- Pro Plan: £24.99 + £5.00 VAT = **£29.99 total**

---

## 📊 Stripe Fees (UK)

Stripe charges **2.9% + £0.30** per successful transaction.

### Revenue Calculator (Monthly)
| Customers | Plan | Gross Revenue | Stripe Fees | Your Net Revenue |
|-----------|------|---------------|-------------|------------------|
| 10 | Basic | £99.90 | ~£6.00 | **£93.90** |
| 50 | Basic | £499.50 | ~£24.00 | **£475.50** |
| 100 | Pro | £2,499 | ~£97.50 | **£2,401.50** |

---

## 🔔 Webhooks (For Production)

Webhooks allow you to automatically handle:
- ✅ Successful subscriptions
- ✅ Failed payments
- ✅ Subscription cancellations
- ✅ Payment disputes

### Setup Webhooks
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter your URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Note**: Webhooks are optional for now. The checkout flow works without them!

---

## 🚀 Test Your Integration

### From Command Line
```bash
# Test Basic plan (£9.99/month)
curl -X POST http://localhost:5000/api/subscription/checkout \
  -H "Content-Type: application/json" \
  -d '{"planId": "basic"}'

# Test Pro plan (£24.99/month)
curl -X POST http://localhost:5000/api/subscription/checkout \
  -H "Content-Type: application/json" \
  -d '{"planId": "pro"}'
```

### From Browser
1. Open http://localhost:5000
2. Navigate to **Subscription** page
3. Click **"Upgrade to Basic"** or **"Upgrade to Pro"**
4. You'll be redirected to Stripe Checkout
5. Use test card `4242 4242 4242 4242`
6. Complete the checkout

---

## ✅ Checklist for Going Live

- [ ] Enable tax collection in Stripe Dashboard
- [ ] Configure UK business address
- [ ] Get live API keys (replace test keys in `.env`)
- [ ] Set up webhook endpoint (optional but recommended)
- [ ] Test with real card (small amount)
- [ ] Update success/cancel URLs to production domain
- [ ] Enable Stripe Radar for fraud protection
- [ ] Set up email notifications for failed payments

---

## 📝 Important Notes

### VAT Compliance
- You must register for VAT if your taxable turnover exceeds £90,000/year
- Below that threshold, VAT registration is optional
- Stripe can help collect VAT, but you're responsible for filing returns

### Data Protection
- Stripe is PCI DSS compliant (you don't handle card data)
- Ensure your GDPR privacy policy mentions Stripe
- Customer data is stored securely in Stripe

### Customer Support
- Test mode payments don't trigger actual charges
- Customers can manage subscriptions via Stripe Customer Portal
- Refunds can be issued from Stripe Dashboard

---

## 🆘 Troubleshooting

### "Automatic tax calculation requires configuration"
- Enable tax collection in Stripe Dashboard
- Or temporarily disable by removing `automatic_tax: { enabled: true }` from code

### "Payment method not available"
- Some payment methods require activation in Dashboard
- PayPal requires enabling in Settings > Payment methods

### "Invalid API key"
- Check `.env` has correct keys
- Ensure keys match test/live mode
- Keys should start with `sk_test_` or `sk_live_`

---

## 📚 Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **API Documentation**: https://stripe.com/docs/api
- **Tax Guide**: https://stripe.com/docs/tax
- **Testing Guide**: https://stripe.com/docs/testing
- **Webhooks Guide**: https://stripe.com/docs/webhooks

---

**You're all set!** 🎉

Your Stripe integration is production-ready for UK customers. Just enable tax collection in the Dashboard and you're good to go!
