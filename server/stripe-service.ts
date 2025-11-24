/**
 * Stripe Service
 *
 * Handles subscription checkout and webhook events
 * API Key required from: https://stripe.com/
 *
 * Free to integrate, charges 2.9% + £0.30 per transaction
 */

import Stripe from 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    interval: 'month',
    features: ['10 scans/month', 'Basic price comparison'],
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    features: ['100 scans/month', 'Full price comparison', 'Manual listing'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 24.99,
    interval: 'month',
    features: ['Unlimited scans', 'AI features', 'Auto-listing', 'Priority support'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    interval: 'month',
    features: ['Everything in Pro', 'White label', 'API access', 'Dedicated support'],
  },
};

export class StripeService {
  private stripe: Stripe | null = null;
  private webhookSecret: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-10-29.clover',
      });
    }
  }

  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession(
    planId: string,
    customerId: string | null,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string; sessionId: string }> {
    if (!this.stripe) {
      throw new Error('Stripe not configured. Set STRIPE_SECRET_KEY environment variable.');
    }

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    if (plan.price === 0) {
      throw new Error('Cannot create checkout session for free plan');
    }

    try {
      // Create or retrieve Stripe customer
      let stripeCustomerId = customerId;
      if (!stripeCustomerId) {
        const customer = await this.stripe.customers.create({
          metadata: {
            planId,
          },
        });
        stripeCustomerId = customer.id;
      }

      // Create checkout session with UK-specific configuration
      const sessionConfig: any = {
        mode: 'subscription',
        payment_method_types: ['card', 'paypal'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: plan.name,
                description: plan.features.join(', '),
              },
              recurring: {
                interval: plan.interval,
              },
              unit_amount: Math.round(plan.price * 100), // Convert to pence
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Enable popular UK payment methods
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic', // Required for UK Strong Customer Authentication (SCA)
          },
        },
        // Automatic tax calculation for UK VAT (20%)
        // Note: Requires configuration in Stripe Dashboard
        automatic_tax: { enabled: true },
        // Collect customer's billing address for VAT purposes
        billing_address_collection: 'required',
        // Save customer address for future tax calculations
        customer_update: {
          address: 'auto',
        },
        metadata: {
          planId,
        },
      };

      // Add customer or enable customer creation (mutually exclusive)
      if (stripeCustomerId) {
        sessionConfig.customer = stripeCustomerId;
      } else {
        sessionConfig.customer_creation = 'always';
      }

      const session = await this.stripe.checkout.sessions.create(sessionConfig);

      if (!session.url) {
        throw new Error('Failed to create checkout session URL');
      }

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error: any) {
      console.error('Stripe checkout session creation failed:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
  }

  /**
   * Create a Stripe Customer Portal session for managing subscriptions
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (error: any) {
      console.error('Stripe portal session creation failed:', error);
      throw new Error(error.message || 'Failed to create portal session');
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error: any) {
      console.error('Stripe subscription cancellation failed:', error);
      throw new Error(error.message || 'Failed to cancel subscription');
    }
  }

  /**
   * Verify webhook signature and parse event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    if (!this.webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error);
      throw new Error(error.message || 'Invalid webhook signature');
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<{
    type: string;
    data: any;
  }> {
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: 'subscription_created',
          data: {
            customerId: session.customer as string,
            subscriptionId: session.subscription as string,
            planId: session.metadata?.planId,
          },
        };
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        return {
          type: 'subscription_updated',
          data: {
            customerId: subscription.customer as string,
            subscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        };
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        return {
          type: 'subscription_cancelled',
          data: {
            customerId: subscription.customer as string,
            subscriptionId: subscription.id,
          },
        };
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        return {
          type: 'payment_succeeded',
          data: {
            customerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            amount: invoice.amount_paid / 100, // Convert from pence to pounds
            currency: invoice.currency,
          },
        };
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        return {
          type: 'payment_failed',
          data: {
            customerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            attemptCount: invoice.attempt_count,
          },
        };
      }

      default:
        return {
          type: 'unhandled',
          data: { eventType: event.type },
        };
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error: any) {
      console.error('Failed to retrieve subscription:', error);
      return null;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.stripe !== null;
  }

  /**
   * Check if webhooks are configured
   */
  areWebhooksConfigured(): boolean {
    return this.webhookSecret.length > 0;
  }
}

// Export singleton instance
export const stripeService = new StripeService();
