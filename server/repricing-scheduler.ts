import type { IStorage } from "./storage";
import { RepricingService } from "./repricing-service";
import type { RepricingRule } from "../shared/schema";

export class RepricingScheduler {
  private storage: IStorage;
  private repricingService: RepricingService;
  private intervalId: NodeJS.Timeout | null = null;
  private activeUserIds: Set<string> = new Set();

  constructor(storage: IStorage, repricingService: RepricingService) {
    this.storage = storage;
    this.repricingService = repricingService;
  }

  registerUser(userId: string) {
    this.activeUserIds.add(userId);
    console.log(`[Repricing Scheduler] Registered user ${userId} for automated repricing`);
  }

  unregisterUser(userId: string) {
    this.activeUserIds.delete(userId);
    console.log(`[Repricing Scheduler] Unregistered user ${userId} from automated repricing`);
  }

  start() {
    if (this.intervalId) {
      console.log("[Repricing Scheduler] Already running");
      return;
    }

    console.log("[Repricing Scheduler] Starting automated repricing scheduler");
    
    this.runRepricingCycle();
    
    this.intervalId = setInterval(() => {
      this.runRepricingCycle();
    }, 60 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[Repricing Scheduler] Stopped");
    }
  }

  private async runRepricingCycle() {
    try {
      console.log("[Repricing Scheduler] Running automated repricing cycle");
      
      if (this.activeUserIds.size === 0) {
        console.log("[Repricing Scheduler] No users registered for automated repricing");
        return;
      }

      const userIds = Array.from(this.activeUserIds);
      console.log(`[Repricing Scheduler] Repricing for ${userIds.length} users`);

      for (const userId of userIds) {
        try {
          const rules = await this.storage.getRepricingRules(userId);
          const activeRules = rules.filter(rule => rule.isActive === "true");

          if (activeRules.length === 0) {
            continue;
          }

          console.log(`[Repricing Scheduler] Running repricing for user ${userId} (${activeRules.length} active rules)`);
          await this.repricingService.repriceAllActiveListings(userId);
        } catch (error: any) {
          console.error(`[Repricing Scheduler] Error repricing for user ${userId}:`, error.message);
        }
      }

      console.log("[Repricing Scheduler] Automated repricing cycle completed");
    } catch (error: any) {
      console.error("[Repricing Scheduler] Error in repricing cycle:", error.message);
    }
  }

  async runManual(userId: string): Promise<void> {
    console.log(`[Repricing Scheduler] Running manual repricing for user ${userId}`);
    await this.repricingService.repriceAllActiveListings(userId);
  }
}
