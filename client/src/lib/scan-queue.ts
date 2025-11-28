/**
 * Client-side scan queue for offline support
 *
 * Stores scans locally when offline and syncs them when back online
 */

export interface QueuedScan {
  id: string;
  isbn: string;
  title: string;
  author: string;
  timestamp: number;
  retries: number;
  error?: string;
}

const QUEUE_KEY = 'scan_queue';
const MAX_RETRIES = 3;

class ScanQueue {
  private queue: QueuedScan[] = [];

  constructor() {
    this.loadQueue();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[ScanQueue] Failed to load queue:', error);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[ScanQueue] Failed to save queue:', error);
    }
  }

  /**
   * Add a scan to the queue
   */
  enqueue(scan: Omit<QueuedScan, 'id' | 'timestamp' | 'retries'>) {
    const queuedScan: QueuedScan = {
      ...scan,
      id: `scan-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedScan);
    this.saveQueue();

    console.log(`[ScanQueue] Enqueued scan: ${scan.isbn}`);
  }

  /**
   * Get all queued scans
   */
  getAll(): QueuedScan[] {
    return [...this.queue];
  }

  /**
   * Get count of pending scans
   */
  count(): number {
    return this.queue.length;
  }

  /**
   * Remove a scan from the queue
   */
  remove(scanId: string) {
    this.queue = this.queue.filter(s => s.id !== scanId);
    this.saveQueue();
    console.log(`[ScanQueue] Removed scan: ${scanId}`);
  }

  /**
   * Mark a scan as failed and increment retry count
   */
  markFailed(scanId: string, error: string) {
    const scan = this.queue.find(s => s.id === scanId);
    if (scan) {
      scan.retries++;
      scan.error = error;

      // Remove if max retries exceeded
      if (scan.retries >= MAX_RETRIES) {
        console.log(`[ScanQueue] Max retries exceeded for ${scanId}, removing`);
        this.remove(scanId);
      } else {
        this.saveQueue();
      }
    }
  }

  /**
   * Process the queue - try to sync all pending scans
   */
  async processQueue(): Promise<{ synced: number; failed: number }> {
    if (this.queue.length === 0) {
      return { synced: 0, failed: 0 };
    }

    console.log(`[ScanQueue] Processing ${this.queue.length} queued scans...`);

    let synced = 0;
    let failed = 0;

    // Process scans one by one
    for (const scan of [...this.queue]) {
      try {
        // Try to save the scan to the server
        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isbn: scan.isbn,
            title: scan.title,
            author: scan.author,
          }),
          credentials: 'include',
        });

        if (response.ok) {
          // Success - remove from queue
          this.remove(scan.id);
          synced++;
        } else {
          // Failed - mark and retry later
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          this.markFailed(scan.id, errorData.message || response.statusText);
          failed++;
        }
      } catch (error: any) {
        // Network error - mark and retry later
        this.markFailed(scan.id, error.message);
        failed++;
      }
    }

    console.log(`[ScanQueue] Processed queue: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  }

  /**
   * Clear all queued scans
   */
  clear() {
    this.queue = [];
    this.saveQueue();
    console.log('[ScanQueue] Queue cleared');
  }
}

// Singleton instance
let scanQueue: ScanQueue | null = null;

export function getScanQueue(): ScanQueue {
  if (!scanQueue) {
    scanQueue = new ScanQueue();
  }
  return scanQueue;
}
