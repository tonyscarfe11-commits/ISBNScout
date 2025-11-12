# OpenAI API Setup Guide

This guide will help you set up the OpenAI API for AI-powered book recognition in ISBNScout.

---

## Why OpenAI?

The AI Book Recognition feature uses OpenAI's vision models to:
- Extract book title and author from photos
- Detect ISBN from cover images
- Assess book condition
- Generate keywords for better searchability

**This is OPTIONAL** - your app works great with just barcode scanning!

---

## Step-by-Step Setup

### 1. Create OpenAI Account

1. Visit https://platform.openai.com/signup
2. Sign up using:
   - Email address
   - Google account
   - Microsoft account
3. Verify your email address

### 2. Add Payment Method

⚠️ **Payment Required** (but very cheap!)

1. Go to https://platform.openai.com/account/billing
2. Click "Add payment method"
3. Enter credit/debit card details
4. Set up billing preferences

**Important Notes:**
- OpenAI requires payment info even for testing
- New accounts get $5 in free credits
- Free credits expire after 3 months
- You can set spending limits to control costs

### 3. Get Your API Key

1. Navigate to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a descriptive name:
   - Example: "ISBNScout Book Scanner"
4. **⚠️ Copy the key IMMEDIATELY**
   - Format: `sk-proj-...` (starts with sk-)
   - You won't be able to see it again!
   - Store it securely

### 4. Add to Your Replit Project

**Option A: Using Replit Secrets (Recommended)**
1. In Replit, click the lock icon (🔒) in the left sidebar
2. Click "Add new secret"
3. Enter:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Your API key (paste the sk-... key)
4. Click "Add Secret"

