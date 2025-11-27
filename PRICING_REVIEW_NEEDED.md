# ⚠️ PRICING MISMATCH - Review Before Launch

**Status:** TO BE REVIEWED BEFORE LAUNCH
**Decision:** Option B (Update live website to match code)
**Created:** 2025-11-27

---

## 🔴 ISSUE SUMMARY

The live website (isbnscout.com) advertises different pricing than what's coded in the application.

**Current Decision:** Update the live website to match the code pricing before public launch. Since nobody has seen it yet, this is safe to do.

---

## 📊 PRICING COMPARISON

### Live Website (isbnscout.com) - NEEDS UPDATING
| Tier | Price | Scans/Month |
|------|-------|-------------|
| Free | £0 | 20 |
| Pro (Monthly) | £6.99 | Unlimited |
| Pro (Annual) | £59/year | Unlimited |

### Your Codebase - CURRENT (CORRECT)
| Tier | Price | Scans/Month | Features |
|------|-------|-------------|----------|
| Free/Trial | £0 | 10 | Basic only |
| Basic | £9.99/month | 100 | No AI |
| Pro | £24.99/month | Unlimited | Full AI |
| Enterprise | £99.99/month | Unlimited | Business features |

---

## 💰 PRICING DECISION (Option B)

**Before Launch, Update Live Website To:**

### Free Tier
- **Scans:** 20 → **10 scans/month**
- **Price:** £0 (stays same)
- **Features:** Basic barcode scanning only

### Paid Tiers
Choose one of these structures:

#### Option B1: Keep All 3 Tiers
- **Basic:** £9.99/month - 100 scans, no AI
- **Pro:** £24.99/month - Unlimited scans, full AI
- **Enterprise:** £99.99/month - Business features

#### Option B2: Simplify to 2 Tiers (Recommended)
- **Pro:** £19.99/month - Unlimited scans, full AI
- **Enterprise:** £79.99/month - Business features
- (Remove Basic tier to simplify)

#### Option B3: Match Market Better
- **Pro:** £14.99/month - Unlimited scans, full AI
- **Enterprise:** £49.99/month - Business features
- (More competitive with market)

---

## 🎯 TASKS BEFORE LAUNCH

### 1. Update Live Website Content
**File:** Update isbnscout.com pricing page

- [ ] Update Free tier: 20 → 10 scans/month
- [ ] Remove or update "£6.99/month" references
- [ ] Remove or update "£59/year" annual plan
- [ ] Add chosen tier structure (B1, B2, or B3)
- [ ] Update testimonials if they mention pricing
- [ ] Update FAQ if it mentions pricing

### 2. Decide Final Pricing Strategy
Consider:
- [ ] **Market Research:** What do competitors charge?
- [ ] **Cost Analysis:** What does it cost you per user? (API calls, hosting)
- [ ] **Target Margin:** What profit margin do you need?
- [ ] **Customer Value:** What's the ROI for users?
- [ ] **Simplicity:** 2 tiers or 3 tiers?

### 3. Update Stripe Products
If you decide on different prices than current code:
- [ ] Create Stripe products/prices for chosen tiers
- [ ] Update `server/routes.ts` Stripe integration
- [ ] Update `SubscriptionPage.tsx` with final prices
- [ ] Test checkout flow with real Stripe prices

### 4. Optional: Add Annual Plans
If you want annual plans (recommended for cash flow):
- [ ] Calculate annual discount (e.g., 2 months free)
- [ ] Create annual Stripe products
- [ ] Add annual toggle to `SubscriptionPage.tsx`
- [ ] Update backend to handle annual subscriptions

---

## 💡 RECOMMENDATIONS

### Pricing Strategy Suggestions:

**For UK Book Resellers:**
- Average book profit: £5-10 per book
- Pro sellers scan: 100-500 books/month
- Part-time sellers scan: 20-50 books/month

**Recommended Structure:**
```
Free:    £0/month   - 10 scans (try before buy)
Pro:     £14.99/mo  - Unlimited, AI features
Annual:  £149/year  - Save £30 (2 months free)
```

**Why this pricing:**
- £14.99/month = Cost of 2-3 books sold
- If users scan 50 books/month with 20% success rate = 10 sales
- ROI: £50-100 profit vs £14.99 cost = 3-6x return
- Competitive with other book scanning apps
- Annual plan encourages commitment

---

## 📋 COMPETITIVE ANALYSIS (TO DO)

Before finalizing pricing, research:
- [ ] ScoutIQ pricing
- [ ] BookScouter Pro pricing
- [ ] Scoutly pricing
- [ ] FBAScan pricing
- [ ] Other UK book scanning app prices

Document findings here: _______________

---

## ⚠️ IMPORTANT NOTES

### Why Option B (Update Website) Makes Sense:
1. ✅ Website not publicly launched yet
2. ✅ No customers expecting £6.99 pricing
3. ✅ Easier to update website than refactor code
4. ✅ Code pricing may be more sustainable
5. ✅ Can review competitive pricing before launch

### When to Finalize:
- **Before mobile app testing** (so prices match)
- **Before marketing campaign** (consistent messaging)
- **Before accepting payments** (legal requirement)
- **After market research** (competitive pricing)

---

## 🚀 NEXT STEPS

1. **This Afternoon:** Mobile app testing (use current code prices)
2. **Before Launch:**
   - Do market research on competitor pricing
   - Decide on final tier structure (B1, B2, or B3)
   - Update live website to match chosen pricing
   - Update Stripe products
   - Test end-to-end checkout flow

3. **After Launch:**
   - Monitor conversion rates
   - Get user feedback on pricing
   - Adjust if needed (grandfathering existing users)

---

## 📝 DECISION LOG

**Date:** 2025-11-27
**Decision:** Go with Option B - Update live website to match code
**Reasoning:** Website not public yet, nobody expecting lower prices
**Status:** To be implemented before launch

**Final pricing TBD** - Will review market rates and decide on:
- Free tier: 10 scans (confirmed)
- Paid tier structure: B1, B2, or B3 (to be decided)
- Annual plans: Yes/No (to be decided)

---

## ✅ CURRENT STATUS

- ✅ Pricing mismatch identified
- ✅ Decision made: Option B (update website)
- ✅ Documented for review
- ⏳ Final pricing structure: TO BE DECIDED
- ⏳ Website updates: NOT STARTED
- ⏳ Stripe products: NOT UPDATED

**Ready to proceed with:** Mobile testing (this afternoon)
**Before launch:** Finalize pricing and update website

---

**Review this document before launch and make final pricing decisions!**
