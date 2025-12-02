# ISBNScout Branding Refresh - Premium Bookstore Option

## Color Palette

### Light Mode
```
Primary (Deep Indigo)
--primary: 221 83% 53%           /* #2563eb - Rich, trustworthy blue */
--primary-foreground: 0 0% 100%  /* White text */

Accent (Warm Amber - for profits/highlights)
--accent-profit: 43 96% 56%      /* #f59e0b - Warm, opportunity */

Background
--background: 30 40% 98%         /* #faf8f5 - Soft cream/off-white */
--foreground: 220 25% 15%        /* Deep blue-gray text */

Card/Surface
--card: 0 0% 100%                /* Pure white cards */
--card-border: 220 15% 90%       /* Subtle blue-gray borders */

Header/Navigation
--header-bg: 221 39% 11%         /* #0f172a - Deep navy */
--header-text: 0 0% 100%         /* White */

Secondary/Muted
--secondary: 220 15% 95%         /* Light blue-gray */
--muted: 220 12% 94%             /* Very light blue-gray */
```

### Dark Mode
```
Primary (Bright Indigo)
--primary: 221 91% 65%           /* Lighter, vibrant for dark mode */

Accent (Bright Amber)
--accent-profit: 43 96% 60%      /* Slightly brighter for contrast */

Background
--background: 222 47% 11%        /* #0f172a - Deep navy */
--foreground: 210 20% 98%        /* Off-white text */

Card/Surface
--card: 221 39% 15%              /* Slightly lighter navy for cards */
```

## Visual Examples

### Current Design (Teal)
```
Header:        [████████████████] Slate-700 (#334155)
Primary CTA:   [████████████████] Teal-600 (#0d9488)
Profit Text:   [████████████████] Teal-400 (#2dd4bf)
Background:    [░░░░░░░░░░░░░░░░] Cyan-tinted white
```

### New Design (Premium Bookstore)
```
Header:        [████████████████] Deep Navy (#0f172a)
Primary CTA:   [████████████████] Rich Indigo (#2563eb)
Profit Text:   [████████████████] Warm Amber (#f59e0b)
Background:    [░░░░░░░░░░░░░░░░] Soft Cream (#faf8f5)
```

## Key Changes

### 1. Header/Navigation
- **Before:** Slate-700 (`bg-slate-700`)
- **After:** Deep Navy (`bg-[#0f172a]`)
- **Why:** Richer, more sophisticated, less generic

### 2. Primary Buttons & CTAs
- **Before:** Teal-600 (`bg-teal-600`)
- **After:** Indigo-600 (`bg-blue-600`)
- **Why:** More professional, stands out from competitors

### 3. Profit/Success Indicators
- **Before:** Teal-400 (`text-teal-400`)
- **After:** Amber-500 (`text-amber-500`)
- **Why:** Psychologically linked to money/opportunity/gold

### 4. Background
- **Before:** Very light cyan-tinted (`HSL 180 15% 97%`)
- **After:** Soft cream (`#faf8f5`)
- **Why:** Warmer, more inviting, book-like feel

### 5. Accent Colors
- **Before:** Single teal throughout
- **After:** Indigo (primary) + Amber (profit) = Visual hierarchy
- **Why:** Tells a story: Blue (trust) → Amber (profit)

## Design Philosophy

**Premium Bookstore** means:
- Rich, deep colors (not bright/trendy)
- Warm undertones (cream, amber) not cold (cyan, gray)
- Professional but approachable
- Timeless, not trendy
- Feels established, not startup-y

## Competitor Differentiation

| App | Primary Color | Vibe |
|-----|---------------|------|
| ScoutIQ | Teal/Cyan | Generic SaaS |
| BookFinder | Blue (light) | Consumer-y |
| Scoutly | Purple | Playful |
| **ISBNScout (New)** | **Deep Indigo + Amber** | **Premium Professional** |

## Where Colors Appear

### Landing Page
- **Hero CTA:** Indigo button with white text
- **Secondary CTA:** Outline indigo border
- **Profit amounts:** Amber text (`£7.90` in warm gold)
- **Background:** Soft cream
- **Header:** Deep navy bar

### Dashboard
- **Profit charts:** Amber bars/lines
- **Data cards:** White on cream background
- **Action buttons:** Indigo
- **Alerts/warnings:** Amber for opportunities

### Scan Results
- **Good profit:** Amber text with green indicator
- **Platform comparison:** Indigo headers
- **Prices:** White cards on cream

## Typography
Keep current: **Inter** (excellent choice)

## What Stays the Same
- Overall layout ✓
- Component structure ✓
- Spacing/sizing ✓
- shadcn/ui components ✓
- Animation timings ✓

## What Changes
- Color palette only
- No layout changes
- No component rewrites
- No breaking changes

---

## Ready to Proceed?

If you like this direction, I'll update:
1. `client/src/index.css` - CSS variables
2. `client/src/pages/LandingPage.tsx` - Replace teal with indigo/amber
3. Any other components using teal-* classes

**Estimated time:** 10-15 minutes
**Risk level:** Low (color changes only, easily reversible)

**Want to see it live? Say the word and I'll apply it.**
