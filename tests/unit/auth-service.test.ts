import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../server/auth-service';
import { generateTestEmail, generateTestUsername } from '../helpers/db-cleanup';

describe('Auth Service', () => {
  describe('signup', () => {
    it('should create a new user with hashed password', async () => {
      const username = generateTestUsername();
      const email = generateTestEmail();
      const password = 'SecurePass123!';

      const user = await authService.signup(username, email, password);

      expect(user).toBeDefined();
      expect(user.username).toBe(username);
      expect(user.email).toBe(email);
      expect(user.password).not.toBe(password); // Password should be hashed
      expect(user.subscriptionTier).toBe('trial');
    });

    it('should reject duplicate email', async () => {
      const email = generateTestEmail();
      await authService.signup(generateTestUsername(), email, 'SecurePass123!');

      await expect(
        authService.signup(generateTestUsername(), email, 'SecurePass123!')
      ).rejects.toThrow();
    });

    it('should reject weak passwords', async () => {
      await expect(
        authService.signup(generateTestUsername(), generateTestEmail(), '123')
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    let testEmail: string;
    const testPassword = 'TestPass123!';

    beforeEach(async () => {
      // Create unique test user for each test
      testEmail = generateTestEmail();
      await authService.signup(generateTestUsername(), testEmail, testPassword);
    });

    it('should authenticate valid credentials', async () => {
      const user = await authService.login(testEmail, testPassword);

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
    });

    it('should reject invalid password', async () => {
      await expect(
        authService.login(testEmail, 'WrongPassword')
      ).rejects.toThrow();
    });

    it('should reject non-existent email', async () => {
      await expect(
        authService.login(generateTestEmail(), 'password')
      ).rejects.toThrow();
    });
  });
});
