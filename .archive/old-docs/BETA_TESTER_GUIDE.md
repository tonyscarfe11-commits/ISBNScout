# ISBNScout Beta Tester Quick Start Guide

Welcome! This guide will get you up and running in ~10 minutes.

---

## Step 1: Create Your Account (2 minutes)

1. Go to [your-deployed-url.com]
2. Click "Sign Up"
3. Enter email and password
4. You're in! You'll see the dashboard

**Trial Period**: You have full access during beta testing (no credit card needed)

---

## Step 2: Connect Your Amazon/eBay Credentials (5 minutes)

### For Amazon Sellers:

1. Go to **Settings** → **API Credentials**
2. Click **"Add Amazon Credentials"**
3. You'll need:
   - Seller ID
   - MWS Auth Token (or SP-API credentials)
   - Marketplace (select UK, US, etc.)

**Where to find these:**
- Login to Amazon Seller Central
- Go to Settings → User Permissions → Visit Manage Your Apps
- Create new credentials for ISBNScout

[Video Tutorial: How to get Amazon API credentials]

### For eBay Sellers:

1. Go to **Settings** → **API Credentials**
2. Click **"Add eBay Credentials"**
3. You'll need:
   - App ID
   - Dev ID
   - Cert ID
   - User Token

**Where to find these:**
- Login to eBay Developer Program
- Create application
- Get production credentials

[Video Tutorial: How to get eBay API credentials]

---

## Step 3: Import Your Books (3 minutes)

You have several options:

### Option A: Scan Books One by One
1. Go to **Scan** page
2. Use camera or enter ISBN manually
3. Review pricing
4. Create listing

### Option B: Batch Import ISBNs
1. Go to **Scan** page → **Batch Scanner**
2. Paste ISBNs (one per line or comma-separated)
3. Click **"Add to Queue"**
4. Click **"Start Scanning"**
5. Wait for all books to be processed

### Option C: Add Books from Inventory
1. Go to **Inventory** page
2. Click **"Add Purchase"**
3. Enter book details and purchase info
4. Repeat for each book

**Pro Tip**: If you already have listings on Amazon/eBay, they'll sync automatically once you connect your credentials. *(Note: This feature is coming soon if not yet available)*

---

## Step 4: Create Your First Repricing Rule (2 minutes)

1. Go to **Repricing** page
2. Click **"Create New Rule"**
3. Configure your rule:

**Example Rule - Undercut Competition by 5%:**
```
Platform: Amazon (or eBay, or All)
Apply to: All listings (or select specific book)
Strategy: Beat by Percent
Strategy Value: 5 (will undercut by 5%)
Min Price: £2.00 (don't go below this)
Max Price: £50.00 (don't go above this)
Frequency: Hourly
Active: Yes
```

4. Click **"Save Rule"**

**What happens next:**
- The system checks competitor prices every hour
- Calculates new price based on your strategy
- Updates your Amazon/eBay listing automatically
- Logs all changes in Repricing History

---

## Step 5: Monitor Your Repricings (Ongoing)

### Check Repricing History
1. Go to **Repricing** page
2. Scroll to **"Repricing History"**
3. See all price changes:
   - Old price → New price
   - Competitor price used
   - Reason for change
   - Success/Failed status

### View Active Rules
1. Go to **Repricing** page
2. See all your rules
3. Edit/Delete/Pause as needed
4. Check "Last Run" timestamp

---

## Common Issues & Solutions

### Issue: "No API credentials found"
**Solution**: Make sure you added credentials in Settings → API Credentials

### Issue: "Failed to fetch competitor price"
**Solution**:
- Make sure book is actually listed by competitors
- Check that ISBN is correct
- Verify API credentials are valid

### Issue: "Price update failed"
**Solution**:
- Check that listing is still active on Amazon/eBay
- Verify your API permissions include "write" access
- Check Repricing History for error message

### Issue: "Repricing hasn't run yet"
**Solution**:
- Check rule is set to "Active: Yes"
- Rules run hourly - wait for first cycle
- Check "Last Run" timestamp

---

## What to Test & Give Feedback On

### Week 1: Setup & Configuration
- Was setup easy or confusing?
- Did API credential connection work?
- Were there any errors?

### Week 2: Repricing Functionality
- Did repricing run automatically?
- Were prices updated correctly?
- Did min/max bounds work?
- Any bugs or unexpected behavior?

### Week 3: Value & Pricing
- Did this save you time?
- Would you pay for this? How much?
- What features are missing?
- What works great?

