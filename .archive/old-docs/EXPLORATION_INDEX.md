# ISBNScout Codebase Exploration - Document Index

Date: November 17, 2025
Explorer: Claude Code AI
Focus: Repricing Functionality & Overall Architecture

---

## Quick Navigation

### For Quick Overview
Start here: **EXPLORATION_SUMMARY.txt** (Plain text summary with all key info)
Also read: **REPRICING_QUICK_REFERENCE.md** (Fast reference for repricing system)

### For Deep Dive
Main document: **CODEBASE_EXPLORATION_2025-11-17.md** (1,044 lines, comprehensive)

---

## Document Breakdown

### 1. EXPLORATION_SUMMARY.txt
**Purpose**: Executive summary with all essential information in plain text format
**Sections**:
- Key findings
- Core components
- API endpoints
- Database schema
- Current state & limitations
- Technology stack
- How it works (user perspective)
- File locations
- Next steps
- Statistics

**Best for**: Quick understanding, sharing with team, decision-making

---

### 2. REPRICING_QUICK_REFERENCE.md
**Purpose**: Technical reference specifically for the repricing system
**Sections**:
- Overview
- Key files with line numbers
- Database table structures
- API endpoints with examples
- Pricing strategies with formulas
- How it works (4 steps)
- Class structures
- Storage methods
- Frontend components
- Validation rules
- Testing checklist
- Error handling
- Performance metrics

**Best for**: Developers implementing repricing, debugging, testing

---

### 3. CODEBASE_EXPLORATION_2025-11-17.md
**Purpose**: Complete architectural documentation
**Sections** (13 major sections):
1. Executive summary
2. Repricing functionality deep dive
   - Architecture overview
   - Pricing strategies
   - Database schema changes
   - Key implementation details
   - Frontend UI
   - Storage integration
3. Database schema overview
4. Project structure
5. API endpoints
6. Recent changes & commits
7. Technology stack
8. Current state & known issues
9. How repricing system works (3 perspectives)
10. Configuration & environment
11. Deployment & running
12. Testing & validation
13. Next steps & recommendations

**Best for**: Complete understanding, onboarding new developers, documentation

---

## File Locations Reference

### Repricing System Files
```
/home/runner/workspace/server/repricing-service.ts      (331 lines)
/home/runner/workspace/server/repricing-scheduler.ts    (87 lines)
/home/runner/workspace/server/routes.ts                 (1544 lines, repricing at 1204-1538)
/home/runner/workspace/server/postgres-storage.ts       (447 lines, repricing at 350-447)
/home/runner/workspace/client/src/pages/RepricingPage.tsx (682 lines)
```

### Database Files
```
/home/runner/workspace/shared/schema.ts                 (220+ lines, repricing tables at 155-220)
/home/runner/workspace/migrations/0000_reflective_hawkeye.sql
```

### Documentation Files
```
/home/runner/workspace/CODEBASE_EXPLORATION_2025-11-17.md   (1,044 lines)
/home/runner/workspace/REPRICING_QUICK_REFERENCE.md         (300+ lines)
/home/runner/workspace/EXPLORATION_SUMMARY.txt              (150 lines)
/home/runner/workspace/EXPLORATION_INDEX.md                 (this file)
```

### Other Important Files
```
/home/runner/workspace/NEXT_STEPS.md                     (350 lines, business plan)
/home/runner/workspace/SESSION_SUMMARY_2025-11-14_PART2.md (421 lines, recent fixes)
/home/runner/workspace/replit.md                         (Project overview)
```

---

## Quick Reference Tables

### Database Tables
| Table | Lines | Purpose |
|-------|-------|---------|
| users | - | User accounts & subscriptions |
| books | - | Book catalog with ISBN & pricing |
| listings | - | Active marketplace listings |
| inventoryItems | - | Physical inventory tracking |
| apiCredentials | - | API keys storage |
| repricingRules | 155-170 | Repricing automation rules |
| repricingHistory | 193-220 | Repricing event history |

### Core Services
| Service | File | Lines | Purpose |
|---------|------|-------|---------|
| RepricingService | repricing-service.ts | 331 | Price calculation & updates |
| RepricingScheduler | repricing-scheduler.ts | 87 | Hourly automation engine |
| PostgresStorage | postgres-storage.ts | 447 | Database operations |
| AuthService | auth-service.ts | - | User authentication |
| AmazonService | amazon-service.ts | - | Amazon SP-API wrapper |
| EbayService | ebay-service.ts | - | eBay Trading API wrapper |

### API Endpoint Groups
| Group | Endpoints | Lines |
|-------|-----------|-------|
| Repricing | 7 endpoints | 1204-1538 |
| Authentication | 4 endpoints | - |
| Books | 3 endpoints | - |
| Listings | 4 endpoints | - |
| Inventory | 4 endpoints | - |
| Subscriptions | 2 endpoints | - |
| Others | Health, credentials, etc | - |

---

## Key Insights

### Architecture Patterns
1. **Service Layer**: RepricingService handles business logic
2. **Scheduler Pattern**: RepricingScheduler automates execution
3. **Repository Pattern**: PostgresStorage abstracts database
4. **Strategy Pattern**: 4 pricing strategies implemented
5. **Singleton Pattern**: One scheduler instance per app

