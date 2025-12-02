# ISBNScout Test Day Checklist

**Test Date:** 2025-11-26
**Status:** Ready for Testing
**Duration:** 2-3 hours

---

## Pre-Test Setup (15 minutes)

### Environment Check

- [ ] Server starts successfully: `npm run dev`
- [ ] No TypeScript errors: `npm run build`
- [ ] Database is accessible
- [ ] All environment variables configured:
  - [ ] `OPENAI_API_KEY` (AI features)
  - [ ] `EBAY_APP_ID` & `EBAY_CERT_ID` (pricing)
  - [ ] `DATABASE_URL` (data storage)

### Quick Smoke Test

```bash
# Start the server
npm run dev

# In browser, navigate to:
http://localhost:5000

# Verify:
- [ ] Page loads without errors
- [ ] Can navigate to /scan
- [ ] Scanner interface visible
- [ ] No console errors
```

---

## Test Scenarios

### 1. Multi-Book Shelf Scanning (30 minutes)

#### Setup
1. Gather 3-5 books with clear spines
2. Find good lighting (natural or bright indoor)
3. Have phone/camera ready

#### Test Steps

**Test 1.1: Basic Shelf Scan**
- [ ] Navigate to /scan page
- [ ] Click mode toggle button (Camera → Library icon)
- [ ] Verify description changes to "Capture multiple books from your shelf at once"
- [ ] Line up 3 books spine-out
- [ ] Take photo from 2-3 feet away
- [ ] Click "Scan" button
- [ ] Wait for AI processing (should show loading indicator)
- [ ] **Expected:** Blue card appears with "Detected X Books"

**Test 1.2: Book Selection**
- [ ] Verify all books detected (check titles)
- [ ] Check confidence badges (high/medium/low)
- [ ] Verify high confidence books are pre-selected
- [ ] Click a book to deselect it
- [ ] Click again to reselect it
- [ ] Check "X selected" badge updates
- [ ] **Expected:** Selection state toggles correctly

**Test 1.3: Save Books**
- [ ] Click "Save X Books" button
- [ ] Wait for save operation
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Books appear in "Recent Scans"
- [ ] **Expected:** Scan counter increments
- [ ] Verify books saved to library/history

**Test 1.4: Error Handling**
- [ ] Take photo of non-book items
- [ ] **Expected:** Error message or 0 books detected
- [ ] Take blurry photo
- [ ] **Expected:** Low confidence or detection failure
- [ ] Click "Scan Again" button
- [ ] **Expected:** Results clear, ready for new scan

**Test 1.5: Switch Modes**
- [ ] Click mode toggle (Library → Camera)
- [ ] Verify switches back to single book mode
- [ ] Verify shelf results clear
- [ ] Take single book photo
- [ ] **Expected:** Single book recognition works

#### Success Criteria
- ✅ Detects at least 60% of visible books
- ✅ Correct titles (even if abbreviated)
- ✅ Processing time < 10 seconds
- ✅ No crashes or errors
- ✅ Smooth mode switching

---

### 2. Trial Paywall System (20 minutes)

#### Setup
1. Clear browser data (fresh trial)
2. Or use incognito mode
3. Have subscription page ready to check

#### Test Steps

**Test 2.1: Trial Counter**
- [ ] Navigate to /scan page
- [ ] Check scan counter banner shows "10 free scans remaining"
- [ ] Verify blue theme (low usage)
- [ ] Perform 1 scan
- [ ] **Expected:** Counter shows "9 free scans remaining"

**Test 2.2: Mid-Trial (50% usage)**
- [ ] Perform 4 more scans (total: 5 used)
- [ ] **Expected:** Counter shows "5 free scans remaining"
- [ ] **Expected:** "Upgrade for 10,000 scans/month" link appears
- [ ] Click upgrade link
- [ ] **Expected:** Redirects to /subscription page

**Test 2.3: Trial Warning (70% usage)**
- [ ] Navigate back to /scan
- [ ] Perform 2 more scans (total: 7 used)
- [ ] **Expected:** Counter turns orange/yellow
- [ ] **Expected:** "Upgrade" button appears
- [ ] **Expected:** Shows "3 free scans remaining"

**Test 2.4: Trial Limit Reached**
- [ ] Perform 3 more scans (total: 10 used)
- [ ] **Expected:** Counter turns red at 90%+ (9 scans)
- [ ] **Expected:** Shows "0 free scans remaining" at 10
- [ ] Attempt 11th scan
- [ ] **Expected:** Paywall modal appears

