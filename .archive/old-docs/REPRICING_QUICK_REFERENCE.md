# Repricing System - Quick Reference Guide

## Overview
Automated pricing engine for Amazon/eBay book listings. Runs hourly and adjusts prices based on competitor activity.

## Key Files

```
Core Logic:
  /server/repricing-service.ts      (331 lines) - Price calculation & updates
  /server/repricing-scheduler.ts    (87 lines)  - Hourly automation

API Layer:
  /server/routes.ts                 (1544 lines, lines 1204-1538 for repricing)
  /server/postgres-storage.ts       (447 lines, repricing methods at 350-447)

Frontend:
  /client/src/pages/RepricingPage.tsx (682 lines) - Complete UI

Database:
  /shared/schema.ts                 (lines 155-220) - Table definitions
  /migrations/0000_reflective_hawkeye.sql - Schema
```

## Database Tables

### repricingRules
```typescript
id: UUID (PK)
user_id: UUID (FK)
listing_id: UUID (FK, nullable) // null = applies to all listings
platform: 'amazon' | 'ebay' | 'all'
strategy: 'match_lowest' | 'beat_by_percent' | 'beat_by_amount' | 'target_margin'
strategy_value: decimal (percent or amount)
min_price: decimal (price floor)
max_price: decimal (price ceiling)
is_active: 'true' | 'false'
run_frequency: 'hourly' | 'daily' | 'manual'
last_run: timestamp
created_at, updated_at: timestamp
```

### repricingHistory
```typescript
id: UUID (PK)
user_id: UUID (FK)
listing_id: UUID (FK)
rule_id: UUID (FK, nullable)
old_price: decimal
new_price: decimal
competitor_price: decimal
reason: string
success: 'true' | 'false'
error_message: string (nullable)
created_at: timestamp
```

## API Endpoints

### Rule Management
```
POST   /api/repricing/rules          Create rule
GET    /api/repricing/rules          List all rules for user
GET    /api/repricing/rules/:id      Get specific rule
PATCH  /api/repricing/rules/:id      Update rule
DELETE /api/repricing/rules/:id      Delete rule
```

### Execution
```
POST   /api/repricing/run            Manual reprice (body: {listingId})
GET    /api/repricing/history        View history (query: ?listingId=...)
```

## Pricing Strategies

| Strategy | Formula | Example |
|----------|---------|---------|
| match_lowest | newPrice = competitorPrice | Lowest competitor is £9.99 → Set to £9.99 |
| beat_by_percent | newPrice = competitorPrice * (1 - percent/100) | Undercut 5% → £9.99 * 0.95 = £9.49 |
| beat_by_amount | newPrice = competitorPrice - amount | Undercut £0.50 → £9.99 - £0.50 = £9.49 |
| target_margin | newPrice = currentPrice | No change, generates alerts |

## How It Works

### Step 1: User Creates Rule
```javascript
POST /api/repricing/rules
{
  "platform": "amazon",
  "strategy": "beat_by_percent",
  "strategyValue": 5,
  "minPrice": 2.00,
  "maxPrice": 50.00,
  "isActive": true,
  "runFrequency": "hourly"
}
```

Response: Rule is created in database, user auto-registered for hourly repricing

### Step 2: Automated Cycle (Hourly)
```
RepricingScheduler.runRepricingCycle()
  ├─ For each registered user:
  │  ├─ Get all active rules
  │  ├─ For each rule:
  │  │  ├─ Get matching listings
  │  │  ├─ For each listing:
  │  │  │  ├─ Fetch competitor price (Amazon/eBay API)
  │  │  │  ├─ Calculate new price (apply strategy)
  │  │  │  ├─ Enforce min/max bounds
  │  │  │  ├─ Update listing on marketplace
  │  │  │  ├─ Update price in database
  │  │  │  └─ Record in repricingHistory
  │  │  └─ Update lastRun timestamp
  │  └─ Catch errors, continue
  └─ Next hour...
```

### Step 3: User Views Results
```
GET /api/repricing/rules → See all rules + lastRun times
GET /api/repricing/history → See price changes (old→new, reason, success)
```

### Step 4: Manual Reprice
```
POST /api/repricing/run
{"listingId": "xyz"}

Immediately executes repricing for that listing,
records as if it was automated run
```

## Class Structure

### RepricingService
```typescript
class RepricingService {
  async repriceListing(listing, rule, amazonService, ebayService)
    → RepricingResult
  
  private async fetchCompetitorPrice(listing, platform, services)
    → number | null
  
  private calculateNewPrice(currentPrice, competitorPrice, rule)
    → number
  
  private async updateListingPrice(listing, newPrice, services)
    → boolean
  
  async repriceAllActiveListings(userId)
    → RepricingResult[]
}
```

