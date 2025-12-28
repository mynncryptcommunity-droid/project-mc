# Testing Guide - User Journey Perbaikan

## 🎯 Testing Objectives

1. ✅ Homepage bisa diakses tanpa wallet
2. ✅ Platform information ditampilkan dengan baik
3. ✅ Register flow bekerja dengan benar
4. ✅ Auto-redirect platform wallet masih bekerja
5. ✅ Responsive design di semua device

---

## 🧪 Test Cases

### **Test 1: Homepage Browse (No Wallet)**

**Prerequisites:**
- MetaMask/wallet NOT connected
- Fresh browser session

**Steps:**
```
1. Open http://localhost:5173/
2. Should see homepage with:
   ✓ Hero section with "Welcome to Mynncrypt"
   ✓ Slideshow images on the right
   ✓ "Join Now" button
   ✓ "Learn More" button
3. Scroll down
4. Should see:
   ✓ Features section with 4 cards
   ✓ How It Works section with 4 steps
   ✓ Benefits section with 3 cards
5. F12 → Console
6. Should see:
   ✓ No errors
   ✓ No "Cannot convert" messages
   ✓ No redirects to /dashboard
```

**Expected Result:** ✅ Homepage fully accessible, all sections visible

---

### **Test 2: Features Section Styling**

**Steps:**
```
1. From homepage, look at Features section
2. Verify:
   ✓ 4 cards visible (MLM System, Team Income, NobleGift, Dashboard)
   ✓ Gold border on cards
   ✓ Icons displayed (💼💰🎁📊)
   ✓ Descriptions readable
3. Hover over a card
4. Verify:
   ✓ Card slides up
   ✓ Shadow effect appears
   ✓ Smooth transition
```

**Expected Result:** ✅ All cards styled correctly, hover works smoothly

---

### **Test 3: How It Works Section**

**Steps:**
```
1. Scroll to "How It Works" section
2. Verify:
   ✓ 4 step cards visible
   ✓ Numbers (1, 2, 3, 4) in circles
   ✓ Step titles clear (Connect Wallet, Register, Build Team, Earn)
   ✓ Descriptions helpful
3. Hover over a card
4. Verify:
   ✓ Card transforms (lift up)
   ✓ Shadow effect
   ✓ Smooth animation
```

**Expected Result:** ✅ Steps clearly displayed, animations smooth

---

### **Test 4: Benefits Section**

**Steps:**
```
1. Scroll to "Why Join Us" section
2. Verify:
   ✓ 3 benefit cards visible
   ✓ Icons displayed (💸🤝⛓️)
   ✓ Benefits clear:
     - Passive Income
     - Community Support
     - Blockchain Security
   ✓ Descriptions helpful
3. Hover effect works
4. Responsive layout
```

**Expected Result:** ✅ All benefits clearly communicated

---

### **Test 5: Join Now Button Flow**

**Prerequisites:**
- MetaMask installed & ready
- Fresh page load

**Steps:**
```
1. Click "Join Now" button
2. Should see:
   ✓ Modal register appears
   ✓ Form fields visible (if not connected)
3. If wallet not connected:
   ✓ MetaMask button appears
   ✓ Click "Connect MetaMask/Trust Wallet"
4. MetaMask popup should appear
5. Select wallet to connect
6. Approve connection
7. After connection:
   ✓ Modal shows registration form
   ✓ Fields: Name, Phone, ID Card, Referral Code
8. Fill form
9. Click "Continue Registration"
10. Approve MetaMask transaction
11. Should redirect to /dashboard
```

**Expected Result:** ✅ Complete register flow works end-to-end

---

### **Test 6: Platform Wallet Auto-Redirect**

**Prerequisites:**
- MetaMask connected with platform wallet (A8888NR)
- or any wallet with ID = A8888NR

**Steps:**
```
1. MetaMask: Select platform wallet
2. Disconnect from current wallet (if any)
3. Go to http://localhost:5173/
4. Page should:
   ✓ Load briefly
   ✓ Auto-redirect to /dashboard
   ✓ NOT show homepage
5. At /dashboard:
   ✓ Should show "ID Pengguna: A8888NR" or similar
   ✓ Should show user data
```

**Expected Result:** ✅ Platform wallet auto-redirects to dashboard

---

### **Test 7: Registered User (Other Wallet)**

**Prerequisites:**
- MetaMask connected with registered wallet (not platform)
- Has valid userId (e.g., "ABC123NR")

**Steps:**
```
1. MetaMask: Select registered wallet
2. Go to http://localhost:5173/
3. Should:
   ✓ Load homepage (NOT redirect)
   ✓ Show "Join Now" button
   ✓ Show wallet address in Header
4. Can scroll & browse
5. Option A: Click "Join Now"
   ✓ Should show "Already registered" or redirect to dashboard
6. Option B: Navigate to /dashboard manually
   ✓ Should go to dashboard (no register needed)
```

**Expected Result:** ✅ Registered users can browse before going to dashboard

---

### **Test 8: Mobile Responsiveness**

