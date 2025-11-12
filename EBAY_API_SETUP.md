# eBay Finding API Setup Guide

## Quick Start (10 minutes)

The eBay Finding API is **completely FREE** and allows 5,000 requests per day. No credit card needed!

### Step 1: Create eBay Developer Account
1. Go to: https://developer.ebay.com/
2. Click "Register" in the top right
3. Sign in with your eBay account (or create one)
4. Accept the developer agreement

### Step 2: Get Your App ID (API Key)
1. Go to: https://developer.ebay.com/my/keys
2. Click "Create a keyset"
3. Fill in the form:
   - **App Title**: ISBNScout (or whatever you like)
   - **Environment**: Production
   - **Primary Category**: Books, Movies & Music
4. Click "Create keyset"
5. Your **App ID (Client ID)** will be displayed
   - It looks like: `ISBNScou-ISBNScou-PRD-12345678a-12345678`
6. **Copy the App ID** - this is your API key!

### Step 3: Add to Your App
1. Create or edit `.env` file in your project root
2. Add this line:
   ```
   EBAY_APP_ID=your-app-id-here
   ```
3. Restart your server

## What You Get

✅ **FREE**: No cost whatsoever
✅ **5,000 requests/day**: More than enough for testing
✅ **Real-time pricing**: Current eBay listings for any ISBN
✅ **No authentication needed**: Just the App ID
✅ **UK marketplace**: Automatically searches eBay.co.uk

## Testing

Test with these ISBNs:
- `9780545010221` - Harry Potter (usually £5-15 on eBay)
- `9780316769488` - Catcher in the Rye (usually £3-8)
- `9780061120084` - To Kill a Mockingbird (usually £4-10)

## What You'll See

When you scan an ISBN, the app will:
1. Look up book details (Google Books)
2. Fetch eBay pricing automatically
3. Show: Current price, average price, number of listings
4. Display in the toast notification and book card

## API Limits

| Tier | Requests/Day | Cost |
|------|--------------|------|
| Free | 5,000 | £0 |
| Enhanced | 25,000 | Contact eBay |
| Enterprise | Unlimited | Contact eBay |

**For MVP: 5,000/day is plenty** (that's 166 scans per hour!)

## Troubleshooting

### Error: "eBay API not configured"
- Check your App ID is in `.env`
- Make sure it's named `EBAY_APP_ID` (not EBAY_CLIENT_ID)
- Restart your server after adding it

### Error: "Invalid eBay credentials"
- Your App ID might be incorrect
- Make sure you copied the FULL App ID (long string with dashes)
- Check for extra spaces when pasting

### No prices returned
- Some books aren't listed on eBay
- Try a more popular ISBN (Harry Potter always works)
- Check the console logs for API errors

### Rate limit exceeded
- You've made 5,000 requests today
- Resets at midnight PST
- For production, implement caching to reduce API calls

## Advanced: What Data You Get

The eBay Finding API returns:
- **Current Price**: Lowest active listing
- **Average Price**: Average of all listings
- **Min/Max Price**: Price range
- **Sold Count**: How many sold recently
- **Active Listings**: How many currently listed
- **Top 5 Listings**: With titles, conditions, seller info

You can use this to:
- Show users what books are ACTUALLY selling for
- Calculate profit margins
- Determine if a book is worth buying
- Compare eBay vs Amazon pricing (when you add Keepa)

## Next Steps

Once eBay is working:
1. ✅ You have book details (Google Books)
2. ✅ You have eBay pricing (eBay Finding API)
3. ⏳ Add Amazon pricing (Keepa API - £16/month)
4. ⏳ Add Stripe for payments (FREE)

## Cost Comparison

| Service | Cost | Value |
|---------|------|-------|
| Google Books | £0 | ISBN lookup |
| eBay Finding | £0 | eBay pricing |
| **Subtotal** | **£0** | **Core functionality** |
| Keepa (optional) | £16/mo | Amazon pricing |
| OpenAI (optional) | £10-20/mo | AI features |

**You can launch with ZERO cost using just Google Books + eBay!**

## Alternative: No API Key

If you don't want to get an eBay API key right now:
- The app will still work
- Google Books will still fetch book details
- You just won't see pricing
- Users can manually enter prices

But seriously, it takes 10 minutes and it's FREE. Just do it! 😄
