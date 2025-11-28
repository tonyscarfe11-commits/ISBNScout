-- Fix all users to trial with 14 days
UPDATE users
SET
  subscriptionTier = 'trial',
  subscriptionStatus = 'active',
  trialStartedAt = datetime('now'),
  trialEndsAt = datetime('now', '+14 days')
WHERE subscriptionTier IS NULL
   OR subscriptionTier = 'basic'
   OR subscriptionTier = 'free'
   OR subscriptionTier = 'pro'
   OR subscriptionTier = 'pro_monthly'
   OR subscriptionTier NOT IN ('pro_yearly', 'elite_monthly', 'elite_yearly');

-- Show all users
SELECT id, username, email, subscriptionTier, subscriptionStatus, trialEndsAt FROM users;
