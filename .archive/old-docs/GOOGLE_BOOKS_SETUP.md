# Google Books API Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Google Cloud Project
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click "Select a project" → "New Project"
4. Name it "ISBNScout" (or whatever you like)
5. Click "Create"

### Step 2: Enable Google Books API
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Books API"
3. Click on "Books API"
4. Click "Enable"

### Step 3: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Your API key will be created (looks like: `AIzaSyC...`)
4. **IMPORTANT**: Click "Restrict Key" (recommended for security)
   - Under "API restrictions", select "Restrict key"
   - Choose "Books API" from the dropdown
   - Click "Save"

### Step 4: Add to Your App
1. Copy your API key
2. Create a `.env` file in your project root (if you don't have one)
3. Add this line:
   ```
   GOOGLE_BOOKS_API_KEY=AIzaSyC...your-key-here
   ```
4. Restart your server

## Testing

Test with these real ISBNs:
- `9780545010221` - Harry Potter and the Deathly Hallows
- `9780316769488` - The Catcher in the Rye
- `9780061120084` - To Kill a Mockingbird
- `9780141439518` - Pride and Prejudice
- `9780743273565` - The Great Gatsby

## API Limits

**Without API Key:**
- 100 requests per day
- 1 request per second

**With API Key (Free):**
- 1,000 requests per day
- 10 requests per second

**How many scans can you do?**
- With key: ~30 scans per day (1,000 requests / ~30 requests per scan session)
- For MVP testing, this is plenty
- For production, you may need to optimize or upgrade

## Troubleshooting

### Error: "Google Books API key is invalid"
- Check your API key is correct in `.env`
- Make sure you enabled Books API in Google Cloud Console
- Wait 1-2 minutes after creating the key (propagation delay)

### Error: "Rate limit exceeded"
- You've hit the daily limit (100 or 1,000 requests)
- Wait until midnight PST for reset
- Consider caching results to reduce API calls

### No results for ISBN
- Try the ISBN with dashes: `978-0-545-01022-1`
- Try the ISBN without dashes: `9780545010221`
- Some books may not be in Google Books database
- Try searching by title instead

## Cost

✅ **FREE Forever**
- Google Books API is completely free
- No credit card required
- 1,000 requests/day is generous for testing

## Next Steps

Once Google Books is working:
1. Add eBay Finding API (also FREE)
2. Test with real book scanning workflow
3. Consider adding Keepa API for Amazon pricing (£16/month)

## Alternative: Open Library API

If you don't want to set up Google Cloud, you can use Open Library API:
- **No API key needed**
- **Completely free**
- **Unlimited requests** (be reasonable)

However, Google Books has:
- Better data quality
- More book coverage
- Faster response times
- Better thumbnail images

For production, Google Books is recommended.
