/**
 * Email Service
 *
 * Handles sending transactional emails using Resend
 * Free tier: 100 emails/day, 3,000/month
 * Paid: $20/month for 50,000 emails
 *
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Add your domain or use onboarding@resend.dev for testing
 * 3. Get API key from dashboard
 * 4. Add RESEND_API_KEY to .env
 */

import { Resend } from 'resend';

export interface EmailConfig {
  from: string;
  replyTo?: string;
}

export interface WelcomeEmailData {
  username: string;
  email: string;
  trialEndsAt: Date;
}

export interface SubscriptionConfirmationData {
  username: string;
  email: string;
  planName: string;
  amount: number;
  interval: 'month' | 'year';
  nextBillingDate: Date;
}

export interface TrialExpiringData {
  username: string;
  email: string;
  daysRemaining: number;
  trialEndsAt: Date;
}

export interface TrialExpiredData {
  username: string;
  email: string;
}

export interface AffiliateApprovedData {
  name: string;
  email: string;
  referralCode: string;
}

export interface PaymentReceiptData {
  username: string;
  email: string;
  amount: number;
  planName: string;
  invoiceUrl?: string;
  paidAt: Date;
}

export interface EmailVerificationData {
  username: string;
  email: string;
  verificationToken: string;
}

export interface PasswordResetData {
  username: string;
  email: string;
  resetToken: string;
}

