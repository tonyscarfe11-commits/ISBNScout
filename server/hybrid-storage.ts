import type { IStorage } from "./storage";
import { SQLiteStorage } from "./sqlite-storage";
import { PostgresStorage } from "./postgres-storage";
import type {
  User,
  InsertUser,
  ApiCredentials,
  Book,
  InsertBook,
  Listing,
  InsertListing,
  InventoryItem,
  InsertInventoryItem,
  RepricingRule,
  InsertRepricingRule,
  RepricingHistory,
  InsertRepricingHistory,
} from "@shared/schema";

/**
 * HybridStorage: Offline-first storage with background sync
 *
 * - Writes to SQLite immediately (fast, works offline)
 * - Queues sync operations for PostgreSQL
 * - Syncs to Neon when online
 * - Perfect for mobile apps with intermittent connectivity
 */
export class HybridStorage implements IStorage {
  private local: SQLiteStorage;
  private remote: PostgresStorage | null;
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  private isOnline = true;

  constructor(
    localDbPath: string = "isbn-scout-offline.db",
    remoteConnectionString?: string
  ) {
    this.local = new SQLiteStorage(localDbPath);
    this.remote = remoteConnectionString
      ? new PostgresStorage(remoteConnectionString)
      : null;

    // Initialize sync queue table
    this.initSyncQueue();

    // Start periodic sync (every 30 seconds when online)
    if (this.remote) {
      setInterval(() => this.backgroundSync(), 30000);
    }
  }

  private initSyncQueue() {
    this.local["db"].exec(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        entity TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        error TEXT
      )
    `);
    console.log("[HybridStorage] Sync queue initialized");
  }

  private async queueSync(operation: string, entity: string, data: any) {
    const id = `${entity}-${operation}-${Date.now()}-${Math.random()}`;
    const timestamp = new Date().toISOString();

    this.local["db"]
      .prepare(
        `INSERT INTO sync_queue (id, operation, entity, data, timestamp)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(id, operation, entity, JSON.stringify(data), timestamp);

    // Trigger immediate sync if online
    if (this.isOnline && !this.isSyncing) {
      setTimeout(() => this.backgroundSync(), 100);
    }
  }

