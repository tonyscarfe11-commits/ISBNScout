import bcrypt from 'bcrypt';
import { storage } from './storage';
import { emailService } from './email-service';
import type { InsertUser, User } from '../shared/schema';

const SALT_ROUNDS = 10;

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async signup(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate email verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    // Set up 14-day trial period
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    // Create user with trial dates and verification token
    const user = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      emailVerified: 'false',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      subscriptionTier: 'trial',
      subscriptionStatus: 'active',
      trialStartedAt: now,
      trialEndsAt: trialEnds,
    } as any);

    console.log(`[Auth] Created user ${username} with trial ending ${trialEnds.toISOString()}`);

    // Send email verification asynchronously (don't wait for it)
    emailService.sendEmailVerification({
      username,
      email,
      verificationToken,
    }).catch(error => {
      console.error('[Auth] Failed to send verification email:', error);
    });

    // Send welcome email asynchronously (don't wait for it)
    emailService.sendWelcomeEmail({
      username,
      email,
      trialEndsAt: trialEnds,
    }).catch(error => {
      console.error('[Auth] Failed to send welcome email:', error);
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, password: string): Promise<Omit<User, 'password'>> {
    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Auto-migrate ALL users to trial if they don't have valid subscription
    const isPaidTier = user.subscriptionTier && ['pro_monthly', 'pro_yearly', 'elite_monthly', 'elite_yearly'].includes(user.subscriptionTier);

    // If NOT on a paid tier, ensure they have trial
    if (!isPaidTier) {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      await storage.updateUser(user.id, {
        subscriptionTier: 'trial',
        subscriptionStatus: 'active',
        trialStartedAt: now,
        trialEndsAt: trialEnds,
      });

      console.log(`[Auth] Set user ${user.id} to trial (was: ${user.subscriptionTier || 'none'}) - 14 days from now`);

      // Update the user object
      user.subscriptionTier = 'trial';
      user.subscriptionStatus = 'active';
      user.trialStartedAt = now;
      user.trialEndsAt = trialEnds;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await storage.getUserById(userId);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<Omit<User, 'password'> | null> {
    const user = await storage.updateUser(userId, updates);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await storage.getUserByVerificationToken(token);

    if (!user) {
      return false;
    }

    // Check if token is expired (24 hours)
    if (user.emailVerificationExpires && new Date() > new Date(user.emailVerificationExpires)) {
      return false;
    }

    // Mark email as verified and clear token
    await storage.updateUser(user.id, {
      emailVerified: 'true',
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    return true;
  }

  async resendVerificationEmail(email: string): Promise<boolean> {
    const user = await storage.getUserByEmail(email);

    if (!user || user.emailVerified === 'true') {
      return false;
    }

    // Generate new verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    // Update user with new token
    await storage.updateUser(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: expiresAt,
    });

    // Send verification email
    const { emailService } = await import('./email-service');
    await emailService.sendEmailVerification({
      username: user.username,
      email: user.email,
      verificationToken,
    });

    return true;
  }
}

export const authService = new AuthService();
