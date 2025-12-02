# Analytics Setup & Tracking

This document explains how analytics are implemented in ISBNScout using PostHog.

## Setup

### 1. Get PostHog API Keys

1. Sign up at https://app.posthog.com/
2. Create a new project or use existing one
3. Go to Project Settings → API Keys
4. Copy your Project API Key

### 2. Add Environment Variables

Add to your `.env` file:

```bash
# PostHog Analytics
VITE_POSTHOG_KEY=phc_your_project_api_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 3. That's it!

Analytics will automatically start tracking when users visit your site.

## What's Being Tracked

### Automatic Tracking
PostHog automatically captures:
- **Page views** - Every page navigation
- **Button clicks** - All button interactions
- **Form submissions** - Form completions
- **Session recordings** (if enabled in PostHog settings)

### Custom Events We Track

#### User Authentication
- `User Signed Up` - When a new user creates an account
  - Properties: `signupMethod`, `referralSource`
- `Trial Started` - When a user starts their 14-day trial
  - Properties: `trialLength`, `trialEndsAt`
- `User Logged In` - When a user logs in
  - Properties: `loginMethod`

#### Subscription Events
- `Checkout Started` - When user clicks subscribe button
  - Properties: `planId`, `planType`
- `Redirected to Stripe` - When user is sent to Stripe checkout
  - Properties: `planId`
- `Subscription Created` - When user completes payment
  - Properties: `sessionId`, `source`
- `Checkout Cancelled` - When user cancels Stripe checkout
  - Properties: `source`
- `Checkout Failed` - When checkout process fails
  - Properties: `planId`, `error`

#### User Identification
Every logged-in user is identified with:
- `user_id` - Unique user ID
- `username` - Username
- `email` - Email address
- `subscriptionTier` - Current subscription level
- `subscriptionStatus` - Account status
- `trialStartedAt` - When trial began
- `trialEndsAt` - When trial expires

## How to Add More Tracking

### In React Components

```typescript
import { useAnalytics } from "@/lib/analytics";

function MyComponent() {
  const { track } = useAnalytics();

  const handleAction = () => {
    // Track a custom event
    track('Feature Used', {
      featureName: 'ISBN Scanner',
      resultCount: 42,
    });
  };

  return <button onClick={handleAction}>Scan ISBN</button>;
}
```

### Key Events to Consider Tracking

**Feature Usage:**
- ISBN scans (barcode, photo, manual)
- Book lookups
- Listing creations (eBay, Amazon)
- Repricing actions
- Inventory management actions
- Report exports

**User Engagement:**
- Settings changes
- API credential updates
- Onboarding completed
- Help documentation viewed
- Support contacted

**Business Metrics:**
- Trial to paid conversion
- Feature adoption rates
- Churn indicators
- Revenue events

### User Properties

Update user properties as they change:

```typescript
const { setUserProperties } = useAnalytics();

setUserProperties({
  totalScans: 150,
  favoriteFeature: 'barcode-scanner',
  lastActiveDate: new Date().toISOString(),
});
```

## Viewing Analytics

1. Go to https://app.posthog.com/
2. Select your project
3. View dashboards:
   - **Insights** - Custom analytics queries
   - **Recordings** - Watch user sessions
   - **Feature Flags** - A/B testing (if needed)
   - **Persons** - Individual user profiles

### Useful Queries to Create

1. **Conversion Funnel:**
   - User Signed Up → Trial Started → Checkout Started → Subscription Created

2. **Feature Adoption:**
   - Track which features are used most
   - Identify unused features

3. **Retention:**
   - Daily/Weekly/Monthly active users
   - User cohort analysis

4. **Trial Analysis:**
   - Trial start to conversion rate
   - Average time to conversion
   - Trial expiration notifications effectiveness

## Privacy & GDPR Compliance

PostHog is GDPR compliant. Key features:
- Cookie consent integration available
- User data can be anonymized
- Right to deletion supported
- Can self-host if needed for full control

## Cost

PostHog Free Tier:
- 1M events/month
- 5,000 session recordings/month
- Unlimited team members
- All core features

This should be plenty for a growing SaaS. Upgrade if needed as you scale.
