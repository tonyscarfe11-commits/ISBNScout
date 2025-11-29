import Database from 'better-sqlite3';

async function cleanupUsers() {
  try {
    console.log('Opening database...');

    // Open the SQLite database directly
    const db = new Database('isbn-scout-offline.db');

    console.log('Fetching all users...');
    const users = db.prepare('SELECT * FROM users').all();

    console.log(`Found ${users.length} users total`);

    const keepEmail = 'your@email.com';
    let deletedCount = 0;

    for (const user of users as any[]) {
      if (user.email !== keepEmail) {
        console.log(`Deleting user: ${user.username} (${user.email})`);
        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
        deletedCount++;
      } else {
        console.log(`Keeping user: ${user.username} (${user.email})`);
      }
    }

    db.close();

    console.log(`\n✅ Cleanup complete!`);
    console.log(`- Kept: 1 user (${keepEmail})`);
    console.log(`- Deleted: ${deletedCount} users`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupUsers();
