import Database from 'better-sqlite3';

const db = new Database('isbn-scout-offline.db');

// Find test items in sync queue
const testItems = db.prepare(`
  SELECT id, operation, entity, data, error, retry_count
  FROM sync_queue
  WHERE synced != 1
  AND (
    data LIKE '%test-%@example.com%'
    OR data LIKE '%testuser-%'
  )
`).all();

console.log(`Found ${testItems.length} test items in sync queue:`);
testItems.forEach((item: any) => {
  console.log(`  - ${item.id}: ${item.entity} ${item.operation} (retries: ${item.retry_count || 0}, error: ${item.error || 'none'})`);
});

if (testItems.length > 0) {
  // Delete test items
  const result = db.prepare(`
    DELETE FROM sync_queue
    WHERE synced != 1
    AND (
      data LIKE '%test-%@example.com%'
      OR data LIKE '%testuser-%'
    )
  `).run();

  console.log(`\n✅ Cleared ${result.changes} test items from sync queue`);
} else {
  console.log('\n✅ No test items found in sync queue');
}

// Show remaining items
const remaining = db.prepare('SELECT COUNT(*) as count FROM sync_queue WHERE synced != 1').get() as any;
console.log(`\nRemaining unsynced items: ${remaining.count}`);

db.close();
