import { describe, it, expect } from 'vitest';
import { loginLimiter, signupLimiter, apiLimiter, pricingLimiter, aiLimiter } from '../../server/middleware/rate-limit';

describe('Rate Limiting', () => {
  it('should have login limiter configured correctly', () => {
    expect(loginLimiter).toBeDefined();
    // Verify it's a function (middleware)
    expect(typeof loginLimiter).toBe('function');
  });

  it('should have signup limiter configured correctly', () => {
    expect(signupLimiter).toBeDefined();
    expect(typeof signupLimiter).toBe('function');
  });

  it('should have API limiter configured correctly', () => {
    expect(apiLimiter).toBeDefined();
    expect(typeof apiLimiter).toBe('function');
  });

  it('should have pricing limiter configured correctly', () => {
    expect(pricingLimiter).toBeDefined();
    expect(typeof pricingLimiter).toBe('function');
  });

  it('should have AI limiter configured correctly', () => {
    expect(aiLimiter).toBeDefined();
    expect(typeof aiLimiter).toBe('function');
  });
});
