import { Router } from "express";
import express from "express";
import Stripe from "stripe";
import { requireAuth, getUserId } from "../middleware/auth";
import { stripeService, SUBSCRIPTION_PLANS } from "../stripe-service";
import { authService } from "../auth-service";
import { storage } from "../storage";
import { emailService } from "../email-service";

const router = Router();

// POST /api/subscription/checkout
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    // Check if Stripe is configured
    if (!stripeService.isConfigured()) {
      return res.status(503).json({
        message: "Payment processing not configured. Set STRIPE_SECRET_KEY environment variable.",
        success: false,
      });
    }

    // Get user's Stripe customer ID from database
    const user = await authService.getUserById(userId);
    const stripeCustomerId = user?.stripeCustomerId || null;

    // Create Stripe checkout session
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const { url, sessionId } = await stripeService.createCheckoutSession(
      planId,
      stripeCustomerId,
      `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/subscription?cancelled=true`
    );

    res.json({
      success: true,
      checkoutUrl: url,
      sessionId,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    res.status(500).json({
      message: error.message || "Failed to create checkout session",
      success: false,
    });
  }
});

// POST /api/subscription/verify
router.post("/verify", async (req, res) => {
  try {
    let userId = req.session.userId;

    // If no session, try to find the default user
    if (!userId) {
      const defaultUser = await storage.getUserByUsername("default");
      if (defaultUser) {
        userId = defaultUser.id;
        req.session.userId = userId;
      }
    }

    const { sessionId } = req.body;

    console.log('[Stripe Verify] Session ID:', sessionId);
    console.log('[Stripe Verify] User ID:', userId);

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    if (!stripeService.isConfigured()) {
      return res.status(503).json({
        message: "Payment processing not configured.",
        success: false,
      });
    }

    // Get the Stripe checkout session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('[Stripe Verify] Payment status:', session.payment_status);
    console.log('[Stripe Verify] Metadata:', session.metadata);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        message: "Payment not completed",
        success: false,
      });
    }

    // Get the plan ID from session metadata
    const planId = session.metadata?.planId || 'pro_monthly';
    console.log('[Stripe Verify] Plan ID:', planId);

    // Update user's subscription in database
    if (userId) {
      const user = await authService.getUserById(userId);
      console.log('[Stripe Verify] Current user:', user?.subscriptionTier);

      if (user) {
        const updatedUser = await authService.updateUser(userId, {
          subscriptionTier: planId,
          subscriptionStatus: 'active',
          stripeCustomerId: session.customer as string,
        });
        console.log('[Stripe Verify] Updated user:', updatedUser?.subscriptionTier);
      }
    }

    res.json({
      success: true,
      planId,
      status: 'active',
    });
  } catch (error: any) {
    console.error("Subscription verification error:", error);
    res.status(500).json({
      message: error.message || "Failed to verify subscription",
      success: false,
    });
  }
});

// POST /api/subscription/portal
router.post("/portal", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!stripeService.isConfigured()) {
      return res.status(503).json({
        message: "Payment processing not configured.",
        success: false,
      });
    }

    // Get user's Stripe customer ID
    const user = await authService.getUserById(userId);

    if (!user?.stripeCustomerId) {
      return res.status(400).json({
        message: "No active subscription found",
        success: false,
      });
    }

    // Create portal session
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const { url } = await stripeService.createPortalSession(
      user.stripeCustomerId,
      `${baseUrl}/subscription`
    );

    res.json({
      success: true,
      portalUrl: url,
    });
  } catch (error: any) {
    console.error("Portal creation error:", error);
    res.status(500).json({
      message: error.message || "Failed to create portal session",
      success: false,
    });
  }
});

