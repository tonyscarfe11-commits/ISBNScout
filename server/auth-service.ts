import bcrypt from 'bcrypt';
import { storage } from './storage';
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

    // Set up 14-day trial period
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    // Create user with trial dates
    const user = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      subscriptionTier: 'trial',
      subscriptionStatus: 'active',
      trialStartedAt: now,
      trialEndsAt: trialEnds,
    } as any);

    console.log(`[Auth] Created user ${username} with trial ending ${trialEnds.toISOString()}`);

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

    // Auto-fix: If user is on trial but missing trial dates, set them now
    if (user.subscriptionTier === 'trial' && !user.trialEndsAt) {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      await storage.updateUser(user.id, {
        subscriptionStatus: 'active',
        trialStartedAt: now,
        trialEndsAt: trialEnds,
      });

      console.log(`[Auth] Fixed missing trial dates for user ${user.id} - 14 days from now`);

      // Update the user object with new dates
      user.trialStartedAt = now;
      user.trialEndsAt = trialEnds;
      user.subscriptionStatus = 'active';
    }

    // Auto-migrate: If user is on basic/free tier, upgrade to trial
    if (user.subscriptionTier === 'basic' || user.subscriptionTier === 'free' || !user.subscriptionTier) {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      await storage.updateUser(user.id, {
        subscriptionTier: 'trial',
        subscriptionStatus: 'active',
        trialStartedAt: now,
        trialEndsAt: trialEnds,
      });

      console.log(`[Auth] Migrated user ${user.id} from ${user.subscriptionTier || 'none'} to trial`);

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
}

export const authService = new AuthService();
