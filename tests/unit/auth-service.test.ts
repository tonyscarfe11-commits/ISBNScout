import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../server/auth-service';

describe('Auth Service', () => {
  describe('signup', () => {
    it('should create a new user with hashed password', async () => {
      const username = 'testuser';
      const email = 'test@example.com';
      const password = 'SecurePass123!';

      const user = await authService.signup(username, email, password);

      expect(user).toBeDefined();
      expect(user.username).toBe(username);
      expect(user.email).toBe(email);
      expect(user.password).not.toBe(password); // Password should be hashed
      expect(user.subscriptionTier).toBe('trial');
    });

    it('should reject duplicate email', async () => {
      const email = 'duplicate@example.com';
      await authService.signup('user1', email, 'password123');

      await expect(
        authService.signup('user2', email, 'password456')
      ).rejects.toThrow();
    });

    it('should reject weak passwords', async () => {
      await expect(
        authService.signup('testuser', 'test@example.com', '123')
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create test user
      await authService.signup('logintest', 'login@example.com', 'TestPass123!');
    });

    it('should authenticate valid credentials', async () => {
      const user = await authService.login('login@example.com', 'TestPass123!');

      expect(user).toBeDefined();
      expect(user.email).toBe('login@example.com');
    });

    it('should reject invalid password', async () => {
      await expect(
        authService.login('login@example.com', 'WrongPassword')
      ).rejects.toThrow();
    });

    it('should reject non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow();
    });
  });
});
