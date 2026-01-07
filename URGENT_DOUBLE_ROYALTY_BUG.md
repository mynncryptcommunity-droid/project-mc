# 🚨 URGENT: Double Royalty Claim Issue (User Claims ONLY ONCE)

## 🔴 Critical Finding

User says: **"Saya hanya klaim royalty SEKALI"**

But Income History shows:
```
Entry 1: 0.0001 opBNB (recent claim) ← Legit
Entry 2: 0.0081 opBNB (older)       ← MYSTERY!
```

**This is a bug! Not legitimate multiple claims!**

---

## 🔎 Investigation

### What We Know

**Smart Contract (mynnCrypt.sol):**
- Only ONE place pushes layer 4: Line 495 in `claimRoyalty()`
- Function is `nonReentrant` (prevents reentrancy)
- Only 1 push per execution: `incomeInfo[userId].push(Income(userId, 4, amount, block.timestamp))`

**Only 1 way to record Type 4:** Via claimRoyalty() function

### Analysis

If user claimed royalty only ONCE, but 2 entries appear:

**Either:**
1. **Entry 0.0081 is NOT actually layer 4** (different type, wrong display)
2. **Smart contract pushed twice** (very unlikely, nonReentrant guards against this)
3. **There's another function pushing layer 4** (not found in code)

---

## 🎯 Hypothesis: Amount 0.0081 is Something Else!

### Theory: 0.0081 = MynnGift Income (Not Royalty!)

Looking at the amounts:
- 0.0081 = Looks like rank 1 donation (0.0081 opBNB)
- 0.0001 = Looks like a small royalty claim

**Possibility:** 0.0081 entry has:
- `layer: 2` (MynnGift level 1, which is user's start level)
- But frontend mapping it incorrectly as ROYALTY

**Reason:** Frontend might be interpreting layer value wrong!

### Check: Income(userId, 2, 0.0081, timestamp)

Income struct:
```solidity
struct Income {
    string id;       // "A8889N...89NR"
    uint layer;      // Could be 2 (not 4!)
    uint amount;     // 8100000000000000 = 0.0081
    uint time;       // timestamp
}
```

If 0.0081 has `layer: 2`, and frontend is checking:
```javascript
const layer = Number(income.layer);
if (layer === 4) return ROYALTY; // Would return REFERRAL if layer=2
```

But if there's a BUG in layer extraction, it might show wrong!

---

## ⚠️ Critical: Check Layer Values

**In browser console, look for:**

```
📝 Processing income entry X:
   Raw values: layer=2, amount=8100000000000000  ← If layer is 2!
   
📝 Processing income entry Y:
   Raw values: layer=4, amount=100000000000000   ← Should be 4
```

**If 0.0081 has `layer: 2`:**
```javascript
if (lyr === 2) return IncomeType.REFERRAL; // NOT ROYALTY!
```

But it's displaying as "Royalty" → **DISPLAY BUG!**

---

## 🧪 Possible Causes

### Cause #1: Frontend Layer Mapping Bug
```javascript
// Current code at line ~1155
const incomeType = ((lyr) => {
    if (lyr === 0) return IncomeType.REFERRAL;
    if (lyr === 1) return IncomeType.SPONSOR;
    if (lyr === 4) return IncomeType.ROYALTY;
    if (lyr >= 10) return IncomeType.UPLINE;
    return IncomeType.REFERRAL;  // Fallback
})(layer);
```

If layer is 2 or 3 (MynnGift): Falls back to REFERRAL
But showing as ROYALTY somewhere?

### Cause #2: Amount Display Confusion
- 0.0081 is exactly the base rank donation amount
- 0.0001 is royalty claim
- User confused which is which?

### Cause #3: Data Structure Mismatch
- Income struct field order different than expected?
- Frontend reading wrong field as layer?

---

## ✅ What You Need to Check

### Step 1: Open Browser Console
```
F12 → Console tab
```

### Step 2: Look for These Logs

**For the 0.0081 entry:**
```
📝 Processing income entry N:
   Raw values: layer=?, amount=8100000000000000
   Parsed: Layer: ?, SenderId: A8889N, ReceiverId: A8889N
   💰 Amount 0.0081 opBNB, Layer ?, Type: ?
```

**KEY QUESTION: What is the layer value?**
- If `layer=4` → It IS a royalty claim (unexplained!)
- If `layer=2` → It's MynnGift level 1 (wrong display!)
- If `layer=1` → It's Sponsor income (wrong display!)
- If other → Check what income type it is

### Step 3: Report Back
Tell me the layer value for 0.0081 entry:
```
"layer=?" 
```

This will solve the mystery!

---

## 🔍 Data to Share

Please share from console:

1. **For 0.0081 opBNB entry:**
   - Exact layer value
   - Full entry object
   - Timestamp

2. **For 0.0001 opBNB entry:**
   - Exact layer value (should be 4)
   - Full entry object
   - Timestamp

3. **Any error messages** in console

---

## 🎯 Suspected Bug

**Most Likely:** Frontend incorrectly displaying layer 2-3 (MynnGift) as "Royalty"

**Evidence:** 
- 0.0081 = Base rank donation
- User's rank shows "Rank 1"
- Could be initial rank donation being mis-displayed

**If True:** Need to fix the filtering/display logic to NOT show MynnGift donations as Royalty

---

## 📋 Next Action

1. Open console (F12)
2. Reload page
3. **Copy the console logs for entries with 0.0081 and 0.0001**
4. **Share the layer values**

This will tell us exactly what's wrong!

