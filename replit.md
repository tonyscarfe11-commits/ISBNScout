# ISBNScout - Book Scouting App

## Overview
ISBNScout is a mobile-first book scouting application that helps resellers find profitable books to sell on Amazon and eBay. The app features offline-first architecture, AI-powered book recognition, profitability analysis with sales velocity data, and automated repricing.

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Storage**: Hybrid SQLite (offline) + PostgreSQL (production sync)
- **AI**: OpenAI GPT-4 Vision for cover/spine recognition
- **APIs**: Amazon SP-API, eBay Trading API, Google Books API

### Key Features
1. **Barcode Scanner**: Scan ISBN barcodes to quickly look up books
2. **AI Book Recognition**: Take photos of book covers or spines - AI identifies the book
3. **Sales Velocity Analysis**: Real-time profitability analysis with market demand data
4. **Multi-Platform Listing**: List books to Amazon FBA/MFN and eBay from one interface
5. **Repricing Engine**: Automated price adjustments based on competitive strategies
6. **Offline-First**: Works without internet using SQLite, syncs to PostgreSQL when online

## Recent Changes (November 14, 2025)

### Repricing Engine (Production-Ready)
Built a complete automated repricing system for managing listing prices across Amazon and eBay:

#### Features Implemented:
1. **Repricing Rules**:
   - Create rules for specific listings or platform-wide
   - 4 pricing strategies:
     - `match_lowest`: Match the lowest competitor price
     - `beat_by_percent`: Beat competitors by X%
     - `beat_by_amount`: Beat competitors by £X
     - `target_margin`: Maintain target profit margin
   - Min/max price boundaries to protect margins
   - Run frequency: hourly, daily, or weekly

2. **Backend Services**:
   - `RepricingService`: Core repricing logic with marketplace API integration
   - `RepricingScheduler`: Automated hourly repricing with user auto-registration
   - Full validation: NaN rejection, zero-value support, min < max enforcement
   - Comprehensive error handling and logging

3. **API Endpoints**:
   - `POST /api/repricing/rules` - Create repricing rule
   - `GET /api/repricing/rules` - List all rules
   - `GET /api/repricing/rules/:id` - Get specific rule
   - `PATCH /api/repricing/rules/:id` - Update rule
   - `DELETE /api/repricing/rules/:id` - Delete rule
   - `POST /api/repricing/run` - Manual repricing trigger (per-listing)
   - `GET /api/repricing/history` - View repricing history

4. **Frontend UI** (`RepricingPage.tsx`):
   - Create/edit repricing rules with form validation
   - View repricing history with filters
   - Manual repricing triggers
   - Accessible via Settings → Quick Links

5. **Automated Scheduler**:
   - Runs every hour
   - Auto-registers users when they create/update active rules
   - De-registers users when all rules become inactive/deleted
   - Per-user error handling (one user's failure doesn't stop others)
   - Singleton pattern for consistent state across endpoints

#### Known Future Enhancements:
- Startup backfill (requires `getAllUsers()` storage method)
- Per-rule run frequency (currently all rules run hourly)
- Rule priority system for multiple matching rules

## User Preferences
- No emojis in UI (professional utility-first design)
- Mobile-first design inspired by Linear
- Use lucide-react icons for all UI elements
- AI spine recognition is the killer feature - no competitors can do this

## Project Structure

### Frontend (`client/src/`)
- `pages/ScanPage.tsx` - Barcode scanning and AI recognition
- `pages/RepricingPage.tsx` - Repricing rule management
- `pages/ListingsPage.tsx` - View and manage active listings
- `pages/SettingsPage.tsx` - App configuration and API credentials

### Backend (`server/`)
- `repricing-service.ts` - Core repricing logic
- `repricing-scheduler.ts` - Automated repricing scheduler
- `ai-service.ts` - OpenAI integration for book recognition
- `sales-velocity-service.ts` - Market demand analysis
- `amazon-service.ts` - Amazon SP-API integration
- `ebay-service.ts` - eBay Trading API integration
- `hybrid-storage.ts` - Offline-first SQLite + PostgreSQL sync

### Schema (`shared/schema.ts`)
- `users` - User accounts
- `books` - Book catalog with ISBN, title, author, etc.
- `listings` - Active marketplace listings
- `repricingRules` - Repricing automation rules
- `repricingHistory` - Historical repricing events
- `apiCredentials` - Encrypted marketplace credentials

## Development Guidelines
- Follow `development_guidelines/fullstack_js` instructions
- Use hybrid storage (SQLite offline, PostgreSQL production)
- Mobile-first responsive design
- Comprehensive validation on both frontend and backend
- Error handling with user-friendly messages
- Logging for observability

## Future Roadmap
1. Keepa integration for historical pricing data
2. Branding and logo design
3. Multi-user accounts and team features
4. Advanced analytics dashboard
5. Bulk listing import/export
6. Automated inventory management
