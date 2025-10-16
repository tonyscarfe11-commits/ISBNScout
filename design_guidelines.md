# ISBNScout Design Guidelines

## Design Approach
**Selected Framework**: Hybrid approach drawing from Linear's efficiency-focused design language combined with mobile-first productivity patterns from apps like Scanner Pro and inventory management tools.

**Rationale**: ISBNScout is a utility-first tool where speed, clarity, and offline reliability are paramount. The design prioritizes quick access to scanning functions, instant data comprehension, and seamless mobile workflows.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background Base: 215 25% 12% (deep blue-gray)
- Surface: 215 20% 18% (elevated surfaces)
- Primary Action: 210 100% 60% (bright blue for scan/action buttons)
- Success: 150 65% 55% (profitable books indicator)
- Warning: 40 90% 60% (break-even indicator)
- Error: 0 75% 60% (unprofitable indicator)
- Text Primary: 0 0% 95%
- Text Secondary: 215 15% 65%

**Light Mode**
- Background Base: 0 0% 98%
- Surface: 0 0% 100%
- Primary Action: 210 100% 50%
- Success: 150 60% 45%
- Warning: 40 85% 50%
- Error: 0 70% 50%
- Text Primary: 215 25% 15%
- Text Secondary: 215 15% 45%

### B. Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - Clean, highly legible for data-dense interfaces
- Monospace: JetBrains Mono (for ISBNs and prices)

**Hierarchy**:
- Headers: font-bold text-xl to text-3xl
- Body: font-normal text-sm to text-base
- Data Labels: font-medium text-xs uppercase tracking-wide
- ISBN/Prices: font-mono font-semibold
- CTAs: font-semibold text-sm to text-base

### C. Layout System

**Spacing Units**: Use Tailwind primitives of 2, 4, 6, 8, 12, 16
- Tight spacing (p-2, gap-2): Within cards, between data points
- Standard spacing (p-4, gap-4): Between components, form fields
- Section spacing (py-8, py-12): Between major UI sections
- Card padding: p-4 to p-6

**Grid System**:
- Mobile: Single column, full-width components
- Tablet/Desktop: 2-column for book details, 3-column for history grid

### D. Component Library

**Primary Components**:

1. **Scan Interface**
   - Floating action button (FAB) - primary blue, fixed bottom-right, size-16
   - Camera viewfinder with overlay guides for barcode/cover scanning
   - Mode toggle: ISBN Scan / Cover Photo (segmented control)
   - Manual ISBN input field with numeric keypad optimization

2. **Book Cards**
   - Compact card design: Book thumbnail (left), title/author/ISBN (center), price indicators (right)
   - Status badges: "Profitable" (green), "Break Even" (orange), "Loss" (red)
   - Quick actions: View Details, List to Amazon/eBay
   - Skeleton loading states for offline-to-online sync

3. **Navigation**
   - Bottom tab bar (mobile): Scan / History / Listings / Settings
   - Top app bar: Page title, search (history), filter, sync status indicator

4. **Data Display**
   - Comparison tables: Clean rows showing Amazon price, eBay price, your cost
   - Profit calculator: Input cost field with real-time profit calculation display
   - Condition selector: Radio buttons or segmented control for book conditions

5. **Listing Forms**
   - Platform selector: Amazon / eBay toggle
   - Auto-populated fields from scanned data
   - Price suggestion based on market data
   - Photo upload for book condition
   - Submit button with loading state

6. **Offline Indicators**
   - Top banner: "Offline Mode - Scans will sync when online"
   - Queue counter: "5 books pending sync"
   - Sync button with animation when online

### E. Interaction Patterns

**Scan Flow**:
1. Tap FAB → Camera opens with mode selection
2. Frame barcode/cover → Auto-detect or capture button
3. Processing indicator → Book card appears with fetched data
4. Swipe card up for full details or tap quick actions

**Offline Behavior**:
- Scanned ISBNs stored locally with timestamp
- Gray-out unsynced cards with "pending" badge
- Auto-sync on connection with progress indicator
- Toast notifications for sync completion

**Mobile Optimization**:
- Large touch targets (min 44px height for buttons)
- Thumb-zone navigation (bottom tabs, bottom-right FAB)
- Swipe gestures: Swipe card left for quick delete, right for favorite
- Pull-to-refresh on history page

### F. Visual Enhancements

**Animations**: Minimal and purposeful
- FAB pulse on first load (guide user to scan)
- Card slide-up on scan complete (300ms ease-out)
- Skeleton shimmer for loading states
- Sync spinner when uploading queued scans

**Shadows & Depth**:
- Elevated cards: shadow-md (scanned book cards)
- FAB: shadow-lg with slight elevation on hover
- Modals/Sheets: shadow-2xl for clear hierarchy

**Icons**: 
- Heroicons (outline for inactive states, solid for active)
- Camera, barcode, list, clock (history), settings, cloud-sync

## Images

**No Hero Image**: This is a utility app, not a marketing page. Launch directly into the scan interface.

**Book Thumbnails**: 
- Small thumbnails (64x96px) in list view
- Larger preview (200x300px) in detail view
- Placeholder: Gray rectangle with book icon when no cover available

**Camera Interface**:
- Real-time camera feed with semi-transparent overlay grid
- Barcode targeting guide (centered rectangle with corners)

## Key Design Principles

1. **Speed First**: Every interaction optimized for rapid book scanning in physical stores
2. **Information Clarity**: Price data and profitability instantly scannable at a glance
3. **Offline Resilience**: Clear visual feedback for offline state, seamless sync when online
4. **Mobile Native**: Bottom-heavy navigation, one-handed operation, camera-first workflow
5. **Data Density**: Maximize information per screen without clutter - compact cards, clear typography hierarchy