**Prerequisites:**
- Chrome DevTools or mobile device
- Viewport width < 768px

**Steps:**
```
1. Open http://localhost:5173/ on mobile
2. Verify hero section:
   ✓ Text readable
   ✓ Buttons clickable
   ✓ Images responsive
3. Scroll down
4. Features section:
   ✓ 1 column layout
   ✓ Cards full width
   ✓ Text readable
5. How It Works:
   ✓ 1 column layout
   ✓ Steps stack vertically
   ✓ Numbers visible
6. Benefits:
   ✓ 1 column layout
   ✓ Cards responsive
7. No horizontal scroll
8. All touch targets clickable
```

**Expected Result:** ✅ Mobile layout works perfectly

---

### **Test 9: Tablet Responsiveness**

**Prerequisites:**
- Chrome DevTools tablet view (768px - 1199px)

**Steps:**
```
1. Open http://localhost:5173/
2. Features section:
   ✓ 2 column layout
   ✓ Cards properly sized
3. How It Works:
   ✓ 2 column layout
4. Benefits:
   ✓ 3 column or 2 column (depending on width)
5. All content readable
6. No layout issues
```

**Expected Result:** ✅ Tablet layout responsive

---

### **Test 10: Desktop Full-Width**

**Prerequisites:**
- Desktop screen (1200px+)

**Steps:**
```
1. Open http://localhost:5173/
2. Hero section:
   ✓ Side-by-side layout (text left, image right)
   ✓ Balanced proportions
3. Features section:
   ✓ 4 column grid
   ✓ All cards fit screen
4. How It Works:
   ✓ 4 column grid
   ✓ Step numbers visible
5. Benefits:
   ✓ 3 column layout
   ✓ Centered and balanced
6. All animations smooth
7. Hover effects work
```

**Expected Result:** ✅ Desktop layout perfect

---

### **Test 11: Browser Console**

**Steps:**
```
1. Open http://localhost:5173/
2. F12 → Console tab
3. Should see:
   ✓ No errors (red text)
   ✓ No warnings (yellow text)
   ✓ Can see debug logs from Header.jsx
   ✓ Can see logs from Hero.jsx
4. No "Cannot convert to BigInt" errors
5. No "undefined is not a function" errors
```

**Expected Result:** ✅ Console clean, no errors

---

### **Test 12: Page Performance**

**Steps:**
```
1. F12 → Network tab
2. Refresh page
3. Check:
   ✓ Page loads in < 3 seconds
   ✓ Hero image loads quickly
   ✓ All assets loaded (green)
   ✓ No failed requests (red)
4. DevTools → Lighthouse
5. Run performance audit
6. Score should be:
   ✓ Performance: > 80
   ✓ Accessibility: > 85
   ✓ Best Practices: > 85
```

**Expected Result:** ✅ Good performance metrics

---

## 🐛 Potential Issues & Fixes

### Issue 1: Features cards not showing
**Check:**
- Browser console for CSS errors
- Network tab for image loading
- Restart dev server: `npm run dev`

### Issue 2: Modal not appearing when clicking "Join Now"
**Check:**
- setShowModal state working
- JavaScript console errors
- Browser localStorage clear

### Issue 3: Animations not smooth
**Check:**
- Browser hardware acceleration enabled
- No CPU throttling in DevTools
- Try different browser

### Issue 4: Mobile layout broken
**Check:**
- Viewport meta tag present
- CSS media queries loading
- Resize browser window slowly to see breakpoints

### Issue 5: Wallet connection fails
**Check:**
- MetaMask installed
- Right network selected
- MetaMask window in focus

---

## ✅ Sign-Off Checklist

After testing, verify:

- [ ] Homepage accessible without wallet
- [ ] All 3 sections displayed (Features, How It Works, Benefits)
- [ ] Register flow works end-to-end
- [ ] Platform wallet auto-redirects
- [ ] Registered users can browse
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop layout perfect
- [ ] No console errors
- [ ] All buttons clickable
- [ ] All links working
- [ ] Animations smooth
- [ ] Images loading
- [ ] Styling consistent
- [ ] Color scheme correct
- [ ] Text readable on all sizes

---

## 📊 Test Results Template

```markdown
# Test Results - [Date]

## Test Cases Completed
- [ ] Homepage Browse (No Wallet)
- [ ] Features Section Styling
- [ ] How It Works Section
- [ ] Benefits Section
- [ ] Join Now Button Flow
- [ ] Platform Wallet Auto-Redirect
- [ ] Registered User Experience
- [ ] Mobile Responsiveness
- [ ] Tablet Responsiveness
- [ ] Desktop Full-Width
- [ ] Browser Console
- [ ] Page Performance

## Overall Status
- [ ] PASS - All tests passed
- [ ] FAIL - Some tests failed
- [ ] PARTIAL - Some tests passed

## Issues Found
(List any issues discovered)

## Notes
(Any additional observations)

## Tested By: ___________
## Date: ___________
```

---

**Ready to Test!** 🚀

Server running on http://localhost:5173/
All changes implemented and ready for verification.