// POST /api/webhooks/stripe
router.post("/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ message: "Missing stripe signature" });
    }

    if (!stripeService.isConfigured()) {
      return res.status(503).json({ message: "Stripe not configured" });
    }

    // Verify and parse webhook event
    const event = stripeService.constructWebhookEvent(
      req.body,
      signature as string
    );

    // Handle the webhook event
    const result = await stripeService.handleWebhookEvent(event);

    console.log(`[Stripe Webhook] Event: ${result.type}`, result.data);

    // Update user subscription based on event type
    switch (result.type) {
      case 'subscription_created': {
        const { customerId, subscriptionId, planId } = result.data;

        // Find user by Stripe customer ID
        const user = await storage.getUserByStripeCustomerId(customerId);

        if (user) {
          await storage.updateUser(user.id, {
            subscriptionTier: planId || 'pro_monthly',
            subscriptionStatus: 'active',
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
          });
          console.log(`[Stripe Webhook] Updated user ${user.id} subscription to ${planId}`);

          // Send subscription confirmation email
          const plan = SUBSCRIPTION_PLANS[planId || 'pro_monthly'];
          if (plan) {
            const subscription = await stripeService.getSubscription(subscriptionId) as any;
            const nextBillingDate = subscription?.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days

            emailService.sendSubscriptionConfirmation({
              username: user.username,
              email: user.email,
              planName: plan.name,
              amount: plan.price,
              interval: plan.interval,
              nextBillingDate,
            }).catch(error => {
              console.error('[Email] Failed to send subscription confirmation:', error);
            });
          }

          // Track affiliate commission if user was referred
          if (user.referredByAffiliateId) {
            try {
              const { AffiliateService } = await import("../affiliate-service");
              const subscriptionAmount = planId?.includes('elite') ? 19.99 : 14.99;

              await AffiliateService.createCommission({
                affiliateId: user.referredByAffiliateId,
                userId: user.id,
                subscriptionTier: planId || 'pro_monthly',
                subscriptionAmount,
              });
              console.log(`[Affiliate Commission] Created commission for affiliate ${user.referredByAffiliateId} from user ${user.id}`);
            } catch (error) {
              console.error('[Affiliate Commission] Failed to create commission:', error);
            }
          }
        }
        break;
      }

      case 'subscription_updated': {
        const { customerId, status, currentPeriodEnd } = result.data as any;

        const user = await storage.getUserByStripeCustomerId(customerId);

        if (user) {
          await storage.updateUser(user.id, {
            subscriptionStatus: status,
            subscriptionExpiresAt: currentPeriodEnd as Date,
          });
          console.log(`[Stripe Webhook] Updated user ${user.id} subscription status to ${status}`);
        }
        break;
      }

      case 'subscription_cancelled': {
        const { customerId } = result.data;

        const user = await storage.getUserByStripeCustomerId(customerId);

        if (user) {
          await storage.updateUser(user.id, {
            subscriptionStatus: 'cancelled',
            subscriptionTier: 'trial',
          });
          console.log(`[Stripe Webhook] Cancelled user ${user.id} subscription`);
        }
        break;
      }

      case 'payment_failed': {
        const { customerId } = result.data;

        const user = await storage.getUserByStripeCustomerId(customerId);

        if (user) {
          await storage.updateUser(user.id, {
            subscriptionStatus: 'past_due',
          });
          console.log(`[Stripe Webhook] Marked user ${user.id} as past_due`);
        }
        break;
      }

      case 'payment_succeeded': {
        const { customerId, amount, subscriptionId } = result.data;

        const user = await storage.getUserByStripeCustomerId(customerId);

        if (user && subscriptionId) {
          // Get subscription to find the plan
          const subscription = await stripeService.getSubscription(subscriptionId);
          const planId = subscription?.metadata?.planId || user.subscriptionTier || 'pro_monthly';
          const plan = SUBSCRIPTION_PLANS[planId];

          if (plan) {
            // Send payment receipt email
            emailService.sendPaymentReceipt({
              username: user.username,
              email: user.email,
              amount: amount,
              planName: plan.name,
              paidAt: new Date(),
            }).catch(error => {
              console.error('[Email] Failed to send payment receipt:', error);
            });
          }

          console.log(`[Stripe Webhook] Payment of £${amount} received from user ${user.id}`);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(400).json({ message: error.message || "Webhook processing failed" });
  }
});

export default router;
