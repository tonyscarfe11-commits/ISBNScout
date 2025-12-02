import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import authRouter from '../../server/routes/auth';
import { generateTestEmail, generateTestUsername } from '../helpers/db-cleanup';

describe('Auth API Endpoints', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Add session middleware for tests
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }));

    app.use('/api/auth', authRouter);
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const username = generateTestUsername();
      const email = generateTestEmail();

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username,
          email,
          password: 'TestPassword123!',
        });

      if (response.status !== 200) {
        console.log('Error response:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.authToken).toBeDefined();
      expect(response.body.user.email).toBe(email);
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'incomplete',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