### RepricingScheduler
```typescript
class RepricingScheduler {
  private activeUserIds: Set<string>
  private intervalId: NodeJS.Timeout
  
  registerUser(userId: string) → void
  unregisterUser(userId: string) → void
  start() → void
  stop() → void
  
  private async runRepricingCycle() → void
  async runManual(userId: string) → void
}
```

## Storage Layer Methods

```typescript
// PostgresStorage implementation
async createRepricingRule(rule: InsertRepricingRule): Promise<RepricingRule>
async getRepricingRules(userId: string): Promise<RepricingRule[]>
async getRepricingRuleById(id: string): Promise<RepricingRule | undefined>
async getActiveRulesForListing(userId, listingId, platform): Promise<RepricingRule[]>
async updateRepricingRule(id, updates): Promise<RepricingRule | undefined>
async deleteRepricingRule(id): Promise<boolean>

async createRepricingHistory(history): Promise<RepricingHistory>
async getRepricingHistory(userId, listingId?): Promise<RepricingHistory[]>
```

## Frontend Components

### RepricingPage.tsx Structure
```typescript
// State
rules: RepricingRule[]           // All user's rules
history: RepricingHistory[]      // Recent 20 records
listings: Listing[]              // Active listings
showNewRule: boolean             // Form visibility
editingRule: RepricingRule | null // Edit mode
isRepricingNow: string | null    // Loading state

// Sections
1. Rule Creation Form (if showNewRule)
   - Platform selector
   - Strategy selector (with dynamic value field)
   - Min/Max price inputs
   - Frequency selector
   - Active toggle
   - Form validation

2. Active Rules List
   - Card view per rule
   - Edit/Delete buttons
   - Last run timestamp
   - Empty state card

3. Manual Repricing Section
   - First 5 active listings
   - "Reprice Now" button per listing
   - Loading indicator

4. Repricing History
   - Recent 20 records
   - Success/Failed badge
   - Price change visualization
   - Error messages
```

## Known Limitations

1. **Startup Backfill**: Users need to create rules to register. Manual fix: Check server logs.
2. **Per-Rule Frequency**: All rules run hourly regardless of `runFrequency` setting.
3. **Rule Priority**: If multiple rules match, FIFO order (no priority system).
4. **Missing Methods**: PostgreSQL lacks `getAllUsers()` and API usage tracking.
5. **Neon Logs**: Internal driver errors logged but caught by try-catch.

## Validation Rules

### Rule Creation
- `platform`: Required, must be 'amazon' | 'ebay' | 'all'
- `strategy`: Required, must be one of 4 strategies
- `minPrice`: Required, must be > 0, must be < maxPrice
- `maxPrice`: Required, must be > 0, must be > minPrice
- `strategyValue`: Required if strategy is 'beat_by_percent' or 'beat_by_amount'
- `listingId`: Optional (null = apply to all listings)
- `runFrequency`: Optional (default: 'hourly')
- `isActive`: Optional (default: true)

### Price Calculations
- All prices rounded to 2 decimals
- Min/max bounds always enforced
- Minimum price floor applied after strategy calculation
- Maximum price ceiling applied after strategy calculation

## Testing Checklist

- [ ] Create rule with each strategy
- [ ] Edit rule - verify updates
- [ ] Delete rule - verify removal
- [ ] Check scheduler logs for auto-registration
- [ ] Disable rule - verify auto-unregister (if last one)
- [ ] Manual "Reprice Now" works
- [ ] History shows repricing events
- [ ] Min/max bounds respected
- [ ] Competitor prices fetched correctly
- [ ] Prices updated on platforms

## Error Handling

- Try-catch blocks catch errors, continue processing
- Errors recorded in repricingHistory with errorMessage
- User errors don't stop other users' repricing
- Failed operations marked with success='false'
- Reason field explains why repricing succeeded or failed

## Performance Metrics

- Hourly scheduler interval: 3,600,000ms (1 hour)
- Database queries: Indexed for user_id, listing_id, platform, is_active
- History records: Paginated, shows 20 most recent
- API response times: < 200ms typical

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
SESSION_SECRET=...

# Optional but recommended
STRIPE_SECRET_KEY=...          # For subscription
OPENAI_API_KEY=...             # For AI recognition

# For repricing to work
AMAZON_KEY_ID=...              # Amazon SP-API
AMAZON_KEY_SECRET=...          # Amazon SP-API
EBAY_APP_ID=...                # eBay Trading API
EBAY_CERT_ID=...               # eBay Trading API
```

## Next Steps

1. Test with real listings
2. Implement per-rule frequency execution
3. Add rule priority system
4. Add startup backfill
5. Implement caching for competitor prices
6. Add advanced rule conditions

## Resources

- Full exploration: `/home/runner/workspace/CODEBASE_EXPLORATION_2025-11-17.md`
- Schema docs: `/home/runner/workspace/shared/schema.ts`
- Migration file: `/home/runner/workspace/migrations/0000_reflective_hawkeye.sql`