  private async backgroundSync() {
    if (!this.remote || this.isSyncing) return;

    this.isSyncing = true;
    try {
      const pending = this.local["db"]
        .prepare("SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp ASC LIMIT 50")
        .all() as any[];

      if (pending.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[HybridStorage] Syncing ${pending.length} operations to Neon...`);

      for (const item of pending) {
        try {
          const data = JSON.parse(item.data);

          switch (item.entity) {
            case "book":
              if (item.operation === "create") {
                await this.remote.createBook(data);
              } else if (item.operation === "update") {
                await this.remote.updateBook(data.isbn, data.updates);
              }
              break;

            case "user":
              if (item.operation === "create") {
                await this.remote.createUser(data);
              } else if (item.operation === "update") {
                await this.remote.updateUser(data.id, data.updates);
              }
              break;

            case "listing":
              if (item.operation === "create") {
                await this.remote.createListing(data);
              } else if (item.operation === "updateStatus") {
                await this.remote.updateListingStatus(
                  data.id,
                  data.status,
                  data.errorMessage
                );
              }
              break;

            case "inventoryItem":
              if (item.operation === "create") {
                await this.remote.createInventoryItem(data);
              } else if (item.operation === "update") {
                await this.remote.updateInventoryItem(data.id, data.updates);
              } else if (item.operation === "delete") {
                await this.remote.deleteInventoryItem(data.id);
              }
              break;

            case "apiCredentials":
              if (item.operation === "save") {
                await this.remote.saveApiCredentials(
                  data.userId,
                  data.platform,
                  data.credentials
                );
              }
              break;
          }

          // Mark as synced
          this.local["db"]
            .prepare("UPDATE sync_queue SET synced = 1 WHERE id = ?")
            .run(item.id);

        } catch (error: any) {
          console.error(`[HybridStorage] Sync error for ${item.id}:`, error.message);

          // Mark error but keep trying
          this.local["db"]
            .prepare("UPDATE sync_queue SET error = ? WHERE id = ?")
            .run(error.message, item.id);
        }
      }

      // Clean up synced items older than 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      this.local["db"]
        .prepare("DELETE FROM sync_queue WHERE synced = 1 AND timestamp < ?")
        .run(weekAgo);

      console.log(`[HybridStorage] Sync complete`);
    } catch (error: any) {
      console.error("[HybridStorage] Background sync failed:", error.message);
    } finally {
      this.isSyncing = false;
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    // Try remote first if online, fallback to local
    if (this.isOnline && this.remote) {
      try {
        return await this.remote.getUser(id);
      } catch (error) {
        console.warn("[HybridStorage] Remote getUser failed, using local");
      }
    }
    return this.local.getUser(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (this.isOnline && this.remote) {
      try {
        return await this.remote.getUserByUsername(username);
      } catch (error) {
        console.warn("[HybridStorage] Remote getUserByUsername failed, using local");
      }
    }
    return this.local.getUserByUsername(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.isOnline && this.remote) {
      try {
        return await this.remote.getUserByEmail(email);
      } catch (error) {
        console.warn("[HybridStorage] Remote getUserByEmail failed, using local");
      }
    }
    return this.local.getUserByEmail(email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const created = await this.local.createUser(user);
    await this.queueSync("create", "user", user);
    return created;
  }

  async updateUser(
    id: string,
    updates: Partial<Omit<User, "id" | "password">>
  ): Promise<User | undefined> {
    const updated = await this.local.updateUser(id, updates);
    if (updated) {
      await this.queueSync("update", "user", { id, updates });
    }
    return updated;
  }

  // API Credentials
  async getApiCredentials(
    userId: string,
    platform: string
  ): Promise<ApiCredentials | undefined> {
    if (this.isOnline && this.remote) {
      try {
        return await this.remote.getApiCredentials(userId, platform);
      } catch (error) {
        console.warn("[HybridStorage] Remote getApiCredentials failed, using local");
      }
    }
    return this.local.getApiCredentials(userId, platform);
  }

  async saveApiCredentials(
    userId: string,
    platform: string,
    credentials: any
  ): Promise<ApiCredentials> {
    const saved = await this.local.saveApiCredentials(
      userId,
      platform,
      credentials
    );
    await this.queueSync("save", "apiCredentials", {
      userId,
      platform,
      credentials,
    });
    return saved;
  }

  // Books (offline-first - most important for scanner!)
  async createBook(book: InsertBook): Promise<Book> {
    // ALWAYS save locally first (works offline)
    const created = await this.local.createBook(book);

    // Queue for sync
    await this.queueSync("create", "book", book);

    return created;
  }

  async getBooks(userId: string): Promise<Book[]> {
    // Always use local for speed (synced in background)
    return this.local.getBooks(userId);
  }

  async getBookById(id: string): Promise<Book | undefined> {
    return this.local.getBookById(id);
  }

  async getBookByISBN(isbn: string): Promise<Book | undefined> {
    return this.local.getBookByISBN(isbn);
  }

  async updateBook(
    isbn: string,
    updates: Partial<Omit<Book, "id" | "userId" | "isbn" | "scannedAt">>
  ): Promise<Book | undefined> {
    const updated = await this.local.updateBook(isbn, updates);
    if (updated) {
      await this.queueSync("update", "book", { isbn, updates });
    }
    return updated;
  }

  // Listings
  async createListing(listing: InsertListing): Promise<Listing> {
    const created = await this.local.createListing(listing);
    await this.queueSync("create", "listing", listing);
    return created;
  }

  async getListings(userId: string): Promise<Listing[]> {
    return this.local.getListings(userId);
  }

  async getListingById(id: string): Promise<Listing | undefined> {
    return this.local.getListingById(id);
  }

  async getListingsByBook(
    userId: string,
    bookId: string
  ): Promise<Listing[]> {
    return this.local.getListingsByBook(userId, bookId);
  }

  async updateListingStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<Listing | undefined> {
    const updated = await this.local.updateListingStatus(
      id,
      status,
      errorMessage
    );
    if (updated) {
      await this.queueSync("updateStatus", "listing", {
        id,
        status,
        errorMessage,
      });
    }
    return updated;
  }

  // Inventory Items
  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const created = await this.local.createInventoryItem(item);
    await this.queueSync("create", "inventoryItem", item);
    return created;
  }

  async getInventoryItems(userId: string): Promise<InventoryItem[]> {
    return this.local.getInventoryItems(userId);
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
    return this.local.getInventoryItemById(id);
  }

  async getInventoryItemsByBook(
    userId: string,
    bookId: string
  ): Promise<InventoryItem[]> {
    return this.local.getInventoryItemsByBook(userId, bookId);
  }

  async updateInventoryItem(
    id: string,
    updates: Partial<Omit<InventoryItem, "id" | "userId" | "createdAt">>
  ): Promise<InventoryItem | undefined> {
    const updated = await this.local.updateInventoryItem(id, updates);
    if (updated) {
      await this.queueSync("update", "inventoryItem", { id, updates });
    }
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const deleted = await this.local.deleteInventoryItem(id);
    if (deleted) {
      await this.queueSync("delete", "inventoryItem", { id });
    }
    return deleted;
  }

  async updateListingPrice(id: string, newPrice: string): Promise<Listing | undefined> {
    const updated = await this.local.updateListingPrice(id, newPrice);
    if (updated) {
      await this.queueSync("update", "listing", { id, price: newPrice });
    }
    return updated;
  }

  async createRepricingRule(rule: InsertRepricingRule): Promise<RepricingRule> {
    const created = await this.local.createRepricingRule(rule);
    await this.queueSync("create", "repricingRule", rule);
    return created;
  }

  async getRepricingRules(userId: string): Promise<RepricingRule[]> {
    return this.local.getRepricingRules(userId);
  }

  async getRepricingRuleById(id: string): Promise<RepricingRule | undefined> {
    return this.local.getRepricingRuleById(id);
  }

  async getActiveRulesForListing(userId: string, listingId: string, platform: string): Promise<RepricingRule[]> {
    return this.local.getActiveRulesForListing(userId, listingId, platform);
  }

  async updateRepricingRule(id: string, updates: Partial<Omit<RepricingRule, 'id' | 'userId' | 'createdAt'>>): Promise<RepricingRule | undefined> {
    const updated = await this.local.updateRepricingRule(id, updates);
    if (updated) {
      await this.queueSync("update", "repricingRule", { id, updates });
    }
    return updated;
  }

  async deleteRepricingRule(id: string): Promise<boolean> {
    const deleted = await this.local.deleteRepricingRule(id);
    if (deleted) {
      await this.queueSync("delete", "repricingRule", { id });
    }
    return deleted;
  }

  async createRepricingHistory(history: InsertRepricingHistory): Promise<RepricingHistory> {
    const created = await this.local.createRepricingHistory(history);
    await this.queueSync("create", "repricingHistory", history);
    return created;
  }

  async getRepricingHistory(userId: string, listingId?: string): Promise<RepricingHistory[]> {
    return this.local.getRepricingHistory(userId, listingId);
  }

  // Sync control methods
  setOnlineStatus(isOnline: boolean) {
    this.isOnline = isOnline;
    if (isOnline && !this.isSyncing) {
      // Trigger sync when coming back online
      setTimeout(() => this.backgroundSync(), 1000);
    }
  }

  getPendingSyncCount(): number {
    const result = this.local["db"]
      .prepare("SELECT COUNT(*) as count FROM sync_queue WHERE synced = 0")
      .get() as any;
    return result?.count || 0;
  }

  async forceSyncNow(): Promise<void> {
    if (!this.remote) {
      throw new Error("No remote storage configured");
    }
    await this.backgroundSync();
  }

  getLastSyncTime(): Date | null {
    const result = this.local["db"]
      .prepare(
        "SELECT MAX(timestamp) as lastSync FROM sync_queue WHERE synced = 1"
      )
      .get() as any;
    return result?.lastSync ? new Date(result.lastSync) : null;
  }
}

interface SyncOperation {
  id: string;
  operation: string;
  entity: string;
  data: any;
  timestamp: string;
  synced: boolean;
  error?: string;
}
