import { createContext, useContext, useEffect, ReactNode } from 'react';
import posthog from 'posthog-js';

// PostHog Context
const PostHogContext = createContext<typeof posthog | null>(null);

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    // Initialize PostHog
    const apiKey = import.meta.env.VITE_POSTHOG_KEY;
    const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: true, // Automatically capture clicks, form submissions, etc.
        capture_pageview: true, // Automatically capture page views
        capture_pageleave: true, // Track when users leave pages
        persistence: 'localStorage',
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            console.log('[Analytics] PostHog initialized');
          }
        },
      });
    } else {
      console.warn('[Analytics] PostHog API key not found - analytics disabled');
    }

    // Cleanup on unmount
    return () => {
      posthog.reset();
    };
  }, []);

  return (
    <PostHogContext.Provider value={posthog}>
      {children}
    </PostHogContext.Provider>
  );
}

// Hook to use PostHog in components
export function useAnalytics() {
  const posthog = useContext(PostHogContext);
  
  return {
    // Identify user (call this on login)
    identify: (userId: string, properties?: Record<string, any>) => {
      posthog?.identify(userId, properties);
    },

    // Track custom events
    track: (eventName: string, properties?: Record<string, any>) => {
      posthog?.capture(eventName, properties);
    },

    // Track page views (if needed manually)
    pageview: (pageName?: string) => {
      posthog?.capture('$pageview', pageName ? { page: pageName } : undefined);
    },

    // Reset user (call on logout)
    reset: () => {
      posthog?.reset();
    },

    // Set user properties
    setUserProperties: (properties: Record<string, any>) => {
      posthog?.setPersonProperties(properties);
    },

    // Get the raw PostHog instance if needed
    posthog,
  };
}

// Utility function for server-side tracking
export async function trackServerEvent(
  eventName: string,
  distinctId: string,
  properties?: Record<string, any>
) {
  // This would be called from the server/backend
  // Requires POSTHOG_KEY in server environment
  if (typeof window !== 'undefined') {
    console.warn('[Analytics] trackServerEvent should only be called server-side');
    return;
  }

  try {
    const apiKey = process.env.POSTHOG_KEY;
    const apiHost = process.env.POSTHOG_HOST || 'https://app.posthog.com';

    if (!apiKey) return;

    await fetch(`${apiHost}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        event: eventName,
        distinct_id: distinctId,
        properties,
      }),
    });
  } catch (error) {
    console.error('[Analytics] Failed to track server event:', error);
  }
}