### Code Quality
- TypeScript throughout for type safety
- Comprehensive error handling with try-catch
- User isolation (one user's error doesn't affect others)
- Proper validation on all inputs
- Clear separation of concerns

### Database Design
- Proper foreign keys with cascade/set null
- 19 indexes for query performance
- UUID primary keys
- Timestamp tracking (created_at, updated_at)
- Optional fields where appropriate

---

## What's New (November 14, 2025)

The repricing system represents **1,531 lines of new code** across:
- 331 lines: RepricingService
- 87 lines: RepricingScheduler
- 334 lines: API endpoints
- 682 lines: Frontend UI
- 97 lines: Storage methods

This is a **production-ready** feature that:
- Supports 4 pricing strategies
- Runs automatically every hour
- Allows manual trigger per-listing
- Tracks complete history
- Respects price boundaries
- Integrates with Amazon/eBay APIs

---

## Known Limitations to Address

**High Priority**:
1. Per-rule frequency not enforced (all run hourly)
2. No rule priority system (FIFO if multiple match)
3. Startup backfill not implemented

**Medium Priority**:
4. No caching for competitor prices
5. Missing getAllUsers() for better startup
6. No retry logic for failed repricing

**Low Priority**:
7. No advanced rule conditions
8. No dry-run mode
9. No analytics dashboard

---

## Testing Strategy

### Manual Testing
- Create rule with each of 4 strategies
- Edit/delete rules
- Verify scheduler auto-registration
- Manual reprice trigger
- History accuracy
- Price bounds enforcement

### API Testing
- Create/read/update/delete endpoints
- Validation error cases
- Unauthorized access
- Missing parameters

### Database Testing
- Verify schema created correctly
- Check indexes exist
- Test foreign key constraints
- Confirm null handling

---

## Development Workflow

### Quick Start
1. Read EXPLORATION_SUMMARY.txt (5 min)
2. Skim REPRICING_QUICK_REFERENCE.md (10 min)
3. Run `npm run dev` and create a test rule (5 min)
4. Monitor server logs during hourly cycle (5 min)

### Deep Understanding
1. Read full CODEBASE_EXPLORATION_2025-11-17.md (30 min)
2. Review source files (repricing-service.ts, scheduler) (20 min)
3. Check database schema (shared/schema.ts) (10 min)
4. Test API endpoints with curl (15 min)

### Implementation
1. Understand requirement
2. Check REPRICING_QUICK_REFERENCE.md for context
3. Modify appropriate file (service/scheduler/api/ui)
4. Test with curl/postman
5. Verify in UI

---

## Technology Stack Summary

**Backend**: Node.js + Express.js + TypeScript
**Frontend**: React + TypeScript + TailwindCSS
**Database**: PostgreSQL + Drizzle ORM
**APIs**: Amazon SP-API, eBay Trading API, OpenAI, Stripe, Google Books
**Deployment**: Replit (cloud IDE + Helium PostgreSQL)

---

## Next Session Checklist

When continuing work on this project:

- [ ] Read EXPLORATION_SUMMARY.txt
- [ ] Review REPRICING_QUICK_REFERENCE.md
- [ ] Check git status and recent commits
- [ ] Run tests to verify system working
- [ ] Review known limitations section
- [ ] Plan implementation of high-priority items

---

## Support Resources

### Documentation
- CODEBASE_EXPLORATION_2025-11-17.md - Everything
- REPRICING_QUICK_REFERENCE.md - Repricing details
- NEXT_STEPS.md - Business plan & roadmap
- SESSION_SUMMARY_2025-11-14_PART2.md - Recent fixes & context

### Code Files
- /server/repricing-service.ts - Core logic
- /server/repricing-scheduler.ts - Automation
- /client/src/pages/RepricingPage.tsx - UI
- /shared/schema.ts - Database definitions

### External References
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- Express.js: https://expressjs.com/
- React: https://react.dev/
- PostgreSQL: https://www.postgresql.org/docs/

---

## Document Statistics

| Document | Type | Size | Sections | Purpose |
|----------|------|------|----------|---------|
| CODEBASE_EXPLORATION_2025-11-17.md | Markdown | 1,044 lines | 13 | Complete reference |
| REPRICING_QUICK_REFERENCE.md | Markdown | 300+ lines | 15 | Technical quick ref |
| EXPLORATION_SUMMARY.txt | Plain text | 150 lines | 11 | Executive summary |
| EXPLORATION_INDEX.md | Markdown | This file | 12 | Navigation guide |

**Total Documentation**: 1,500+ lines covering all aspects of the repricing system and overall codebase architecture.

---

## Conclusion

The ISBNScout repricing system is **production-ready with clean architecture**. The documentation provided covers:

- Complete implementation details
- Database schema and indexes
- API specifications with examples
- Frontend component structure
- Known limitations and next steps
- Testing checklist
- File locations for quick reference

Everything needed to understand, test, debug, and extend the repricing system is contained in these documents.

---

**Documents Created**: November 17, 2025
**Total Lines of Documentation**: 1,500+
**Project Status**: Stable, ready for use with minor enhancements