**Test 2.5: Paywall Modal**
- [ ] Verify modal shows "Free Trial Complete!"
- [ ] Check usage display shows "10 / 10 free scans"
- [ ] Verify Pro plan shows £19.99/month
- [ ] Check all 4 features are listed:
  - [ ] 10,000 scans/month
  - [ ] Shelf scanning
  - [ ] AI recognition
  - [ ] Live pricing
- [ ] Check "Best Value" badge visible
- [ ] Check "30-day money-back guarantee" text
- [ ] Click "Start Pro Subscription"
- [ ] **Expected:** Redirects to /subscription
- [ ] Go back, trigger modal again
- [ ] Click "Maybe Later"
- [ ] **Expected:** Modal closes

**Test 2.6: Post-Trial Behavior**
- [ ] Try to scan after dismissing modal
- [ ] **Expected:** Modal appears again
- [ ] **Expected:** Cannot scan without upgrading

#### Success Criteria
- ✅ Counter updates accurately after each scan
- ✅ Color changes at correct thresholds
- ✅ Modal appears exactly at 11th scan attempt
- ✅ All features listed correctly
- ✅ Navigation works properly
- ✅ No way to bypass paywall

---

### 3. Scan Counter Banner (15 minutes)

#### Test Steps

**Test 3.1: Visual States**
- [ ] At 0-69% usage: Blue theme
- [ ] At 70-89% usage: Orange/yellow theme
- [ ] At 90-100% usage: Red theme
- [ ] Progress bar fills correctly
- [ ] Icon color matches theme

**Test 3.2: Messaging**
- [ ] Trial user sees "free scans remaining"
- [ ] Shows "X of Y scans used"
- [ ] Upgrade link appears at 50%+ for trial
- [ ] Button appears at 70%+ usage

**Test 3.3: Interactions**
- [ ] Click upgrade link → redirects to /subscription
- [ ] Click "Upgrade" button → redirects to /subscription
- [ ] Banner persists across page navigation
- [ ] Updates immediately after scan

#### Success Criteria
- ✅ Always visible (non-intrusive)
- ✅ Updates in real-time
- ✅ Colors appropriate for urgency level
- ✅ Calls to action work
- ✅ User can understand remaining scans at a glance

---

### 4. Integration Testing (30 minutes)

#### Complete User Journey

**New User Flow:**
1. [ ] Open app for first time
2. [ ] See scan counter: "10 free scans remaining"
3. [ ] Switch to shelf mode
4. [ ] Scan shelf with 5 books
5. [ ] Select 3 books, save
6. [ ] Counter updates: "7 free scans remaining"
7. [ ] Perform 4 more scans (single or shelf)
8. [ ] Counter turns orange at scan #7
9. [ ] Continue scanning to #10
10. [ ] Counter turns red at scan #9
11. [ ] Attempt 11th scan
12. [ ] Paywall modal appears
13. [ ] Click "Start Pro Subscription"
14. [ ] Redirected to subscription page

**Edge Cases:**
- [ ] Scan limit reached during shelf scan (saving multiple books)
  - **Expected:** Saves books until limit, then shows modal
- [ ] User closes modal without upgrading
  - **Expected:** Modal appears on next scan attempt
- [ ] User navigates away and back
  - **Expected:** Scan counter persists, limits enforced
- [ ] Multiple books saved in one shelf scan
  - **Expected:** Each book counts as 1 scan

---

### 5. Mobile Testing (15 minutes)

#### Responsive Design Check

**iPhone/Android:**
- [ ] Scan counter banner displays correctly
- [ ] Mode toggle buttons visible and clickable
- [ ] Shelf results scroll properly
- [ ] Modal fits on screen
- [ ] Buttons are tap-friendly (not too small)
- [ ] Text is readable
- [ ] No horizontal scrolling

**Camera Access:**
- [ ] Can access camera from mobile
- [ ] Can take photos
- [ ] Photos upload successfully
- [ ] Processing works on mobile data

---

### 6. Performance Testing (10 minutes)

#### Speed & Efficiency

**Shelf Scanning:**
- [ ] Processing time < 5 seconds (good connection)
- [ ] Processing time < 10 seconds (slow connection)
- [ ] No browser freezing during processing
- [ ] Image upload completes quickly