---

## How to Give Feedback

### Method 1: Discord/Slack
Join our beta tester channel: [invite link]
- Quick questions
- Bug reports
- Feature requests
- Chat with other testers

### Method 2: Email
Email me: [your-email]
- Longer feedback
- Screenshots of issues
- Feature ideas

### Method 3: Bug Reports (In-App)
*(If you've implemented this)*
Click the "Report Bug" button in settings

### Method 4: Weekly Survey
I'll send you a short survey every week:
- 3-5 questions
- Takes 2 minutes
- Helps me understand what's working

---

## Beta Tester Expectations

### What I Need From You:
✅ Test for at least 2-3 weeks
✅ Report bugs when you find them
✅ Answer survey questions honestly
✅ Tell me if you'd pay for this (and how much)

### What You Get:
✅ Free access during beta
✅ 50% lifetime discount if you convert
✅ Direct input on features
✅ Early access to new features

### What I DON'T Expect:
❌ Perfection - it's beta, bugs happen
❌ 24/7 testing - use it when you can
❌ Glowing reviews - be honest, even if negative

---

## Important Beta Guidelines

### Data Safety
- Your API credentials are encrypted
- We only access listing data (not payment info)
- You can revoke access anytime in Amazon/eBay settings
- Beta data may be reset occasionally

### Feature Requests
- I'm tracking all requests
- Can't promise everything will be built
- Focusing on core repricing features first
- Your vote counts (most requested = highest priority)

### Communication
- I'll email weekly check-ins
- Response time: Usually within 24 hours
- Emergency? Tag me in Discord/Slack

---

## Pricing Strategies Explained

### 1. Match Lowest
**What it does**: Sets your price to match the lowest competitor
**Best for**: High-volume, commodity books
**Example**: Competitor at £9.99 → You're set to £9.99

### 2. Beat by Percent
**What it does**: Undercuts competitor by X%
**Best for**: Competitive markets where small differences matter
**Example**: Competitor at £10.00, you set 5% → You're at £9.50

### 3. Beat by Amount
**What it does**: Undercuts competitor by fixed £X amount
**Best for**: Premium books where you want aggressive pricing
**Example**: Competitor at £20.00, you set £2 → You're at £18.00

### 4. Target Margin *(Coming Soon)*
**What it does**: Maintains specific profit margin
**Best for**: Books with known costs, ensuring profitability
**Example**: Cost £5, you want 200% margin → Price £15.00

---

## FAQs

### Q: Will this work if I only have 10 books listed?
**A:** Yes! Even 10 books benefit from automated repricing.

### Q: How often does repricing run?
**A:** Every hour (configurable per rule)

### Q: Can I pause repricing temporarily?
**A:** Yes, toggle "Active" to No on any rule

### Q: What if I disagree with a price change?
**A:** You can manually override in Amazon/eBay, or adjust rule min/max

### Q: Does this work for FBA and FBM?
**A:** Yes, both Amazon fulfillment methods are supported

### Q: Can I have different rules for different books?
**A:** Yes! Create multiple rules and assign to specific listings

### Q: What happens if two rules apply to the same book?
**A:** The first matching rule is used (we'll add priority soon)

### Q: Can I test this without connecting real API credentials?
**A:** Not effectively - you need real credentials to test repricing

---

## Next Steps

1. ✅ Complete setup (API credentials)
2. ✅ Import at least 5-10 books
3. ✅ Create your first repricing rule
4. ✅ Wait 1 hour, check Repricing History
5. ✅ Give feedback after 1 week

---

## Contact & Support

**Email**: [your-email]
**Discord/Slack**: [invite-link]
**Response Time**: Usually within 24 hours

**Emergency? Something broken?**
Tag me in Discord with @[your-username] and I'll jump on it.

---

## Thank You! 🙏

You're one of the first people to use ISBNScout. Your feedback will directly shape this product.

Even if you hate it, tell me why. Negative feedback is just as valuable as positive.

Let's build something book sellers actually want to use!

**- [Your Name]**

---

## Quick Reference Card

**Create Rule**: Repricing → New Rule → Set strategy → Save
**View History**: Repricing → Scroll to History
**Manual Reprice**: Repricing → Select book → "Reprice Now"
**Edit Rule**: Repricing → Click rule → Edit → Save
**Import ISBNs**: Scan → Batch Scanner → Paste ISBNs → Start
**Add Credentials**: Settings → API Credentials → Add Platform

**Need Help?** Email [your-email] or Discord [link]
