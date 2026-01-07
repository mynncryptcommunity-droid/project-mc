# 🔍 Investigation: Double Royalty Entries

## 📊 Observed Data

Income History menampilkan 2 royalty entries:

```
Entry 1 (Top - Recent Claim):
├─ Time: 07/01/2026 16:32:39 ← Recent
├─ Type: Royalty
├─ Amount: 0.0001 opBNB
├─ From: A8889N...89NR
└─ Status: Sukses

Entry 2 (Bottom - Older):
├─ Time: 05/01/2026 23:55:46 ← 2 days earlier
├─ Type: Royalty
├─ Amount: 0.0081 opBNB ← Much larger!
├─ From: A8889N...89NR
└─ Status: Sukses
```

---

## 🤔 Analysis

### Observation 1: Amount Difference
- Entry 1: 0.0001 opBNB (recent claim)
- Entry 2: 0.0081 opBNB (81x larger!)

Amount 0.0081 looks like it could be:
- Previous total income accumulated?
- Total royalty accumulated?
- A bug in recording?

### Observation 2: Layer Mapping
Both showing as "Royalty" type, which means:
- Both have `layer = 4` in incomeInfo
- Or there's a display issue showing different layer values as same type

---

## 🔎 Smart Contract Analysis

### When Royalty is DISTRIBUTED (does NOT record to incomeInfo):
```solidity
function _distributeShareToUser(string memory _userId, uint _share) private {
    royaltyIncome[_userId] += actualShare;
    userInfo[_userId].royaltyIncome += actualShare;
    emit RoyaltyReward(_userId, actualShare);
    // ✅ NO incomeInfo.push() here!
}
```

### When Royalty is CLAIMED (records to incomeInfo):
```solidity
function claimRoyalty() external nonReentrant {
    uint amount = royaltyIncome[_userId];
    royaltyIncome[_userId] = 0;
    userInfo[_userId].royaltyIncome = 0;
    
    // ✅ Only ONE push per claim:
    incomeInfo[_userId].push(Income(userId, 4, amount, block.timestamp));
}
```

### Conclusion:
Smart contract should only create ONE type 4 entry per claim!

---

## 🐛 Possible Issues

### Issue #1: Entry 2 (0.0081) is NOT Actually Layer 4

**Theory:** The 0.0081 entry might have a different layer value that's being misinterpreted as type 4.

**Evidence Needed:**
- Check raw `incomeInfo` from contract
- Verify layer value for 0.0081 entry
- Compare with layer value for 0.0001 entry

**Check Command:**
```javascript
// In browser console, after loading dashboard:
console.log('Raw incomeHistoryRaw:', incomeHistoryRaw);
// Look for entries with amount ~0.0081 and ~0.0001
// Check their layer values
```

### Issue #2: Previous Claim from 2 Days Ago

**Theory:** Entry 2 (0.0081) is from a PREVIOUS claim that happened 2 days ago:
- 05/01/2026 23:55:46 ← 2 days earlier
- 07/01/2026 16:32:39 ← Today

This would mean:
- User claimed 0.0081 royalty on Jan 5
- User claimed 0.0001 royalty today (Jan 7)
- Both legitimately recorded in incomeInfo

**Evidence:** Check if user actually made 2 claims

---

### Issue #3: Double Recording in claimRoyalty

**Theory:** claimRoyalty is being called twice or pushing twice.

**Evidence Needed:**
- Check transaction history on-chain
- See if 2 claimRoyalty transactions exist

**Smart Contract Code Review:**
Current code looks correct:
- Only one `.push()` per execution
- Function is `nonReentrant` (prevents double-call)

---

## 🎯 What We Need to Check

### 1. Raw Contract Data
```javascript
// Get the actual layer values from smart contract
const incomeHistoryRaw = await readContract({
  functionName: 'getIncome',
  args: [userId]
});

console.log('All income entries:', incomeHistoryRaw);
// Look for ALL entries with amount >= 0.0001
// Check their layer values (should be 4 for royalty claims)
```

### 2. Entry Details
For the 0.0081 entry:
```javascript
// If entry is: {id: "...", layer: ?, amount: "8100000000000000", time: ...}
// What is the layer value?
// If layer !== 4: It's NOT a royalty claim!
// If layer === 4: It IS a previous royalty claim
```

### 3. Transaction Count
Check: Has user claimed royalty more than once?
- Jan 5: Claimed ~0.0081
- Jan 7: Claimed ~0.0001
- Total: 2 claims (both valid!)

---

## 📋 Hypotheses Ranked by Likelihood

### Hypothesis A: MOST LIKELY (70%)
**Entry 2 is a legitimate previous claim**
- User claimed 0.0081 royalty on Jan 5
- User claimed 0.0001 royalty on Jan 7
- Both correctly recorded with layer: 4
- This is NORMAL behavior, not a bug

**Evidence:** Different timestamps (2 days apart) + reasonable claim history

---

### Hypothesis B: Display Bug (20%)
**Entry 2 has different layer but displays as "Royalty"**
- Entry 2 might be layer 1 (Sponsor) or other type
- Frontend incorrectly mapping it to "Royalty"
- Needs to check raw layer value

**Evidence:** No evidence yet, needs verification

---

### Hypothesis C: Smart Contract Bug (5%)
**claimRoyalty pushes both old total AND claimed amount**
- Unlikely because code clearly shows only 1 push
- Would need to have been a recent SC deploy
- Can be ruled out by checking transaction count

**Evidence:** None found in code review

---

### Hypothesis D: Test Data Artifact (5%)
**Historical test data from development**
- Old test transactions still in contract state
- Not relevant to real production data

**Evidence:** None, low probability

---

## ✅ Next Steps

1. **Check raw console data** after loading dashboard
   ```
   Look for: 📊 Income History Raw Data: [...]
   ```

2. **Identify the 0.0081 entry's layer value**
   ```
   If layer: 4 → Previous legitimate claim
   If layer: 0, 1, 2, 3, etc → Different transaction type
   ```

3. **Verify transaction history**
   - How many claimRoyalty transactions?
   - On what dates?
   - What amounts?

4. **Check user's royalty lifecycle**
   ```
   Jan 5:
   - Royalty accumulated
   - User claims 0.0081
   - incomeInfo[user].push(Income(..., 4, 0.0081, ...))
   
   Jan 7:
   - More royalty accumulated
   - User claims 0.0001
   - incomeInfo[user].push(Income(..., 4, 0.0001, ...))
   ```

---

## 🎓 Conclusion

**Most likely:** This is NOT a bug, but legitimate historical claims!

- Entry 1 (0.0001): Today's claim
- Entry 2 (0.0081): Previous claim from 2 days ago
- Both should show in history (as they are legitimate transactions)

**If this is correct:** System is working as designed! ✅

