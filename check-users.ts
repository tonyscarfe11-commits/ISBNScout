import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const users = await sql`SELECT id, email, username FROM users`;
  console.log('Current users in database:');
  users.forEach(u => console.log(`- ${u.email} (username: ${u.username})`));
}

main();
