# Amazon Product Advertising API Setup Guide

## Overview
The Amazon Product Advertising API (PA-API) allows you to fetch pricing data from Amazon UK marketplace. It's **FREE** but requires an Amazon Associates account.

## Requirements
- Amazon Associates account (free affiliate program)
- Valid website or mobile app (can be your ISBN Scout app)
- At least 3 qualifying sales within 180 days (or API access may be revoked)

## Step-by-Step Setup

### 1. Sign Up for Amazon Associates (UK)
1. Go to: https://affiliate-program.amazon.co.uk/
2. Click "Join Now for Free"
3. Fill in your account information
4. When asked about your website/app:
   - Website URL: Your ISBN Scout deployment URL (e.g., https://your-app.replit.app)
   - Describe your app: "Book pricing and inventory management for booksellers"
5. Complete the application

### 2. Get Your Associate Tag
After approval, you'll receive an **Associate Tag** (also called Partner Tag or Tracking ID)
- Format: `yourname-21` (for UK, ends in -21)
- You can find this in your Associates account dashboard

### 3. Get API Credentials
1. Log in to: https://affiliate-program.amazon.co.uk/
2. Go to **Tools** → **Product Advertising API**
3. Click "Add credentials" or "Manage your credentials"
4. You'll receive:
   - **Access Key** (starts with `AKIA...`)
   - **Secret Key** (long alphanumeric string - **keep this secret!**)

### 4. Add to Environment Variables
Add these to your `.env` file:

```bash
# Amazon Product Advertising API
AMAZON_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AMAZON_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AMAZON_PARTNER_TAG=yourname-21
```

**Important:**
- Replace the example values with your actual credentials
- Never commit your `.env` file to git
- Keep your Secret Key private

## Rate Limits
- **1 request per second**
- **8,640 requests per day** (generous free tier)
- Throttling applies if you exceed limits

## Important Notes

### Sales Requirement
Amazon requires you to make **at least 3 qualifying sales within 180 days** to maintain API access:
- Sales must come from affiliate links
- You can promote Amazon products on your app/website
- If you don't meet this requirement, API access may be suspended
- You'll receive warnings before suspension

### Alternative: Keepa (Paid)
If you can't maintain the sales requirement, consider **Keepa API** instead:
- No sales requirement
- More historical data
- Cost: ~£16/month
- Setup guide: https://keepa.com/#!api

## Testing Your Setup

Run this test script:

```bash
npx tsx -e "
import 'dotenv/config';
import { amazonPricingService } from './server/amazon-pricing-service';

async function test() {
  const testISBN = '9780747532699'; // Harry Potter
  console.log('Testing Amazon PA-API...');
  const result = await amazonPricingService.getPriceByISBN(testISBN);
  console.log(result ? '✅ Working!' : '❌ No results');
}
test();
"
```

## Troubleshooting

### "Not configured" message
- Check that all 3 environment variables are set in `.env`
- Restart your server after adding credentials

### "RequestThrottled" error
- You're making too many requests (>1 per second)
- Wait a bit and retry

### "InvalidSignature" error
- Your Secret Key is incorrect
- Re-generate credentials in Amazon Associates dashboard

### No results found
- The book may not be available on Amazon UK
- Try a different ISBN
- Check that the ISBN is valid

## Resources
- Amazon PA-API Documentation: https://webservices.amazon.com/paapi5/documentation/
- Amazon Associates UK: https://affiliate-program.amazon.co.uk/
- API Scratchpad (for testing): https://webservices.amazon.com/paapi5/scratchpad/

## Next Steps
Once configured, Amazon pricing will automatically be fetched when:
- Scanning books (ISBN or shelf scan)
- Adding books manually
- The app will show both eBay and Amazon prices for comparison
