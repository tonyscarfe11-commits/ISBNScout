import { neon } from '@neondatabase/serverless';

async function cleanupNeonUsers() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not set');
      process.exit(1);
    }

    console.log('Connecting to Neon database...');
    const sql = neon(databaseUrl);

    console.log('Fetching all users from Neon...');
    const users = await sql`SELECT * FROM users`;

    console.log(`Found ${users.length} users total in Neon`);

    const keepEmail = 'your@email.com';
    let deletedCount = 0;

    for (const user of users) {
      if (user.email !== keepEmail) {
        console.log(`Deleting user: ${user.username} (${user.email})`);
        await sql`DELETE FROM users WHERE id = ${user.id}`;
        deletedCount++;
      } else {
        console.log(`Keeping user: ${user.username} (${user.email})`);
      }
    }

    console.log(`\n✅ Neon cleanup complete!`);
    console.log(`- Kept: 1 user (${keepEmail})`);
    console.log(`- Deleted: ${deletedCount} users`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during Neon cleanup:', error);
    process.exit(1);
  }
}

cleanupNeonUsers();
