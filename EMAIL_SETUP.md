# Transactional Email System Setup

This document explains how to set up and use the transactional email system for ISBN Scout.

## Overview

The email system is built using [Resend](https://resend.com), a modern email API designed for developers. It provides:

- **Automated welcome emails** when users sign up
- **Subscription confirmation emails** when users subscribe
- **Payment receipts** for successful payments
- **Trial expiration reminders** (3 days, 1 day, and on expiry)
- **Affiliate approval notifications**

## Setup Steps

### 1. Sign up for Resend

1. Go to [https://resend.com](https://resend.com)
2. Create a free account
3. Free tier includes:
   - 100 emails/day
   - 3,000 emails/month
   - Perfect for getting started

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "ISBN Scout Production")
5. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# For testing, use Resend's test domain
EMAIL_FROM=ISBN Scout <onboarding@resend.dev>
EMAIL_REPLY_TO=support@isbnscout.com

# Your application URL (for links in emails)
APP_URL=https://isbnscout.com
```

### 4. Verify Your Domain (Production)

For production use, you should verify your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `isbnscout.com`)
4. Add the provided DNS records to your domain provider
5. Wait for verification (usually takes a few minutes)
6. Update `.env`:
   ```bash
   EMAIL_FROM=ISBN Scout <noreply@isbnscout.com>
   ```

## Email Types

### 1. Welcome Email

Sent automatically when a user signs up.

**Trigger:** User registration
**Location:** `server/auth-service.ts:50`
**Template:** `server/email-service.ts:249`

**Includes:**
- Personal greeting
- Trial information (14 days)
- Feature highlights
- Call-to-action button

### 2. Subscription Confirmation

Sent when a user successfully subscribes to a plan.

**Trigger:** Stripe webhook `checkout.session.completed`
**Location:** `server/routes/subscriptions.ts:217`
**Template:** `server/email-service.ts:291`

**Includes:**
- Plan details (Pro/Elite, Monthly/Annual)
- Amount charged
- Next billing date
- Link to dashboard

### 3. Payment Receipt

Sent for each successful recurring payment.

**Trigger:** Stripe webhook `invoice.payment_succeeded`
**Location:** `server/routes/subscriptions.ts:302`
**Template:** `server/email-service.ts:489`

**Includes:**
- Payment amount
- Plan name
- Payment date
- Optional invoice download link

### 4. Trial Expiring Reminders

Automated reminders before trial expiration.

**Trigger:** Cron job (see below)
**Schedule:** 3 days before, 1 day before, on expiry day
**Template:** `server/email-service.ts:337`

**Includes:**
- Days remaining
- Expiry date
- Subscription plans
- Call-to-action to subscribe

### 5. Affiliate Approval

Sent when an affiliate application is approved.

**Trigger:** Manual affiliate approval
**Template:** `server/email-service.ts:417`

**Includes:**
- Referral code
- Referral link
- Commission details
- Dashboard link

## Trial Reminder Cron Job

The trial reminder script needs to be run daily. Here are setup options:

### Option 1: Using Render Cron Jobs

1. In Render dashboard, create a **Cron Job**
2. Set schedule: `0 9 * * *` (runs daily at 9 AM UTC)
3. Set command: `tsx scripts/send-trial-reminders.ts`
4. Connect to your GitHub repository

### Option 2: Using Railway Cron

1. Add to `railway.toml`:
   ```toml
   [[services]]
   name = "trial-reminders"

   [services.cron]
   schedule = "0 9 * * *"
   command = "tsx scripts/send-trial-reminders.ts"
   ```

### Option 3: Using GitHub Actions

1. Create `.github/workflows/trial-reminders.yml`:
   ```yaml
   name: Trial Reminder Emails

   on:
     schedule:
       - cron: '0 9 * * *'  # Daily at 9 AM UTC
     workflow_dispatch:  # Allow manual trigger

   jobs:
     send-reminders:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: oven-sh/setup-bun@v1
         - run: bun install
         - run: tsx scripts/send-trial-reminders.ts
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
             RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
             EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
             APP_URL: ${{ secrets.APP_URL }}
   ```

### Option 4: Manual Cron (Linux Server)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 9 AM)
0 9 * * * cd /path/to/isbn-scout && tsx scripts/send-trial-reminders.ts >> logs/trial-reminders.log 2>&1
```

## Testing Emails

### Test Welcome Email

```bash
# Create a test user via the API
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Test Trial Reminders Manually

```bash
# Run the script directly
tsx scripts/send-trial-reminders.ts
```

### Test in Development

The email service will log to console when `RESEND_API_KEY` is not set:

```
[Email] Would send welcome email to: user@example.com
```

This allows you to develop without sending real emails.

## Email Templates

All email templates are responsive HTML with:
- Mobile-friendly design
- Brand colors (purple gradient)
- Clear call-to-action buttons
- Professional styling

Templates are located in `server/email-service.ts`:
- `getWelcomeEmailTemplate()`
- `getSubscriptionConfirmationTemplate()`
- `getTrialExpiringTemplate()`
- `getTrialExpiredTemplate()`
- `getAffiliateApprovedTemplate()`
- `getPaymentReceiptTemplate()`

### Customizing Templates

To customize email templates:

1. Edit the template methods in `server/email-service.ts`
2. Keep the structure responsive
3. Test on mobile devices
4. Use inline CSS for maximum compatibility

## Monitoring & Logs

### View Sent Emails

1. Log in to Resend dashboard
2. Go to **Emails** section
3. See all sent emails, delivery status, and opens

### Check Logs

The email service logs all actions:

```bash
[Email] Service initialized with Resend
[Email] Welcome email sent to: user@example.com
[Email] Subscription confirmation sent to: user@example.com
[Email] Failed to send welcome email: [error details]
```

### Error Handling

All email sends are non-blocking:
- User registration completes even if email fails
- Stripe webhooks process even if email fails
- Errors are logged but don't affect core functionality

## Rate Limits

### Resend Free Tier
- 100 emails/day
- 3,000 emails/month

### Resend Pro ($20/month)
- 50,000 emails/month
- $1 per 1,000 additional emails

### Handling Limits

The trial reminder script includes a 100ms delay between emails to avoid rate limiting:

```typescript
await new Promise(resolve => setTimeout(resolve, 100));
```

## Best Practices

1. **Use Your Own Domain** - Verify your domain in Resend for better deliverability
2. **Monitor Bounces** - Check Resend dashboard for bounced emails
3. **Test Templates** - Send test emails before deployment
4. **Unsubscribe Links** - Add unsubscribe options for marketing emails (not required for transactional)
5. **GDPR Compliance** - Only send emails users expect (welcome, receipts, etc.)

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify API key in Resend dashboard
3. Check application logs for error messages
4. Ensure email address is valid

### Emails Going to Spam

1. Verify your domain in Resend
2. Add SPF, DKIM, and DMARC records
3. Avoid spam trigger words
4. Use professional "From" address

### Template Issues

1. Test HTML in email testing tools
2. Keep CSS inline
3. Test on multiple email clients
4. Use tables for layout (old school but reliable)

## Support

- **Resend Documentation:** https://resend.com/docs
- **Resend Support:** support@resend.com
- **Email Service Code:** `server/email-service.ts`

## Next Steps

Consider adding:
- **Password reset emails**
- **Email verification**
- **Weekly digest emails**
- **Custom promotional emails**
- **Email preferences for users**

All templates can be extended using the existing pattern in `server/email-service.ts`.