**Option B: Using .env File**
1. Open or create `.env` file in project root
2. Add this line:
   ```bash
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
3. Replace with your real key

**⚠️ Never commit .env to git!**

### 5. Restart Your Server

After adding the key:
1. Stop the current server (if running)
2. Restart: `npm run dev`
3. Check logs for confirmation:
   ```
   [AI] OpenAI API configured successfully
   ```

---

## Pricing Information

### Free Credits
- **$5 in free credits** for new accounts
- Valid for 3 months after account creation
- Enough for approximately 33-50 book scans

### Pay-As-You-Go Pricing (After Free Credits)

**GPT-4o-mini (Recommended for book scanning):**
- Input: $0.150 per 1M tokens (~600 images)
- Output: $0.600 per 1M tokens
- **Approximate cost per book scan:** $0.01 - 0.02

**GPT-4o (More powerful but not needed):**
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens
- **Not recommended** - GPT-4o-mini is perfect for this use case

### Example Usage Costs
- 10 book scans: ~$0.10 - $0.20
- 100 book scans: ~$1.00 - $2.00
- 1,000 book scans: ~$10.00 - $20.00

**Very affordable for personal use!**

---

## Setting Usage Limits

Protect yourself from unexpected charges:

1. Go to https://platform.openai.com/account/limits
2. Set a "Hard limit" (e.g., $10/month)
3. Set a "Soft limit" for email alerts (e.g., $5/month)
4. Enable email notifications

**Recommended Settings for Personal Use:**
- Hard limit: $10/month
- Soft limit: $5/month
- Email alerts: Enabled

---

## Testing the AI Feature

Once configured, test it out:

### Using URL:
1. Go to your app's **Scan** page
2. Find the "AI Book Recognition" section
3. Paste a book cover image URL
4. Click "Recognize Book with AI"
5. Wait 2-5 seconds for results

### Using Upload:
1. Click "Upload Book Photo"
2. Select an image from your device
3. Click "Recognize Book with AI"
4. AI will analyze and extract book details

### What AI Extracts:
- ✅ Book title
- ✅ Author name
- ✅ ISBN (if visible on cover)
- ✅ Book condition estimate
- ✅ Keywords for categorization

---

## Troubleshooting

### "OpenAI API key not configured"
**Solution:**
- Check the key is added to Replit Secrets or .env
- Restart the server
- Verify key starts with `sk-proj-` or `sk-`

### "Rate limit exceeded"
**Solution:**
- You've hit your usage limit
- Check usage at https://platform.openai.com/usage
- Increase your limit or wait for reset

### "Insufficient credits"
**Solution:**
- Free credits expired or used up
- Add payment method and enable billing
- Check balance at https://platform.openai.com/account/billing

### "Invalid API key"
**Solution:**
- Key might be revoked or incorrect
- Generate a new key
- Update in Replit Secrets

### Images not processing
**Solution:**
- Ensure image URL is publicly accessible
- For uploaded images, check file size (<20MB)
- Supported formats: JPG, PNG, WEBP

---

## Alternative: Use Without OpenAI

Your app works perfectly without OpenAI! You can use:

**✅ Camera Barcode Scanning** (Primary Method)
- Real-time barcode detection
- Instant ISBN lookup
- No API costs
- Works offline once book data cached

**✅ Manual ISBN Entry**
- Type or paste ISBN
- Google Books lookup (free)
- eBay pricing (free)

**✅ Cover Photo with eBay Search**
- Take photo of cover
- Search eBay by book title (manual)
- No AI needed

**The AI feature is a nice-to-have, not essential!**

---

## Security Best Practices

### Protect Your API Key:
1. ✅ Never commit to git
2. ✅ Use Replit Secrets or environment variables
3. ✅ Set usage limits
4. ✅ Rotate keys periodically
5. ✅ Don't share keys publicly

### Monitor Usage:
1. Check usage dashboard weekly
2. Set up billing alerts
3. Review API logs for unusual activity
4. Disable key if compromised

---

## Model Comparison

Our app uses **GPT-4o-mini** by default (best value):

| Feature | GPT-4o-mini | GPT-4o |
|---------|-------------|---------|
| **Cost** | $0.15/1M tokens | $2.50/1M tokens |
| **Speed** | Fast (1-2s) | Slower (3-5s) |
| **Accuracy** | Excellent | Slightly better |
| **Best for** | Book scanning ✅ | Complex analysis |

**Recommendation:** Stick with GPT-4o-mini - it's perfect for book recognition and 16x cheaper!

---

## Useful Links

**Account Management:**
- Sign up: https://platform.openai.com/signup
- API keys: https://platform.openai.com/api-keys
- Billing: https://platform.openai.com/account/billing
- Usage: https://platform.openai.com/usage
- Limits: https://platform.openai.com/account/limits

**Documentation:**
- API docs: https://platform.openai.com/docs
- Vision guide: https://platform.openai.com/docs/guides/vision
- Pricing: https://openai.com/api/pricing/
- Rate limits: https://platform.openai.com/docs/guides/rate-limits

**Support:**
- Help center: https://help.openai.com/
- Community forum: https://community.openai.com/
- Status page: https://status.openai.com/

---

## Next Steps

**Tomorrow's Session:**
1. ✅ Get OpenAI API key
2. ✅ Add to Replit Secrets
3. ✅ Test AI book recognition
4. ✅ Try scanning a book cover photo

**Or skip and focus on:**
- Testing camera barcode scanning on mobile
- Adding more books to your library
- Testing the profit calculator
- Exploring eBay pricing (after rate limit resets)

---

## Summary

**OpenAI Setup Checklist:**
- [ ] Create OpenAI account
- [ ] Add payment method
- [ ] Generate API key
- [ ] Add to Replit Secrets as `OPENAI_API_KEY`
- [ ] Restart server
- [ ] Test with a book cover image
- [ ] Set usage limits ($10/month recommended)
- [ ] Enable billing alerts

**Remember:** This is optional! Your app's main feature (barcode scanning) works perfectly without it.

---

*Last updated: November 12, 2025*
