# MynnGift Income Tracking Bug - FIXED

## Problem Identified

**Symptom**: MynnGift donations/spending were being displayed in the Income History as if they were actual income (appearing as "referral income").

**Root Cause**: 
1. In `MynnCrypt.sol` (line 339), when a user participates in MynnGift, the contract records:
   ```solidity
   incomeInfo[_id].push(Income(_id, _level, mynnGiftAmount, block.timestamp));
   ```
   - `_id` = the user (sender ID)
   - `_level` = the user's upgrade level (2-12)
   - `mynnGiftAmount` = the donation amount
   - This mixes spending with actual income!

2. In Dashboard.jsx, these entries were being processed incorrectly:
   - Layers 2-9 (upgrade levels) were falling through to the fallback case
   - Fallback was returning `IncomeType.REFERRAL`
   - **Result**: MynnGift spending appeared as Referral Income in Dashboard

## Example of the Bug

User donates 0.0081 opBNB to MynnGift Stream A:
- ❌ **WRONG**: Shows in Income History as "Referral Income: +0.0081 opBNB"
- ✅ **CORRECT**: Should NOT appear in Income History (it's a donation/expense)

## Solution Implemented

### Frontend Fix (Dashboard.jsx)

**1. Filter MynnGift entries during processing** (Lines 1074-1095)
```javascript
// FILTER: Exclude MynnGift donations
// MynnGift donations are recorded with layer = user's upgrade level (2-9)
// and senderId === receiverId (self-referential)
if (layer >= 2 && layer <= 9 && senderId === receiverId) {
  console.log('Filtering out MynnGift donation entry:', income);
  return null; // Skip MynnGift entries from income history
}
```

**How it works**:
- MynnGift entries have: `layer` = 2-9 AND `senderId` === `receiverId` (self)
- Regular income has: `senderId` ≠ `receiverId` (from different person) OR `layer` = 0, 1, or 10+
- This filter cleanly separates the two

**2. Remove NOBLEGIFT from allowed income types** (Lines 2164-2172)
```javascript
const allowedIncomeTypes = useMemo(() => [
  IncomeType.REFERRAL,
  IncomeType.UPLINE,
  IncomeType.SPONSOR,
  IncomeType.ROYALTY
  // NOTE: IncomeType.NOBLEGIFT (6) is excluded because MynnGift donations 
  // are spending/expenses, not actual income.
], []);
```

## Impact

### What Changes
✅ Income History now only shows actual income:
- Referral income (Layer 0)
- Sponsor income (Layer 1)
- Upline income (Layer 10+)
- Royalty income

### What No Longer Appears
❌ MynnGift donations no longer show in Income History:
- Stream A donations (Level 4)
- Stream B donations (Level 8)
- These are expenses, not income

### User Dashboard Impact
- **Income History**: Cleaner, only shows real income
- **Total Income**: More accurate (doesn't include MynnGift spending)
- **MynnGift Tab**: Still shows MynnGift performance separately

## Technical Details

| Property | MynnGift Entry | Referral Income | Upline Income |
|----------|----------------|-----------------|---------------|
| `layer` | 2-9 (upgrade level) | 0 | 10+ |
| `senderId` | Same as receiverId | Different user | Different user |
| `incomeType` | ~~REFERRAL~~ (filtered) | REFERRAL | UPLINE |
| **Appears in Income History?** | ❌ **NO (filtered)** | ✅ YES | ✅ YES |

## Files Modified

- [frontend/src/components/Dashboard.jsx](frontend/src/components/Dashboard.jsx#L1074-L1095)
  - Added filter to exclude MynnGift entries
  - Removed NOBLEGIFT from allowed income types

## Testing Checklist

After deployment, verify:

- [ ] Login to Dashboard
- [ ] Check Income History tab
- [ ] Verify MynnGift donations do NOT appear in income list
- [ ] Verify Referral/Upline/Sponsor/Royalty income STILL appears correctly
- [ ] MynnGift spending is tracked separately in MynnGift tab
- [ ] Income History filtering (All/Referral/Upline/Sponsor/Royalty) works correctly
- [ ] No "MynnGift" option appears in Income History filter dropdown

## Deployment

**Git Commit**: `ba61180`  
**Status**: ✅ Pushed to GitHub, Vercel auto-rebuilding  
**Live URL**: https://project-mc-tan.vercel.app/  

Expected rebuild time: 1-2 minutes

## Note on Smart Contract

The root cause is in `MynnCrypt.sol` line 339 recording MynnGift donations in `incomeInfo` array. A permanent fix would require:

1. Creating a separate `mynngiftExpenses` or `mynngiftHistory` mapping in the contract
2. Recording MynnGift donations there instead of in `incomeInfo`
3. Updating the UI to read from both sources

However, the current frontend filter is a clean workaround that solves the problem without requiring a contract redeploy.

---

**Reported by**: User feedback on Dashboard income tracking  
**Fixed**: 30 December 2025  
**Verified**: Pending deployment verification
