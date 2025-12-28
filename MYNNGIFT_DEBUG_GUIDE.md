# MynnGift Dashboard - Debug Guide

## What Has Been Fixed

✅ **Added comprehensive debugging to MynnGiftTabs.jsx**:
1. Added error/loading state tracking for all contract reads
2. Added `isReceiver` and `isDonor` status checks
3. Added stream eligibility calculation (Level 4+ for Stream A, Level 8+ for Stream B)
4. Added detailed console.log debug output

## How to Test and Debug

### Step 1: Open Developer Tools
1. Press `F12` or right-click → "Inspect"
2. Go to the "Console" tab
3. Keep the console open while testing

### Step 2: Navigate to MynnGift Dashboard
1. Open http://localhost:5174
2. Make sure you're logged in (wallet connected)
3. Go to **Dashboard**
4. Click on **MynnGift** menu (should be the "noblegift" section)

### Step 3: Check Console Output
Look for the debug log that prints:
```
MynnGiftTabs Debug: {
  userAddress: "0x...",
  isActiveInMynnGift: true/false,
  isReceiver: true/false,
  isDonor: true/false,
  userLevel: <number or 'Loading'>,
  nobleGiftRank: <number or 'Loading'>,
  userTotalIncome: <value or 'Loading'>,
  userTotalDonation: <value or 'Loading'>
}
```

### Step 4: Interpret the Results

#### Scenario A: Data shows zeros
```
nobleGiftRank: 0
userTotalIncome: 0
userTotalDonation: 0
```
**Issue**: User either:
- Just joined MynnGift (no transactions yet), OR
- Not active in MynnGift (isActiveInMynnGift = false)

**Action**: Check if `isActiveInMynnGift` is true. If false, user needs to join first.

#### Scenario B: Data shows loading
```
userLevel: 'Loading'
nobleGiftRank: 'Loading'
```
**Issue**: Contract calls are still in progress

**Action**: Wait a few seconds and check again

#### Scenario C: All data shows correctly
```
userLevel: 4
nobleGiftRank: 2
userTotalIncome: "0.05"
userTotalDonation: "0.03"
isActiveInMynnGift: true
```
**Status**: Data is being fetched correctly
- If Stream A tab doesn't show data: Issue is in rendering
- If tabs don't appear: Issue is in eligibility check

#### Scenario D: Errors in console
Look for red error messages. Common errors:
- `undefined is not a function` - contract function not found
- `Cannot read property 'data'` - data extraction issue
- `Network error` - blockchain RPC issue

## Debug Logging Locations

The following console logs have been added:

1. **MynnGiftTabs.jsx** (line ~59):
   - Logs all fetched data and status flags
   - Shows user level and stream eligibility
   - Shows isReceiver/isDonor status

2. **Contract Reads**:
   - `getUserRank()` - Should return rank 0-8
   - `getUserTotalIncome()` - Should return BigInt in Wei
   - `getUserTotalDonation()` - Should return BigInt in Wei
   - `getUserLevel()` - Should return level 0-12
   - `isReceiver()` - Should return boolean
   - `isDonor()` - Should return boolean

## Expected Behavior

### For Users at Level 4+
- Should see "Stream A (L4)" tab
- Overview tab shows rank, income, donation data
- Combined statistics section displays totals

### For Users at Level 8+
- Should see both "Stream A (L4)" and "Stream B (L8)" tabs
- Both tabs have visualization components

### For Users Below Level 4
- Only "Overview" and "History" tabs visible
- Sees message: "ℹ️ Not Yet Eligible - Reach Level 4 to start your first MynnGift stream (Stream A)!"

## Common Issues and Solutions

### Issue 1: "Not Yet Eligible" but user is Level 4+
**Check**: 
- Is `userLevel` showing correct value in console?
- If showing 0: User level not fetching from MynnCrypt contract
- If correct but tabs don't show: Refresh page

**Solution**:
```javascript
// Add this to console to verify
ethereum.request({method: 'eth_accounts'}).then(acc => console.log('Connected:', acc))
```

### Issue 2: Rank shows 0 but user has participated
**Check**:
- Is `isActiveInMynnGift` true?
- Is `nobleGiftRank` showing 0 in console?

**Solution**: User may not be registered in the stream or contract may need calling `joinStream()`

### Issue 3: Numbers show but UI doesn't display them
**Check**:
- Are values showing in console?
- Is StreamStatusCard component receiving the props?

**Solution**: May be styling issue - check if text color is black on black background

### Issue 4: Tabs don't appear even though user qualifies
**Check**:
- Is `isEligibleForStreamA` true in console?
- Refresh the page

**Solution**: Likely a state update timing issue - refresh should fix it

## Next Steps After Debugging

Once you identify which scenario matches your situation, we can:

1. **If data not fetching**: Check contract ABIs and function names
2. **If data not rendering**: Fix component data binding
3. **If tabs not showing**: Debug eligibility logic
4. **If errors**: Add additional error handling

---

## Quick Checklist

Before reporting data issues, verify:
- [ ] Wallet is connected (check address in console)
- [ ] You're on the correct menu item (MynnGift/noblegift)
- [ ] Developer console is open and showing the debug log
- [ ] Wait 2-3 seconds for all contract calls to complete
- [ ] User level is Level 4 or higher
- [ ] User is active in MynnGift (isActiveInMynnGift = true)

---

**Last Updated**: [Generated with debugging enhancements]
**Status**: Ready for testing