**Page Load:**
- [ ] /scan page loads < 2 seconds
- [ ] No layout shift
- [ ] All components render correctly

**API Calls:**
- [ ] Scan limits fetch quickly (<500ms)
- [ ] No unnecessary API calls
- [ ] Proper error handling on failure

---

### 7. Error Handling (15 minutes)

#### Test Error Scenarios

**Network Errors:**
- [ ] Disconnect internet
- [ ] Attempt shelf scan
- [ ] **Expected:** Error message, no crash
- [ ] Reconnect internet
- [ ] **Expected:** Can retry

**API Errors:**
- [ ] Invalid image data
- [ ] **Expected:** Graceful error message
- [ ] Timeout (slow response)
- [ ] **Expected:** Shows loading, then error or success

**User Errors:**
- [ ] No books in photo
- [ ] **Expected:** "No books detected" message
- [ ] Select 0 books, click save
- [ ] **Expected:** "Please select at least one book"

---

## Post-Test Review (30 minutes)

### Checklist

- [ ] Document all bugs found
- [ ] Rate severity (critical/major/minor)
- [ ] Note user experience issues
- [ ] Identify improvements needed
- [ ] Test on different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (if Mac)
- [ ] Test on different devices:
  - [ ] Desktop
  - [ ] Tablet
  - [ ] Mobile

### Bug Report Template

```markdown
**Bug:** [Short description]
**Severity:** Critical | Major | Minor
**Steps to Reproduce:**
1.
2.
3.

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [If applicable]
**Browser:** [Chrome 120, etc]
**Device:** [Desktop/Mobile]
```

---

## Success Metrics

### Must Pass (Launch Blockers)

- ✅ Shelf scanning detects at least 50% of books
- ✅ Trial paywall appears at correct limit
- ✅ Cannot bypass trial limit
- ✅ Scan counter updates accurately
- ✅ No crashes or critical errors
- ✅ Mobile responsive design works

### Should Pass (High Priority)

- ✅ Shelf scanning detects 70%+ of books
- ✅ Processing time < 5 seconds
- ✅ All UI text correct and clear
- ✅ Buttons and links work properly
- ✅ Toast notifications appear

### Nice to Have (Polish)

- ✅ Shelf scanning detects 80%+ of books
- ✅ Smooth animations
- ✅ Perfect mobile experience
- ✅ No console warnings

---

## Recommended Test Photos

### Good Test Cases

1. **3 books, clear spines, good light** (Easy)
   - Expected: 3/3 detected, high confidence

2. **5 books, mixed sizes** (Medium)
   - Expected: 4-5/5 detected, high-medium confidence

3. **5 books, poor lighting** (Hard)
   - Expected: 2-4/5 detected, medium-low confidence

4. **10 books, full shelf** (Stress test)
   - Expected: 6-8/10 detected, various confidence

5. **Books at angle** (Real-world)
   - Expected: Still works, maybe lower confidence

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check TypeScript errors
npx tsc --noEmit

# View logs
# (Check browser console for frontend logs)
# (Check terminal for backend logs)

# Clear trial data (for retesting)
# (Clear browser cookies/local storage)
# Or use incognito mode
```

---

## Notes for Tomorrow

### What to Bring
- Phone with good camera
- 5-10 physical books
- Notepad for bugs/feedback
- Stable internet connection

### What to Focus On
1. **Shelf scanning accuracy** - This is the killer feature
2. **Trial paywall conversion** - Does it feel right?
3. **User experience** - Is it intuitive?

### Questions to Answer
- Does shelf scanning work well enough to launch?
- Is the paywall too aggressive or too subtle?
- Do users understand the scan counter?
- What improvements are needed before launch?

---

## Emergency Fixes

If you find critical issues:

1. **Shelf scanning doesn't work**
   - Check: OPENAI_API_KEY configured?
   - Check: `/api/ai/analyze-shelf` endpoint responding?
   - Fallback: Launch without shelf scanning (delay feature)

2. **Trial limit not enforced**
   - Check: `/api/user/scan-limits` endpoint
   - Check: Backend trial service
   - Critical: Fix before launch

3. **Paywall modal broken**
   - Check: Modal renders?
   - Check: Redirect to /subscription works?
   - Important: Fix before launch

---

**Good luck with testing! 🚀**

Remember: It's better to find issues now than after launch.
Be thorough, take notes, and don't rush.

**Ready to ship?** ✅
