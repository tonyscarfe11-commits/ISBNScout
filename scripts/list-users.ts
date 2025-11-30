import Database from 'better-sqlite3';

async function listUsers() {
  try {
    console.log('Opening database...');
    const db = new Database('isbn-scout-offline.db');

    console.log('Fetching all users...\n');
    const users = db.prepare('SELECT * FROM users').all();

    if (users.length === 0) {
      console.log('No users found in database.');
      db.close();
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);

    users.forEach((user: any, index: number) => {
      console.log(`${index + 1}. User`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Subscription: ${user.subscriptionTier}`);
      console.log(`   Trial Ends: ${user.trialEndsAt || 'N/A'}`);
      console.log('');
    });

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing users:', error);
    process.exit(1);
  }
}

listUsers();
