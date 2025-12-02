import Database from 'better-sqlite3';

const db = new Database('isbn-scout-offline.db');

// Get all permanently failed items
const failed = db.prepare(`
  SELECT id, entity, operation, error, timestamp
  FROM sync_queue
  WHERE synced = -1
`).all();

console.log(`Found ${failed.length} permanently failed sync items`);

if (failed.length > 0) {
  // Show what we're cleaning
  const grouped = failed.reduce((acc: any, item: any) => {
    const key = `${item.entity}-${item.operation}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log('\nBreakdown:');
  Object.entries(grouped).forEach(([key, count]) => {
    console.log(`  - ${key}: ${count}`);
  });

  // Delete permanently failed items
  const result = db.prepare(`
    DELETE FROM sync_queue WHERE synced = -1
  `).run();

  console.log(`\n✅ Cleaned up ${result.changes} permanently failed items`);
} else {
  console.log('✅ No failed items to clean');
}

db.close();
