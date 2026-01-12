# Test Documentation: MynnCrypt + MynnGift Rank 1-8 Integration Test 📋

## Overview
Comprehensive integration test for **MynnCrypt** and **MynnGift** contracts that simulates complete rank progression from **Rank 1 to Rank 8** for both **Stream A** and **Stream B**.

---

## Test File Location
```
/smart_contracts/test/MynnCryptMynnGiftIntegrationTest.js
```

---

## Test Architecture

### Contract Integration Flow

```
MynnCrypt (Level Upgrade)
    ↓
    ├─ Level 4: Sends 30% to MynnGift (Stream A Entry)
    └─ Level 8: Sends 30% to MynnGift (Stream B Entry)
    
MynnGift (Donation & Distribution)
    ├─ Stream A: Rank 1-8
    └─ Stream B: Rank 1-8
```

### Test Setup
- **MynnCrypt Contract**: Deployed with default referral ID and platform wallet
- **MynnGift Contract**: Deployed and connected to MynnCrypt
- **Users**: 48 test accounts (6 per rank × 8 ranks × 2 streams)

---

## Test Cases

### Test 1: Stream A Rank 1-8 Complete Progression
**Purpose**: Verify Stream A rank progression and income per rank

**Flow**:
1. For each rank (1-8):
   - 6 donors contribute `rankValues_A[rank]` amount
   - Rank completes automatically when 6th donor enters
   - Distribution happens:
     - 50% → Receiver
     - 45% → Promotion Pool
     - 4.5% → Platform Fee
     - 0.5% → Gas Subsidy Pool

2. Track each rank's:
   - Total funds accumulated
   - Receiver payout
   - Promotion pool amount
   - Platform fee

3. Output detailed table with all values

4. Verify calculations match expected values

**Expected Output**:
```
RANK   ENTRY(opBNB)  TOTAL FUNDS   RECEIVER(50%)  PROMOTION(45%)  PLATFORM FEE
────────────────────────────────────────────────────────────────────────────
1      0.0081        0.0486        0.0243         0.021870        0.002187
2      0.02187       0.13122       0.06561        0.059049        0.0065610
...
8      8.472886094   50.84...      25.42...       22.87...        2.268...
```

### Test 2: Stream B Rank 1-8 Complete Progression
**Purpose**: Verify Stream B rank progression and income per rank

**Flow**: 
- Same as Stream A but with `rankValues_B` (11.555x larger amounts)
- Uses different set of users (users 24-47)

**Expected Characteristics**:
- All values 11.555x larger than Stream A
- Same percentage distributions (50%, 45%, 5%)
- Should maintain income ratio consistency

### Test 3: Combined Comparison & Bug Detection
**Purpose**: Detect any inconsistencies between streams and identify bugs

**Verification Steps**:
1. Process all Stream A ranks (1-8)
2. Process all Stream B ranks (1-8)
3. Compare per-rank values
4. Verify multiplier is consistent (11.555x)
5. Check platform income ratio
6. Identify any anomalies

**Bug Detection Criteria**:
- ❌ Income distribution doesn't match expected percentages
- ❌ Platform fees are inconsistent across ranks
- ❌ Stream B ratio deviates from 11.555x
- ❌ Receiver payouts incorrect
- ❌ Promotion pool insufficient for next rank

---

## Expected Rank Values

### Stream A (rankValues_A)
```javascript
Rank 1: 0.0081 opBNB
Rank 2: 0.02187 opBNB
Rank 3: 0.059049 opBNB
Rank 4: 0.1594323 opBNB
Rank 5: 0.43046721 opBNB
Rank 6: 1.162261467 opBNB
Rank 7: 3.138105961 opBNB
Rank 8: 8.472886094 opBNB
```

**Pattern**: Each rank = Previous rank × 2.7 (approximately)

### Stream B (rankValues_B)
```javascript
Rank 1: 0.0936 opBNB
Rank 2: 0.252288 opBNB
Rank 3: 0.680778 opBNB
Rank 4: 1.838305 opBNB
Rank 5: 4.968531 opBNB
Rank 6: 13.414217 opBNB
Rank 7: 36.260287 opBNB
Rank 8: 98.102221 opBNB
```

