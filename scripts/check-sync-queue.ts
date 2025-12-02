import Database from 'better-sqlite3';

const db = new Database('isbn-scout-offline.db');

// Get all unsynced items
const unsynced = db.prepare(`
  SELECT entity, operation, synced, error, retry_count, timestamp
  FROM sync_queue
  WHERE synced != 1
  ORDER BY timestamp DESC
`).all();

console.log(`\n=== Sync Queue Status ===`);
console.log(`Total unsynced items: ${unsynced.length}\n`);

if (unsynced.length > 0) {
  const grouped = unsynced.reduce((acc: any, item: any) => {
    const key = item.synced === -1 ? 'permanently_failed' : 'pending';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  if (grouped.pending) {
    console.log(`Pending items (${grouped.pending.length}):`);
    grouped.pending.slice(0, 5).forEach((item: any) => {
      console.log(`  - ${item.entity} ${item.operation} (retries: ${item.retry_count || 0})`);
      if (item.error) console.log(`    Error: ${item.error.substring(0, 80)}`);
    });
    if (grouped.pending.length > 5) {
      console.log(`  ... and ${grouped.pending.length - 5} more`);
    }
    console.log();
  }

  if (grouped.permanently_failed) {
    console.log(`Permanently failed items (${grouped.permanently_failed.length}):`);
    grouped.permanently_failed.slice(0, 5).forEach((item: any) => {
      console.log(`  - ${item.entity} ${item.operation}`);
      console.log(`    Error: ${item.error?.substring(0, 100)}`);
    });
    if (grouped.permanently_failed.length > 5) {
      console.log(`  ... and ${grouped.permanently_failed.length - 5} more`);
    }
  }
} else {
  console.log('✅ All items synced successfully!');
}

db.close();