export class EmailService {
  private resend: Resend | null = null;
  private config: EmailConfig;
  private enabled: boolean = false;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    // Default sender - change this to your verified domain in production
    this.config = {
      from: process.env.EMAIL_FROM || 'ISBN Scout <onboarding@resend.dev>',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@isbnscout.com',
    };

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.enabled = true;
      console.log('[Email] Service initialized with Resend');
    } else {
      console.warn('[Email] RESEND_API_KEY not found - email service disabled');
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log('[Email] Would send welcome email to:', data.email);
      return false;
    }

    try {
      const trialDays = Math.ceil((data.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      await this.resend.emails.send({
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: data.email,
        subject: 'Welcome to ISBN Scout - Your Book Scanning Journey Starts Now!',
        html: this.getWelcomeEmailTemplate(data.username, trialDays),
      });

      console.log('[Email] Welcome email sent to:', data.email);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(data: SubscriptionConfirmationData): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log('[Email] Would send subscription confirmation to:', data.email);
      return false;
    }

    try {
      await this.resend.emails.send({
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: data.email,
        subject: `Your ${data.planName} subscription is now active!`,
        html: this.getSubscriptionConfirmationTemplate(data),
      });

      console.log('[Email] Subscription confirmation sent to:', data.email);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send subscription confirmation:', error);
      return false;
    }
  }

  /**
   * Send trial expiring reminder
   */
  async sendTrialExpiringEmail(data: TrialExpiringData): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log('[Email] Would send trial expiring email to:', data.email);
      return false;
    }

    try {
      await this.resend.emails.send({
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: data.email,
        subject: `Your ISBN Scout trial expires in ${data.daysRemaining} days`,
        html: this.getTrialExpiringTemplate(data),
      });

      console.log('[Email] Trial expiring email sent to:', data.email);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send trial expiring email:', error);
      return false;
    }
  }

  /**
   * Send trial expired notification
   */
  async sendTrialExpiredEmail(data: TrialExpiredData): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log('[Email] Would send trial expired email to:', data.email);
      return false;
    }

    try {
      await this.resend.emails.send({
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: data.email,
        subject: 'Your ISBN Scout trial has ended',
        html: this.getTrialExpiredTemplate(data),
      });

      console.log('[Email] Trial expired email sent to:', data.email);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send trial expired email:', error);
      return false;
    }
  }

  /**
   * Send affiliate approval notification
   */
  async sendAffiliateApproved(data: AffiliateApprovedData): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log('[Email] Would send affiliate approval to:', data.email);
      return false;
    }

    try {
      await this.resend.emails.send({
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: data.email,
        subject: 'Your ISBN Scout affiliate application has been approved!',
        html: this.getAffiliateApprovedTemplate(data),
      });

      console.log('[Email] Affiliate approval sent to:', data.email);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send affiliate approval:', error);
      return false;
    }
  }

  /**
   * Send payment receipt
   */
  async sendPaymentReceipt(data: PaymentReceiptData): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log('[Email] Would send payment receipt to:', data.email);
      return false;
    }

    try {
      await this.resend.emails.send({
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: data.email,
        subject: `Payment receipt - £${data.amount.toFixed(2)} for ${data.planName}`,
        html: this.getPaymentReceiptTemplate(data),
      });

      console.log('[Email] Payment receipt sent to:', data.email);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send payment receipt:', error);
      return false;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(data: EmailVerificationData): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log('[Email] Would send email verification to:', data.email);
      return false;
    }

    try {
      const verifyUrl = `${process.env.APP_URL}/verify-email?token=${data.verificationToken}`;

      await this.resend.emails.send({
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: data.email,
        subject: 'Verify your email address - ISBN Scout',
        html: this.getEmailVerificationTemplate(data.username, verifyUrl),
      });

      console.log('[Email] Email verification sent to:', data.email);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send email verification:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log('[Email] Would send password reset email to:', data.email);
      return false;
    }

    try {
      const resetUrl = `${process.env.APP_URL}/reset-password?token=${data.resetToken}`;

      await this.resend.emails.send({
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: data.email,
        subject: 'Reset your password - ISBN Scout',
        html: this.getPasswordResetTemplate(data.username, resetUrl),
      });

      console.log('[Email] Password reset email sent to:', data.email);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send password reset email:', error);
      return false;
    }
  }

  // Email Templates

  private getWelcomeEmailTemplate(username: string, trialDays: number): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .features { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .features ul { margin: 10px 0; padding-left: 20px; }
    .features li { margin: 8px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ISBN Scout!</h1>
    </div>
    <div class="content">
      <h2>Hi ${username},</h2>
      <p>Thanks for joining ISBN Scout - the ultimate tool for book resellers!</p>

      <p>Your <strong>${trialDays}-day free trial</strong> has started. Here's what you can do:</p>

      <div class="features">
        <ul>
          <li><strong>Unlimited scanning</strong> - Scan as many books as you want</li>
          <li><strong>Instant profit calculations</strong> - See Amazon & eBay UK prices</li>
          <li><strong>Multiple scan methods</strong> - Barcode, cover photo, or AI spine recognition</li>
          <li><strong>Royal Mail postage estimates</strong> - Know your shipping costs upfront</li>
          <li><strong>Offline mode</strong> - Works even without internet</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="${process.env.APP_URL || 'https://isbnscout.com'}" class="button">Start Scanning Books</a>
      </p>

      <p>Need help getting started? Check out our <a href="${process.env.APP_URL || 'https://isbnscout.com'}/blog">blog</a> for tips and strategies, or reply to this email with any questions.</p>

      <p>Happy scanning!<br>
      The ISBN Scout Team</p>
    </div>
    <div class="footer">
      <p>ISBN Scout - Smart Book Scanning for Resellers</p>
      <p>${process.env.APP_URL || 'https://isbnscout.com'}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getSubscriptionConfirmationTemplate(data: SubscriptionConfirmationData): string {
    const nextBilling = data.nextBillingDate.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .subscription-details { background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Subscription Confirmed!</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.username},</h2>
      <p>Your subscription to <strong>${data.planName}</strong> is now active!</p>

      <div class="subscription-details">
        <p><strong>Plan:</strong> ${data.planName}</p>
        <p><strong>Amount:</strong> £${data.amount.toFixed(2)}/${data.interval}</p>
        <p><strong>Next billing date:</strong> ${nextBilling}</p>
      </div>

      <p>You now have access to all premium features including unlimited scanning, offline mode, and advanced profit calculations.</p>

      <p style="text-align: center;">
        <a href="${process.env.APP_URL || 'https://isbnscout.com'}" class="button">Go to Dashboard</a>
      </p>

      <p>If you have any questions about your subscription, feel free to reply to this email.</p>

      <p>Happy scanning!<br>
      The ISBN Scout Team</p>
    </div>
    <div class="footer">
      <p>ISBN Scout - Smart Book Scanning for Resellers</p>
      <p>${process.env.APP_URL || 'https://isbnscout.com'}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getTrialExpiringTemplate(data: TrialExpiringData): string {
    const expiryDate = data.trialEndsAt.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .alert { background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Trial is Ending Soon</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.username},</h2>
      <p>Your ISBN Scout trial expires in <strong>${data.daysRemaining} days</strong> (${expiryDate}).</p>

      <div class="alert">
        <p><strong>Don't lose access to your scanning superpowers!</strong></p>
        <p>Subscribe now to continue enjoying unlimited scanning, offline mode, and all premium features.</p>
      </div>

      <p style="text-align: center;">
        <a href="${process.env.APP_URL || 'https://isbnscout.com'}/subscription" class="button">View Plans & Subscribe</a>
      </p>

      <p>We offer flexible plans starting from just £14.99/month, with annual options that save you money.</p>

      <p>Questions? Just reply to this email - we're here to help!</p>

      <p>Happy scanning!<br>
      The ISBN Scout Team</p>
    </div>
    <div class="footer">
      <p>ISBN Scout - Smart Book Scanning for Resellers</p>
      <p>${process.env.APP_URL || 'https://isbnscout.com'}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getTrialExpiredTemplate(data: TrialExpiredData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Trial Has Ended</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.username},</h2>
      <p>Your ISBN Scout trial has come to an end. We hope you enjoyed testing all our features!</p>

      <p>To continue scanning books and accessing all premium features, please subscribe to one of our plans.</p>

      <p style="text-align: center;">
        <a href="${process.env.APP_URL || 'https://isbnscout.com'}/subscription" class="button">Choose Your Plan</a>
      </p>

      <p><strong>What you'll keep with a subscription:</strong></p>
      <ul>
        <li>Unlimited book scanning</li>
        <li>Offline mode</li>
        <li>Amazon & eBay UK profit calculations</li>
        <li>Royal Mail postage estimates</li>
        <li>All your scan history</li>
      </ul>

      <p>Have questions? Reply to this email - we'd love to hear from you!</p>

      <p>Best regards,<br>
      The ISBN Scout Team</p>
    </div>
    <div class="footer">
      <p>ISBN Scout - Smart Book Scanning for Resellers</p>
      <p>${process.env.APP_URL || 'https://isbnscout.com'}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getAffiliateApprovedTemplate(data: AffiliateApprovedData): string {
    const dashboardUrl = `${process.env.APP_URL || 'https://isbnscout.com'}/affiliate/dashboard`;
    const referralUrl = `${process.env.APP_URL || 'https://isbnscout.com'}?ref=${data.referralCode}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .code-box { background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 2px dashed #10b981; margin: 20px 0; text-align: center; }
    .code { font-size: 24px; font-weight: bold; color: #059669; font-family: monospace; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Approved!</h1>
    </div>
    <div class="content">
      <h2>Congratulations ${data.name}!</h2>
      <p>Your ISBN Scout affiliate application has been approved. You can now start earning 25% commission on all referrals!</p>

      <div class="code-box">
        <p><strong>Your Referral Code:</strong></p>
        <div class="code">${data.referralCode}</div>
        <p style="margin-top: 10px; font-size: 14px;">Share this link: <a href="${referralUrl}">${referralUrl}</a></p>
      </div>

      <p><strong>How it works:</strong></p>
      <ul>
        <li>Share your unique referral link with your audience</li>
        <li>Earn 25% commission on every subscription</li>
        <li>Track your earnings in real-time</li>
        <li>Get paid monthly via PayPal</li>
      </ul>

      <p style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Go to Affiliate Dashboard</a>
      </p>

      <p>Need marketing materials or have questions? Reply to this email and we'll help you get started!</p>

      <p>Let's make some money together!<br>
      The ISBN Scout Team</p>
    </div>
    <div class="footer">
      <p>ISBN Scout - Smart Book Scanning for Resellers</p>
      <p>${process.env.APP_URL || 'https://isbnscout.com'}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getPaymentReceiptTemplate(data: PaymentReceiptData): string {
    const paidDate = data.paidAt.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .receipt { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .receipt-row:last-child { border-bottom: none; font-weight: bold; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Receipt</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.username},</h2>
      <p>Thank you for your payment. Here's your receipt:</p>

      <div class="receipt">
        <div class="receipt-row">
          <span>Plan:</span>
          <span>${data.planName}</span>
        </div>
        <div class="receipt-row">
          <span>Amount:</span>
          <span>£${data.amount.toFixed(2)}</span>
        </div>
        <div class="receipt-row">
          <span>Date:</span>
          <span>${paidDate}</span>
        </div>
        <div class="receipt-row">
          <span>Total:</span>
          <span>£${data.amount.toFixed(2)}</span>
        </div>
      </div>

      ${data.invoiceUrl ? `
      <p style="text-align: center;">
        <a href="${data.invoiceUrl}" class="button">Download Invoice</a>
      </p>
      ` : ''}

      <p>This payment confirms your continued access to all ISBN Scout premium features.</p>

      <p>Questions about your billing? Reply to this email anytime.</p>

      <p>Best regards,<br>
      The ISBN Scout Team</p>
    </div>
    <div class="footer">
      <p>ISBN Scout - Smart Book Scanning for Resellers</p>
      <p>${process.env.APP_URL || 'https://isbnscout.com'}</p>
      <p>This is an automated receipt. Please keep it for your records.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getEmailVerificationTemplate(username: string, verifyUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; font-size: 16px; }
    .alert-box { background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .code-box { background: #f3f4f6; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 14px; margin: 15px 0; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email Address</h1>
    </div>
    <div class="content">
      <h2>Hi ${username},</h2>
      <p>Thanks for signing up for ISBN Scout! To complete your registration and start scanning books, please verify your email address.</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" class="button">Verify Email Address</a>
      </p>

      <div class="alert-box">
        <p><strong>⏰ This link expires in 24 hours</strong></p>
        <p style="margin: 0;">For security reasons, this verification link will expire after 24 hours. If it expires, you can request a new one from the login page.</p>
      </div>

      <p><strong>Why verify your email?</strong></p>
      <ul>
        <li>Protect your account from unauthorized access</li>
        <li>Receive important notifications about your trial and subscription</li>
        <li>Get support and updates about new features</li>
        <li>Reset your password if needed</li>
      </ul>

      <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
      <div class="code-box">${verifyUrl}</div>

      <p><strong>Didn't sign up for ISBN Scout?</strong> You can safely ignore this email.</p>

      <p>Best regards,<br>
      The ISBN Scout Team</p>
    </div>
    <div class="footer">
      <p>ISBN Scout - Smart Book Scanning for Resellers</p>
      <p>${process.env.APP_URL || 'https://isbnscout.com'}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getPasswordResetTemplate(username: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; font-size: 16px; }
    .alert-box { background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .code-box { background: #f3f4f6; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 14px; margin: 15px 0; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <h2>Hi ${username},</h2>
      <p>We received a request to reset your password for your ISBN Scout account. If you didn't make this request, you can safely ignore this email.</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>

      <div class="alert-box">
        <p><strong>⏰ This link expires in 1 hour</strong></p>
        <p style="margin: 0;">For security reasons, this password reset link will expire after 1 hour. If it expires, you can request a new one from the login page.</p>
      </div>

      <p><strong>Security Tips:</strong></p>
      <ul>
        <li>Never share your password with anyone</li>
        <li>Use a unique password for ISBN Scout</li>
        <li>Make sure your password is at least 8 characters long</li>
      </ul>

      <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
      <div class="code-box">${resetUrl}</div>

      <p><strong>Didn't request a password reset?</strong> Your account is still secure. You can safely ignore this email.</p>

      <p>Best regards,<br>
      The ISBN Scout Team</p>
    </div>
    <div class="footer">
      <p>ISBN Scout - Smart Book Scanning for Resellers</p>
      <p>${process.env.APP_URL || 'https://isbnscout.com'}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

export const emailService = new EmailService();
