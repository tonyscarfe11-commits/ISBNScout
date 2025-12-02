# Domain Email Setup for ISBN Scout

This guide explains how to configure your domain DNS records to send emails through Resend.

## Why Do I Need This?

Without proper DNS configuration:
- ❌ Your emails will go to spam
- ❌ Gmail/Outlook may reject your emails
- ❌ You can't use `noreply@isbnscout.com` as sender

With proper DNS configuration:
- ✅ High deliverability rates (90%+ inbox placement)
- ✅ Professional sender address
- ✅ Build email reputation
- ✅ Comply with modern email standards

## What You'll Add

You need to add **4 DNS records** to your domain:

| Record Type | Purpose | Required? |
|-------------|---------|-----------|
| **MX** | Route emails to Resend | Yes |
| **SPF (TXT)** | Authorize Resend to send | Yes |
| **DKIM (TXT)** | Sign emails cryptographically | Yes |
| **DMARC (TXT)** | Email authentication policy | Highly Recommended |

## Step-by-Step Setup

### Step 1: Add Domain in Resend

1. Go to [Resend Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter: `isbnscout.com`
4. Click **"Add"**

Resend will show you **custom DNS records** specific to your domain. Use those values below.

### Step 2: Add DNS Records

Go to your domain registrar's DNS management:

#### Option A: Using Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain: `isbnscout.com`
3. Go to **DNS** > **Records**
4. Click **"Add record"** for each:

**MX Record:**
```
Type: MX
Name: @
Mail server: feedback-smtp.us-east-1.amazonses.com
Priority: 10
Proxy status: DNS only (grey cloud)
TTL: Auto
```

**SPF Record:**
```
Type: TXT
Name: @
Content: v=spf1 include:amazonses.com ~all
Proxy status: DNS only
TTL: Auto
```

**DKIM Record:**
```
Type: TXT
Name: resend._domainkey
Content: [Copy from Resend dashboard - starts with p=MIGfMA0...]
Proxy status: DNS only
TTL: Auto
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=quarantine; rua=mailto:dmarc@isbnscout.com; pct=100; adkim=s; aspf=s
Proxy status: DNS only
TTL: Auto
```

**⚠️ Important:** Make sure **Proxy status is "DNS only"** (grey cloud). Orange cloud will break email!

#### Option B: Using Namecheap

1. Log in to [Namecheap](https://www.namecheap.com)
2. Go to **Domain List** > Select your domain
3. Click **"Advanced DNS"**
4. Add records:

**MX Record:**
```
Type: MX Record
Host: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: Automatic
```

**SPF Record:**
```
Type: TXT Record
Host: @
Value: v=spf1 include:amazonses.com ~all
TTL: Automatic
```

**DKIM Record:**
```
Type: TXT Record
Host: resend._domainkey
Value: [From Resend dashboard]
TTL: Automatic
```

**DMARC Record:**
```
Type: TXT Record
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@isbnscout.com
TTL: Automatic
```

#### Option C: Using GoDaddy

1. Log in to [GoDaddy](https://www.godaddy.com)
2. Go to **My Products** > **DNS**
3. Click **"Add"** for each record:

**MX Record:**
```
Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: 1 Hour
```

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
TTL: 1 Hour
```

**DKIM Record:**
```
Type: TXT
Name: resend._domainkey
Value: [From Resend dashboard]
TTL: 1 Hour
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@isbnscout.com
TTL: 1 Hour
```

#### Option D: Using Google Domains

1. Go to [Google Domains](https://domains.google.com)
2. Select your domain
3. Click **"DNS"** in left menu
4. Scroll to **"Custom resource records"**

**MX Record:**
```
Name: [blank]
Type: MX
TTL: 1H
Data: 10 feedback-smtp.us-east-1.amazonses.com
```

**SPF Record:**
```
Name: [blank]
Type: TXT
TTL: 1H
Data: v=spf1 include:amazonses.com ~all
```

**DKIM Record:**
```
Name: resend._domainkey
Type: TXT
TTL: 1H
Data: [From Resend dashboard]
```

**DMARC Record:**
```
Name: _dmarc
Type: TXT
TTL: 1H
Data: v=DMARC1; p=quarantine; rua=mailto:dmarc@isbnscout.com
```

### Step 3: Verify DNS Records

**Wait Time:** DNS changes can take 5 minutes to 48 hours to propagate. Usually it's fast (5-30 minutes).

**Check Status:**
1. Go back to [Resend Domains](https://resend.com/domains)
2. Click on your domain: `isbnscout.com`
3. You'll see verification status for each record:
   - ✅ Green checkmark = Verified
   - 🔄 Pending = Still propagating
   - ❌ Red X = Incorrect

**Manual Verification:**
```bash
# Check SPF
dig TXT isbnscout.com

# Check DKIM
dig TXT resend._domainkey.isbnscout.com

# Check DMARC
dig TXT _dmarc.isbnscout.com

# Check MX
dig MX isbnscout.com
```

Or use: [MXToolbox](https://mxtoolbox.com/SuperTool.aspx)

### Step 4: Update .env File

Once verified, update your environment variables:

```bash
# Change from test domain
EMAIL_FROM=ISBN Scout <noreply@isbnscout.com>

# Or use a specific sending address
EMAIL_FROM=ISBN Scout <hello@isbnscout.com>

# Reply-to address
EMAIL_REPLY_TO=support@isbnscout.com
```

## DNS Record Details Explained

### MX Record (Mail Exchange)
```
feedback-smtp.us-east-1.amazonses.com
```
- Routes incoming emails (if you want to receive)
- Not strictly required for sending only
- Priority 10 is standard

### SPF Record (Sender Policy Framework)
```
v=spf1 include:amazonses.com ~all
```
- `v=spf1` - SPF version 1
- `include:amazonses.com` - Allow Amazon SES (Resend's backend)
- `~all` - Soft fail for others (recommended for testing)
- Use `-all` (hard fail) once everything works

### DKIM Record (DomainKeys Identified Mail)
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```
- Long cryptographic public key
- Must be exactly as provided by Resend
- Goes under `resend._domainkey` subdomain

### DMARC Record (Domain-based Message Authentication)
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@isbnscout.com; pct=100; adkim=s; aspf=s
```
- `v=DMARC1` - DMARC version
- `p=quarantine` - Quarantine suspicious emails (use `p=none` initially for testing)
- `rua=mailto:dmarc@isbnscout.com` - Where to send reports
- `pct=100` - Apply policy to 100% of emails
- `adkim=s` - Strict DKIM alignment
- `aspf=s` - Strict SPF alignment

**DMARC Policy Progression:**
1. Start with `p=none` (monitor only)
2. After 1-2 weeks, change to `p=quarantine` (send suspicious to spam)
3. After stable, change to `p=reject` (reject suspicious emails)

## Common Issues & Solutions

### Issue: Records Not Verifying

**Solution:**
1. Wait 1-2 hours for DNS propagation
2. Check for typos in record values
3. Ensure no extra spaces in TXT records
4. Remove quotes if your DNS provider auto-adds them

### Issue: Emails Still Going to Spam

**Checklist:**
- ✅ All 4 DNS records verified in Resend
- ✅ Using verified domain in `EMAIL_FROM`
- ✅ Not sending to role accounts (admin@, noreply@)
- ✅ Email content not too salesy
- ✅ No spam trigger words (FREE, CLICK HERE, !!!)
- ✅ Warm up your domain (start with low volume)

### Issue: Cloudflare Orange Cloud Enabled

**Problem:** Cloudflare's proxy breaks email DNS
**Solution:** Click the cloud icon to turn it grey (DNS only)

### Issue: Multiple SPF Records

**Problem:** You can only have ONE SPF record per domain
**Solution:** Combine them:
```
v=spf1 include:amazonses.com include:_spf.google.com ~all
```

## Testing Your Setup

### 1. Send Test Email

After DNS verification, test sending:

```bash
# Start your server
npm run dev

# Create a test account (will send welcome email)
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"your-email@gmail.com","password":"test123"}'
```

### 2. Check Email Headers

When you receive the email, check headers for:
- ✅ `DKIM: PASS`
- ✅ `SPF: PASS`
- ✅ `DMARC: PASS`

**In Gmail:**
1. Open the email
2. Click three dots (⋮) > **Show original**
3. Look for authentication results

### 3. Use Email Testing Tools

**Mail Tester:** https://www.mail-tester.com
1. Send email to address shown
2. Get a score out of 10
3. Follow recommendations
4. Aim for 9/10 or higher

**GlockApps:** https://glockapps.com
- Tests inbox placement
- Shows spam score
- Checks authentication

## Subdomain Setup (Alternative)

If you want to keep main domain separate, use a subdomain:

**Setup:**
1. In Resend, add domain: `mail.isbnscout.com`
2. Add same DNS records but with subdomain
3. Use in .env:
   ```bash
   EMAIL_FROM=ISBN Scout <noreply@mail.isbnscout.com>
   ```

**Benefits:**
- Isolates email reputation
- Keeps main domain clean
- Easier to troubleshoot

## Security Best Practices

### 1. Use Dedicated Email Subdomain
```
noreply@mail.isbnscout.com  # Better
noreply@isbnscout.com        # Also fine
```

### 2. Set Strict DMARC Eventually
```
# Start lenient (monitoring)
v=DMARC1; p=none; rua=mailto:dmarc@isbnscout.com

# Then strict (recommended for production)
v=DMARC1; p=reject; rua=mailto:dmarc@isbnscout.com; adkim=s; aspf=s
```

### 3. Monitor DMARC Reports
- Set up `dmarc@isbnscout.com` email address
- Review weekly reports
- Use tools like [Postmark DMARC Digests](https://dmarc.postmarkapp.com/)

### 4. Rotate DKIM Keys Yearly
- Resend handles this automatically
- Update DNS when notified

## Email Sending Addresses

### Recommended Setup

```bash
# Transactional emails (receipts, confirmations)
noreply@isbnscout.com

# Support/replies
support@isbnscout.com

# Marketing (if you add it later)
hello@isbnscout.com

# System notifications
notify@isbnscout.com
```

Update `.env`:
```bash
EMAIL_FROM=ISBN Scout <noreply@isbnscout.com>
EMAIL_REPLY_TO=support@isbnscout.com
```

## Monitoring & Maintenance

### Weekly
- Check Resend dashboard for bounces
- Review failed sends
- Monitor delivery rates

### Monthly
- Review DMARC reports
- Check spam complaints
- Verify DNS records still valid

### Quarterly
- Test email deliverability
- Review and update email templates
- Check email reputation (use SenderScore)

## Quick Reference

### Minimal Setup (Start Here)
1. ✅ Add domain in Resend
2. ✅ Add SPF record
3. ✅ Add DKIM record
4. ✅ Wait for verification
5. ✅ Update .env

### Production Ready
1. ✅ All above
2. ✅ Add DMARC record
3. ✅ Add MX record (if receiving emails)
4. ✅ Test with mail-tester.com
5. ✅ Warm up domain (start with low volume)

## Need Help?

- **Resend Docs:** https://resend.com/docs/dashboard/domains/introduction
- **DNS Check Tool:** https://mxtoolbox.com
- **Email Testing:** https://www.mail-tester.com
- **DMARC Monitor:** https://dmarc.postmarkapp.com

## Summary Checklist

Before going live:

- [ ] Domain added in Resend
- [ ] SPF record added and verified (green checkmark)
- [ ] DKIM record added and verified (green checkmark)
- [ ] DMARC record added and verified (green checkmark)
- [ ] MX record added (if receiving emails)
- [ ] `.env` updated with your domain
- [ ] Test email sent successfully
- [ ] Email landed in inbox (not spam)
- [ ] Email headers show PASS for SPF, DKIM, DMARC
- [ ] Mail-tester.com score 8+/10

You're ready to send! 🚀
