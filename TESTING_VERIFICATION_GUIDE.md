# Testing Guide - User ID Parameter Fix Verification

## Current Status

Frontend development server running on: **http://localhost:5174/**

All userId parameter fixes have been applied to Dashboard.jsx.

## What Was Fixed

### Contract Parameter Mismatch Resolved
- **Problem:** Dashboard code was passing wallet `address` to contract functions that expect string `userId`
- **Solution:** Updated all contract calls to use the correct parameter type

### Functions Now Using Correct Parameters

| Function | Required Param | Fixed |
|----------|---|---|
| `userInfo()` | userId (string) | ✅ Line 700-715 |
| `getMatrixUsers()` | userId (string) | ✅ Line 1857 |
| `upgrade()` | userId (string) | ✅ Line 1239 |
| `autoUpgrade()` | userId (string) | ✅ Line 1632 |
| `getDirectTeamUsers()` | userId (string) | ✅ Line 1926 |
| `id()` | address | ✅ Unchanged (correct) |
| `getUserStatus()` | address | ✅ Unchanged (correct) |
| `getUserRank()` | address | ✅ Unchanged (correct) |

## Testing Steps

### Step 1: Verify Dashboard Data Display
1. Open: http://localhost:5174/dashboard
2. Check that the following fields populate with real data:
   - ✅ **ID Pengguna**: Should show "A8888NR" (or your registered ID)
   - ✅ **Alamat Dompet**: Should show connected wallet address
   - ✅ **Level**: Should show 1 or higher (not 0)
   - ✅ **Layer**: Should show actual layer number (not N/A)
   - ✅ **Upline**: Should show upline address/ID (not N/A)
   - ✅ **Referrer**: Should show referrer address/ID (not N/A)
   - ✅ **Direct Team**: Should show count > 0 (not 0 or N/A)

### Step 2: Check Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for successful logs like:
   - "Successfully fetched user info"
   - "Successfully fetched direct team"
   - "Successfully fetched layer members"
4. There should be NO errors about "Cannot convert to BigInt"

### Step 3: Test Team View Section (Tims Saya)
1. Navigate to "Tims Saya" (Team My) section
2. Click on "Tim Langsung" (Direct Team)
3. Verify that team members load and display correctly with their data:
   - Member ID
   - Member Level
   - Member Status
   - Member Address

### Step 4: Test Matrix View Section
1. In "Tims Saya" section, click on "Matriks" (Matrix)
2. Select a layer (Lapisan)
3. Verify members in that layer load and display

### Step 5: Test Level Upgrade
1. In Dashboard, find the upgrade section
2. Try upgrading to next level
3. Should process without "Cannot convert to BigInt" error
4. Level should increase after successful transaction

### Step 6: Check Data Persistence
1. Refresh the page (F5)
2. All data should reload and display correctly
3. No data should be lost

## Expected Console Output

### Good Signs (Success):
```
✅ User registered with ID: A8888NR
Successfully fetched user info
Successfully fetched direct team
Successfully fetched layer members
Data loaded successfully
```

### Bad Signs (Requires Investigation):
```
❌ User tidak terdaftar di kontrak
Cannot convert to BigInt
args.length is 0
TypeError: expected string but got bytes32
userInfo returned all zeros
```

## Quick Test URL

After frontend is running, test directly:
```
http://localhost:5174/dashboard
```

Log in with your wallet, and verify all fields populate with data.

## Common Issues & Solutions

### Issue: Fields still show N/A or 0
- **Check:** Browser console for errors
- **Solution:** May need to refresh contract deployment if it's using wrong network
- **Verify:** In Hardhat, run `npx hardhat run scripts/deploy.ts --network localhost`

### Issue: "Cannot convert to BigInt" error
- **Cause:** Some parameter still using wrong type
- **Check:** Browser console for which function is failing
- **Report:** Note the function name and line number

### Issue: Data loads but then disappears
- **Cause:** Possible race condition in userId fetch
- **Check:** Console logs for userId being empty
- **Fix:** May need to add small delay between userId and userInfo fetch

### Issue: Team/Matrix views don't load
- **Cause:** getMatrixUsers or getDirectTeamUsers using wrong parameter
- **Check:** Console errors when expanding those sections
- **Verify:** Check that both functions use userId parameter

## Performance Monitoring

Open DevTools Network tab and check:
- No failed contract calls
- Contract calls returning data within 1 second
- No duplicate requests for same function

## Database Considerations

All data being read is on-chain and immutable:
- ✅ Changes are permanent once confirmed
- ✅ Multiple page refreshes should return same data
- ✅ User data cannot be altered without transaction

## Next Steps After Verification

Once dashboard data displays correctly:

1. **Test Full Registration Flow** - New user registration
2. **Test Income Display** - Check income calculations are correct
3. **Test Donation Features** - If using NobleGift/donation system
4. **Test Withdrawal** - Income and revenue withdrawal
5. **Performance Testing** - Load testing with multiple users

## Rollback Instructions (If Needed)

If issues arise:

```bash
cd /Users/macbook/projects/project MC/MC/mc_frontend

# Revert to previous working version
git checkout -- src/components/Dashboard.jsx

# Rebuild
npm run build
```

---

**Date Tested:** [Your Date]
**Tester Name:** [Your Name]
**Test Environment:** localhost:5174 with Hardhat node
**Status:** Ready for Testing
