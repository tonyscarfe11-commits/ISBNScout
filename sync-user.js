const Database = require('better-sqlite3');
const { Client } = require('pg');

(async () => {
  // Get user from SQLite
  const sqliteDb = new Database('/home/runner/workspace/isbn-scout-offline.db');
  const user = sqliteDb.prepare('SELECT * FROM users WHERE email = ?').get('tonyscarfe11@gmail.com');
  sqliteDb.close();

  if (!user) {
    console.log('User not found in SQLite');
    return;
  }

  console.log('Found user in SQLite:', user.email);

  // Insert into PostgreSQL
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();

  await pgClient.query(`
    INSERT INTO users (
      id, username, email, password, subscription_tier, subscription_status,
      subscription_expires_at, trial_started_at, trial_ends_at, stripe_customer_id,
      stripe_subscription_id, created_at, updated_at, email_verified,
      email_verification_token, email_verification_expires
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    )
    ON CONFLICT (email) DO UPDATE SET
      password = EXCLUDED.password,
      email_verified = EXCLUDED.email_verified
  `, [
    user.id, user.username, user.email, user.password,
    user.subscription_tier || 'trial',
    user.subscription_status || 'trialing',
    user.subscription_expires_at,
    user.trial_started_at,
    user.trial_ends_at,
    user.stripe_customer_id,
    user.stripe_subscription_id,
    user.created_at,
    user.updated_at,
    user.email_verified || true,
    user.email_verification_token,
    user.email_verification_expires
  ]);

  await pgClient.end();
  console.log('User synced to PostgreSQL successfully');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
