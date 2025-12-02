# 📱 Mobile App Testing Plan (Phase 3)

**Purpose:** Comprehensive manual testing of the ISBN Scout mobile app
**Duration:** 2 hours (when credits renew)
**Date:** 2025-11-27 afternoon

---

## Pre-Testing Setup

### Requirements:
- [ ] Mobile device charged and ready
- [ ] Good lighting for ISBN scanning (camera tests)
- [ ] Real books with ISBNs to scan
- [ ] Notepad/doc for recording bugs
- [ ] Screenshots enabled for bug reports

### Test Environment:
- Device: [Your phone model]
- OS Version: [iOS/Android version]
- App Version: [Record from app]
- Network: WiFi + Cellular (test both)

---

## Test Scenarios

## SCENARIO 1: First-Time User Experience (30 min)

### 1.1 App Installation & Launch
- [ ] Install app successfully
- [ ] App opens without crashing
- [ ] Splash screen displays correctly
- [ ] No errors in console logs

### 1.2 Sign Up Flow
- [ ] Navigate to sign up page
- [ ] Fill in username, email, password
- [ ] Submit sign up form
- [ ] Receive success message
- [ ] Session persists (don't get logged out)
- [ ] Navigate to different pages, session stays active
- [ ] **BUG CHECK:** Close app completely, reopen - still logged in?

**Document any:**
- Form validation errors
- Unclear error messages
- UI glitches or awkward flows

---

## SCENARIO 2: ISBN Scanning (45 min)

### 2.1 Single Book Scan - Real ISBN
- [ ] Open camera/scanner
- [ ] Scan a real book ISBN barcode
- [ ] ISBN detected correctly
- [ ] Book details load (title, author, thumbnail)
- [ ] Pricing data loads (eBay, Amazon if configured)
- [ ] Save book to inventory
- [ ] Book appears in inventory list

**Test Books:**
1. Book 1: Popular title (e.g., Harry Potter)
2. Book 2: Textbook
3. Book 3: Obscure/older book
4. Book 4: Non-fiction
5. Book 5: Different publisher

**Document:**
- Scan success rate (X out of 5)
- Time to detect ISBN (fast/slow)
- Time to load pricing data
- Any books that fail

### 2.2 Manual ISBN Entry
- [ ] Enter ISBN manually (no camera)
- [ ] Book looks up successfully
- [ ] Data loads correctly
- [ ] Save to inventory

### 2.3 AI-Generated ISBN (if applicable)
- [ ] Scan a book spine (OCR detection)
- [ ] AI detects title and author
- [ ] App searches by title/author
- [ ] Correct book found
- [ ] Save to inventory

### 2.4 Shelf Scanning (KILLER FEATURE!)
- [ ] Take photo of bookshelf with multiple books
- [ ] AI detects multiple ISBNs
- [ ] Review detected books
- [ ] Select books to add
- [ ] Books added to inventory

**Document:**
- Number of books detected vs. actual
- False positives/negatives
- Processing time for shelf scan
- UI/UX issues

### 2.5 Scan Limit Testing
- [ ] Check trial scan count (should show X/10)
- [ ] Perform multiple scans
- [ ] Count increments correctly
- [ ] Reach scan limit (scan 10 books)
- [ ] Prompted to upgrade
- [ ] **BUG CHECK:** Can you bypass limit?

---

## SCENARIO 3: Inventory Management (20 min)

### 3.1 View Inventory
- [ ] Navigate to inventory/books list
- [ ] All scanned books display
- [ ] Thumbnails load correctly
- [ ] Prices display correctly
- [ ] Can scroll through list smoothly

### 3.2 Book Details
- [ ] Tap on a book
- [ ] Detail view opens
- [ ] All information displays:
  - ISBN
  - Title, Author
  - Thumbnail
  - eBay price (avg, min, max)
  - Amazon price (if configured)
  - Status
  - Scanned date

### 3.3 Edit Book
- [ ] Tap edit button
- [ ] Update status (available → listed)
- [ ] Add purchase cost
- [ ] Add expected profit
- [ ] Save changes
- [ ] Changes persist after refresh

### 3.4 Delete Book
- [ ] Delete a book from inventory
- [ ] Confirmation prompt appears
- [ ] Book removed from list
- [ ] Deletion persists after app restart

### 3.5 Search/Filter
- [ ] Search books by title
- [ ] Search books by ISBN
- [ ] Filter by status (if available)
- [ ] Sort by price, date, etc.

---

## SCENARIO 4: Authentication & Session (15 min)

### 4.1 Logout & Login
- [ ] Log out successfully
- [ ] Return to login screen
- [ ] Log in with same credentials
- [ ] Previous data still present
- [ ] Session restored

### 4.2 Session Persistence
- [ ] Close app completely (swipe away)
- [ ] Reopen app
- [ ] **CRITICAL:** Still logged in? Or kicked out?
- [ ] Data still present?

### 4.3 Multiple Devices (if possible)
- [ ] Log in on second device
- [ ] Data syncs between devices?
- [ ] Add book on device 1
- [ ] Refresh device 2 - book appears?

---

## SCENARIO 5: Offline Mode (10 min)

### 5.1 Airplane Mode Test
- [ ] Enable airplane mode
- [ ] Open app
- [ ] View existing inventory (should work)
- [ ] Try to scan new book (should fail gracefully)
- [ ] Error message makes sense?
- [ ] Disable airplane mode
- [ ] Retry scan (should work)

### 5.2 Poor Connection
- [ ] Use cellular with poor signal
- [ ] Scan takes longer but succeeds?
- [ ] Or timeout with clear error?

---

## SCENARIO 6: Subscription/Upgrade (10 min)

### 6.1 Trial Status
- [ ] View subscription/account page
- [ ] Trial status displays correctly
- [ ] Scans used/remaining shows correctly
- [ ] Days remaining in trial

### 6.2 Upgrade Flow
- [ ] Tap "Upgrade" button
- [ ] Pricing tiers display
- [ ] Select a plan
- [ ] Payment screen loads (Stripe)
- [ ] **DON'T COMPLETE PAYMENT** - just verify flow
- [ ] Cancel and return to app

---

## SCENARIO 7: Error Scenarios (10 min)

### 7.1 Invalid ISBN
- [ ] Enter fake ISBN (e.g., "123456789")
- [ ] Error message displays
- [ ] Message is user-friendly
- [ ] App doesn't crash

### 7.2 No Internet Connection
- [ ] Turn off internet
- [ ] Try to scan book
- [ ] Clear error message about connection
- [ ] Retry button works?

### 7.3 Book Not Found
- [ ] Scan very obscure ISBN
- [ ] App handles gracefully
- [ ] Option to add manually?

### 7.4 Camera Permission
- [ ] Deny camera permission
- [ ] App prompts to enable
- [ ] Instructions clear
- [ ] Can enable from settings

---

## SCENARIO 8: UI/UX Polish (10 min)

### 8.1 Visual Polish
- [ ] Check for spelling errors
- [ ] Check for UI alignment issues
- [ ] Test all buttons (do they work?)
- [ ] Navigation is intuitive
- [ ] Loading indicators appear during waits
- [ ] Success messages after actions

### 8.2 Performance
- [ ] App feels responsive (no lag)
- [ ] Smooth scrolling in lists
- [ ] No memory leaks (app doesn't slow down)
- [ ] Camera opens quickly
- [ ] Book details load quickly

### 8.3 Accessibility
- [ ] Text is readable (not too small)
- [ ] Buttons are tappable (not too small)
- [ ] Contrast is good
- [ ] Works in dark mode (if available)

---

## Edge Cases to Test

### Camera/Scanning:
- [ ] Scan ISBN in poor lighting
- [ ] Scan ISBN at an angle
- [ ] Scan damaged/worn barcode
- [ ] Scan ISBN-10 vs ISBN-13
- [ ] Scan with camera shake/movement

### Data:
- [ ] Book with very long title
- [ ] Book with multiple authors
- [ ] Book with no thumbnail
- [ ] Book with special characters in title

### App States:
- [ ] Background app, return to it
- [ ] Receive phone call during scan
- [ ] Low battery warning during use
- [ ] App update prompt (if applicable)

---

## Bug Documentation Template

For each bug found, record:

```
BUG #X: [Short title]
Severity: [Critical / High / Medium / Low]
Location: [Screen/feature where it occurs]
Steps to Reproduce:
1.
2.
3.
Expected: [What should happen]
Actual: [What actually happened]
Screenshot: [Attach if possible]
Device: [Phone model, OS version]
```

---

## Test Results Summary

After testing, fill in:

### Overall Assessment:
- Total scenarios tested: __ / 8
- Scenarios passing: __
- Scenarios with issues: __

### Critical Bugs Found: __
1.
2.
3.

### Medium Bugs Found: __
1.
2.

### Minor Issues Found: __
1.
2.

### Positive Highlights:
-
-
-

### UX Improvements Needed:
-
-
-

---

## Success Criteria

The app is ready for launch if:

- [ ] All critical user flows work (sign up, scan, inventory)
- [ ] No critical bugs (crashes, data loss)
- [ ] Session persistence works
- [ ] Camera/scanning works reliably (>80% success rate)
- [ ] UI is polished and intuitive
- [ ] Error messages are helpful
- [ ] Performance is acceptable

Can launch with minor bugs if:
- [ ] Medium/low severity only
- [ ] Workarounds available
- [ ] Can be fixed post-launch

---

## After Testing

### Create Bug Reports:
- Document all bugs found
- Prioritize by severity
- Share with development team

### Update TESTING_COMPLETE.md:
- Add Phase 3 results
- Update final recommendations

### Decision:
- [ ] Ready to launch
- [ ] Need to fix X critical bugs first
- [ ] Needs more testing in area Y

---

## Tips for Effective Testing

1. **Test like a real user** - Don't just follow the script, try to break things
2. **Take screenshots** - Visual proof helps debugging
3. **Note the small stuff** - Even tiny UX annoyances matter
4. **Test worst-case scenarios** - Poor network, low battery, interruptions
5. **Think about edge cases** - What would go wrong?
6. **Be thorough** - Missing a critical bug now costs more than time later

---

## Questions to Answer

After testing, can you confidently say:

1. Would I use this app myself? Why or why not?
2. Would I recommend it to a friend? Why or why not?
3. What's the biggest strength of the app?
4. What's the biggest weakness?
5. If you could fix ONE thing before launch, what would it be?

---

**Happy Testing!** 📱📚

**Remember:** The goal is to find problems NOW before real users do. Be thorough and honest!
