# Amazon Product Advertising API - Quick Setup

## Step 1: Sign Up for Amazon Associates

1. Go to: **https://affiliate-program.amazon.co.uk/**
2. Click **"Join Now for Free"** (top right)
3. Sign in with your Amazon account (or create one)

## Step 2: Complete Application

### Your Account Information
- Fill in your name, address, phone number
- Click **Continue**

### Your Website(s) and Mobile App(s)
- **Website URL**: Enter your ISBN Scout URL
  - Example: `https://isbnscout-app.replit.app` (or your deployment URL)
- **Mobile App**: Enter app name if applicable
  - Example: `ISBN Scout Mobile`
- Click **Add** then **Continue**

### Your Profile
- **What topics does your website cover?**
  - Select: `Books & Media` or `E-commerce`
- **What type of items do you intend to list?**
  - Write: "Books, textbooks, collectible books"
- **How do you drive traffic to your website?**
  - Select options that apply (SEO, Social Media, etc.)
- **How do you usually build links?**
  - Select: `Content Management System`
- **How many visitors do you get per month?**
  - Select realistically (you can start with lower options)
- Click **Continue**

### Enter Payment and Tax Information
- Enter your payment details (how Amazon will pay you commissions)
- Complete tax interview
- Click **Finish**

## Step 3: Get Your Associate Tag

After approval:
1. You'll see your dashboard
2. Look for **"Your Associate Tag"** or **"Tracking ID"**
3. It will look like: `yourname-21`
4. **Copy this** - you'll need it later

## Step 4: Get API Credentials

1. In your Associates dashboard, go to **Tools** menu
2. Click **Product Advertising API**
3. Click **"Add credentials"** or **"Request credentials"**
4. Accept the License Agreement
5. You'll see:
   - **Access Key ID**: Starts with `AKIA...`
   - **Secret Access Key**: Long string (shown only once!)

6. **IMPORTANT:** Click **Download credentials** to save them
   - Or copy both keys immediately
   - You won't be able to see the Secret Key again!

## Step 5: Add Credentials to Your App

1. Open your Replit project
2. Go to **Secrets** (lock icon on left sidebar) or edit `.env` file
3. Add these three secrets:

```
AMAZON_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AMAZON_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AMAZON_PARTNER_TAG=yourname-21
```

Replace with your actual values!

## Step 6: Restart Your App

1. Stop your server (if running)
2. Start it again: `npm run dev`
3. You should see: `[Amazon PA-API] Initialized: Credentials found`

## Step 7: Test It!

Scan a book or add a book manually - you should now see Amazon pricing!

---

## Common Issues

### ❌ Application Pending
- Amazon reviews applications (usually within 24-48 hours)
- You can still get credentials but API won't work until approved
- Check your email for approval notification

### ❌ "Add credentials" button not showing
- You may need to wait for application approval
- Try logging out and back in
- Contact Amazon Associates support

### ❌ Can't see Secret Access Key again
- You need to create new credentials
- Go to Tools → Product Advertising API → Manage credentials
- Click "Add credentials" to create a new set

### ❌ Still showing "Not configured"
- Check all 3 variables are in Replit Secrets (or `.env`)
- Make sure there are no extra spaces
- Restart your server

---

## Important Notes

⚠️ **Sales Requirement**: You need 3+ sales within 180 days to keep API access
- Sales come from affiliate links on your website/app
- Add Amazon affiliate links to keep access active
- Amazon will warn you before revoking access

💡 **Alternative**: If you can't maintain sales, we can switch to **Keepa API** (£16/month, no sales requirement)

---

## Need Help?

- Amazon Associates Help: https://affiliate-program.amazon.co.uk/help/
- PA-API Documentation: https://webservices.amazon.com/paapi5/documentation/
- Contact me if you get stuck!
