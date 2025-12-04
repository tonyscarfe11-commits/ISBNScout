# Email Receiving Setup for ISBN Scout

## Problem

Your emails are configured to use `support@isbnscout.com` as the reply-to address, but you don't have email receiving configured. When customers try to email you, they get a bounce-back error:

```
server unavailable or unable to receive mail
```

## Solution

You need to set up email **receiving/forwarding** for your domain. You have three options:

### Option 1: Cloudflare Email Routing (Recommended - FREE)

**Best for:** Simple forwarding to your personal email
**Cost:** FREE
**Setup time:** 5 minutes

#### Setup Steps:

1. **Ensure your domain is on Cloudflare**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Make sure `isbnscout.com` is added to your account
   - Ensure Cloudflare is your nameserver

2. **Enable Email Routing**
   - In Cloudflare dashboard, select your domain
   - Go to **Email** > **Email Routing**
   - Click **Get Started** or **Enable Email Routing**

3. **Configure DNS Records (Automatic)**
   - Cloudflare will automatically add the necessary MX and TXT records
   - You don't need to do this manually
   - These records are protected from accidental deletion

4. **Create Email Address**
   - Click **Create address**
   - **Custom address:** `support@isbnscout.com`
   - **Destination:** Enter your personal email (e.g., `tonyscarfe@icloud.com`)
   - Click **Save**

5. **Verify Destination Email**
   - Check your personal email inbox
   - Click the verification link from Cloudflare
   - Forwarding will activate immediately after verification

6. **Test It**
   - Send a test email to `support@isbnscout.com`
   - You should receive it in your personal inbox within seconds

#### Additional Email Addresses

You can create multiple forwarding addresses for free:
```
support@isbnscout.com → your-email@gmail.com
hello@isbnscout.com → your-email@gmail.com
sales@isbnscout.com → your-email@gmail.com
```

**Catch-all routing:** You can also set up catch-all forwarding to receive emails sent to ANY address at your domain.

---

### Option 2: ImprovMX (Alternative - FREE)

**Best for:** If you're not using Cloudflare
**Cost:** FREE (up to 10 aliases)
**Setup time:** 10 minutes

#### Setup Steps:

1. **Sign up for ImprovMX**
   - Go to [improvmx.com](https://improvmx.com)
   - Create a free account

2. **Add Your Domain**
   - Click **Add Domain**
   - Enter: `isbnscout.com`

3. **Configure DNS Records**
   - ImprovMX will show you MX records to add
   - Go to your domain registrar (Namecheap, GoDaddy, etc.)
   - Add the MX records provided:

   ```
   Type: MX
   Name: @
   Value: mx1.improvmx.com
   Priority: 10

   Type: MX
   Name: @
   Value: mx2.improvmx.com
   Priority: 20
   ```

4. **Create Email Alias**
   - In ImprovMX dashboard, click **Create Alias**
   - **Alias:** `support@isbnscout.com`
   - **Forward to:** Your personal email
   - Click **Create**

5. **Wait for DNS Propagation**
   - Usually takes 5-30 minutes
   - Check status in ImprovMX dashboard

6. **Test It**
   - Send email to `support@isbnscout.com`
   - Should arrive in your personal inbox

---

### Option 3: Resend Inbound (Advanced - Requires Coding)

**Best for:** If you need to process emails programmatically
**Cost:** FREE tier available
**Setup time:** 30+ minutes
**Requires:** Webhook endpoint development

#### Overview:

Resend launched inbound email support in November 2025. Instead of simple forwarding, emails are sent to a webhook endpoint where you can process them programmatically.

#### Use Cases:
- Automatically create support tickets
- Parse and store customer inquiries in a database
- Auto-respond to specific keywords
- Process attachments automatically

#### Setup Steps:

1. **Create Webhook Endpoint**
   - Create a new API route in your app (e.g., `/api/webhooks/inbound-email`)
   - This endpoint will receive POST requests from Resend

2. **Configure in Resend Dashboard**
   - Go to [Resend Dashboard](https://resend.com/inbound)
   - Add your domain: `isbnscout.com`
   - Set webhook URL: `https://isbnscout.com/api/webhooks/inbound-email`

3. **Add DNS Records**
   - Resend will provide MX records to add to your DNS
   - Add them to your domain registrar

4. **Process Incoming Emails**
   ```typescript
   // Example webhook handler
   app.post('/api/webhooks/inbound-email', async (req, res) => {
     const { from, to, subject, text, html, attachments } = req.body;

     // Forward to your email
     await emailService.sendEmail({
       to: 'your-email@gmail.com',
       subject: `[Support] ${subject}`,
       html: `From: ${from}<br><br>${html}`
     });

     res.status(200).json({ received: true });
   });
   ```

5. **Handle Attachments**
   - Use Resend Attachments API to download files
   - Store in your database or cloud storage

**Note:** This option is overkill if you just need simple forwarding.

---

## Recommendation

**Use Cloudflare Email Routing** - it's the simplest, completely free, and takes 5 minutes to set up.

Once configured, emails to `support@isbnscout.com` will automatically forward to your personal email, and you can reply directly from your personal email client.

---

## Current Configuration

Your app currently uses these email addresses:

**File:** `server/email-service.ts:80-82`
```typescript
from: process.env.EMAIL_FROM || 'ISBN Scout <onboarding@resend.dev>',
replyTo: process.env.EMAIL_REPLY_TO || 'support@isbnscout.com',
```

**Environment Variables:** `.env`
```bash
EMAIL_FROM=ISBN Scout <noreply@isbnscout.com>
EMAIL_REPLY_TO=support@isbnscout.com
```

**This means:**
- ✅ You can **send** emails FROM `noreply@isbnscout.com` (via Resend)
- ❌ You **cannot receive** emails TO `support@isbnscout.com` (not configured yet)

---

## After Setup

Once you configure email receiving/forwarding:

1. ✅ Customers can reply to your automated emails
2. ✅ Emails will arrive in your personal inbox
3. ✅ You can reply from your personal email (will show as your personal address)
4. ✅ No more bounced emails

**Optional:** If you want replies to also come FROM `support@isbnscout.com`, you'll need to configure your email client (Gmail, Outlook, etc.) to send via SMTP using Resend's API. But that's not necessary - most businesses reply from personal/team emails without issue.

---

## Testing

After setup, test by sending an email to:
- `support@isbnscout.com`

You should receive it in your personal inbox within 1-2 minutes.

---

## Sources

- [Cloudflare Email Routing Overview](https://developers.cloudflare.com/email-routing/)
- [Enable Email Routing Guide](https://developers.cloudflare.com/email-routing/get-started/enable-email-routing/)
- [Resend Inbound Emails](https://resend.com/blog/inbound-emails)
- [Resend Receiving Documentation](https://resend.com/docs/dashboard/receiving/introduction)

---

## Need Help?

If you run into issues:
1. Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
2. Verify MX records: [mxtoolbox.com](https://mxtoolbox.com)
3. Contact Cloudflare support (they're very responsive)