**Pattern**: Stream A × 11.555 (exact scaling)

---

## Income Distribution Model

For each completed rank (6 donors):

```
Total Funds = 6 × rankValue

Distribution:
├─ Receiver Share:    50% → User waiting queue (FIFO)
├─ Promotion Share:   45% → Promotion pool (for auto-promote)
├─ Fee:               5%
│  ├─ Gas Subsidy:    10% of fee = 0.5% total
│  └─ Platform Fee:   90% of fee = 4.5% total
```

### Example (Stream A Rank 1):
```
Total: 0.0486 opBNB (6 × 0.0081)
├─ Receiver (50%):      0.0243 opBNB
├─ Promotion (45%):     0.021870 opBNB
├─ Platform Fee (4.5%):  0.002187 opBNB
└─ Gas Subsidy (0.5%):   0.000243 opBNB
```

---

## Running the Tests

### Run All Tests
```bash
cd /Users/macbook/projects/project\ MC/MC/smart_contracts
npx hardhat test test/MynnCryptMynnGiftIntegrationTest.js
```

### Run Specific Test
```bash
# Stream A only
npx hardhat test test/MynnCryptMynnGiftIntegrationTest.js --grep "Stream A"

# Stream B only
npx hardhat test test/MynnCryptMynnGiftIntegrationTest.js --grep "Stream B"

# Combined comparison
npx hardhat test test/MynnCryptMynnGiftIntegrationTest.js --grep "Combined"
```

### Run with Custom Timeout
```bash
npx hardhat test test/MynnCryptMynnGiftIntegrationTest.js --timeout 600000
```

---

## Expected Output Format

Each test generates:

1. **Header**: Shows test name and stream (A or B)

2. **Per-Rank Output**:
   ```
   ┌─────────────────────────────────────────┐
   │ 🏆 RANK X - Entry Amount: Y opBNB       │
   └─────────────────────────────────────────┘
   
   ✓ Donor 1: Contributed Y opBNB
   ✓ Donor 2: Contributed Y opBNB
   ...
   ✓ Donor 6: Contributed Y opBNB
   
   💰 Distribution Analysis:
      Total Funds:        Z opBNB
      Receiver (50%):     A opBNB ⭐
      Promotion Pool:     B opBNB
      Platform Fee:       C opBNB
      Gas Subsidy:        D opBNB
   ```

3. **Income Table**: Detailed breakdown of all ranks
   ```
   | Rank | Entry | Total Funds | Receiver | Promotion | Platform Fee |
   |------|-------|------------|----------|-----------|--------------|
   | 1    | ...   | ...        | ...      | ...       | ...          |
   | ...  | ...   | ...        | ...      | ...       | ...          |
   ```

4. **Summary**: Final verification and comparison

---

## Troubleshooting

### Test Timeout
- Increase timeout: Add `this.timeout(600000)` to test
- Check if hardhat node is running: `npx hardhat node`

### Contract Deployment Issues
- Verify MynnCrypt has MynnGift address set correctly
- Check that contracts are properly compiled

### Income Mismatch
- Compare expected vs actual platform income
- Check if distributions follow 50%-45%-5% model
- Verify Stream B is exactly 11.555x Stream A

### Missing Output
- Check contract emit events
- Verify donors have sufficient balance
- Check gas limits (set to 500000 per transaction)

---

## Key Assertions

Test verifies:
1. ✅ Distribution adds up to total funds
2. ✅ Percentages match expected (50%, 45%, 5%)
3. ✅ Platform fee = 4.5% of total
4. ✅ Gas subsidy = 0.5% of total
5. ✅ Stream B / Stream A ratio = 11.555x
6. ✅ No bugs detected in rank progression

---

## Files Generated

- `test/MynnCryptMynnGiftIntegrationTest.js` - Main test file
- Test output with tables and verification results

---

**Test Created**: January 10, 2026  
**Contracts Tested**: MynnCrypt.sol + MynnGift.sol  
**Coverage**: Rank 1-8 for both Stream A and Stream B
