import { useState, useEffect } from 'react';

export interface TrialStatus {
  tier: string;
  status: string;
  daysRemaining: number;
  trialEndsAt: string | null;
  isTrialing: boolean;
  isExpired: boolean;
  isInGracePeriod: boolean;
  graceDaysRemaining: number;
  hasAccess: boolean; // Has access to paid features
}

const GRACE_PERIOD_DAYS = 3;

export function useTrialStatus() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const response = await fetch('/api/user/trial-status');
        if (response.ok) {
          const data = await response.json();

          const isTrialing = data.status === 'trialing';
          const isExpired = isTrialing && data.daysRemaining <= 0;
          const isPaid = ['basic', 'pro', 'enterprise'].includes(data.tier) && data.status === 'active';

          // Calculate grace period
          const graceDaysRemaining = isExpired
            ? Math.max(0, GRACE_PERIOD_DAYS + data.daysRemaining) // daysRemaining is negative when expired
            : 0;
          const isInGracePeriod = isExpired && graceDaysRemaining > 0;
          const isFullyExpired = isExpired && graceDaysRemaining <= 0;

          setTrialStatus({
            tier: data.tier,
            status: data.status,
            daysRemaining: data.daysRemaining,
            trialEndsAt: data.trialEndsAt,
            isTrialing,
            isExpired,
            isInGracePeriod,
            graceDaysRemaining,
            hasAccess: (isTrialing && !isFullyExpired) || isPaid,
          });
        }
      } catch (error) {
        console.error('Failed to fetch trial status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrialStatus();

    // Refresh every minute to check for expiration
    const interval = setInterval(fetchTrialStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return { trialStatus, isLoading };
}
