#!/usr/bin/env tsx
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function updateUser() {
  const trialEndsAt = new Date('2025-12-05T12:00:00.000Z');
  const trialStartedAt = new Date('2025-11-21T12:00:00.000Z');
  
  console.log('Updating trial dates in PostgreSQL...');
  console.log('Trial started:', trialStartedAt.toISOString());
  console.log('Trial ends:', trialEndsAt.toISOString());
  
  const result = await db
    .update(users)
    .set({
      trialStartedAt,
      trialEndsAt,
      updatedAt: new Date(),
    })
    .where(eq(users.username, 'test-trial-user'))
    .returning();
  
  console.log('Updated:', result[0]);
  await client.end();
  process.exit(0);
}

updateUser().catch(e => {
  console.error(e);
  process.exit(1);
});
