# 🧪 ADVANCED TESTING SCENARIOS - PHASE 4
## Commission & Noble Gift Distribution Testing

**Date:** December 21, 2025
**Status:** Planning & Design
**Target:** Comprehensive commission & noble gift verification

---

## 📋 TEST SCENARIO 1: UPLINE COMMISSION TESTING

### Scenario 1A: Upline Level LOWER than Downline
**Setup:** Upline (Level 2) → Downline (Level 5)

```
Owner (A8888NR, Level 1)
    └─ Upline (A8892NR, Level 2)
        └─ Downline (B8893WR, Level 5)
```

**Test Steps:**
1. Register Owner
2. Register Upline under Owner (Level 1)
3. Upgrade Upline to Level 2
4. Register Downline under Upline (Level 1)
5. Upgrade Downline to Level 5
6. Downline deposits/upgrades
7. Check: Does Upline receive commission?

**Expected Results:**
- [ ] Upline receives uplineIncome (even though lower level)
- [ ] Amount calculated correctly
- [ ] Data stored in contract
- [ ] Displayed on UI dashboard

**UI Verification:**
- [ ] Upline Dashboard shows income from downline
- [ ] Income amount correct
- [ ] Income category: "Upline Income"

---

### Scenario 1B: Upline Level HIGHER than Downline
**Setup:** Upline (Level 8) → Downline (Level 3)

```
Owner (A8888NR, Level 1)
    └─ Upline (A8892NR, Level 8)
        └─ Downline (B8893WR, Level 3)
```

**Test Steps:**
1. Register Owner
2. Register Upline under Owner (Level 1)
3. Upgrade Upline to Level 8 (multiple upgrades)
4. Register Downline under Upline (Level 1)
5. Upgrade Downline to Level 3
6. Downline deposits/upgrades
7. Check: Does Upline receive commission?
8. Compare with Scenario 1A

**Expected Results:**
- [ ] Upline receives uplineIncome
- [ ] Amount might be same or different than 1A (verify contract logic)
- [ ] Data stored correctly
- [ ] Displayed on UI

---

### Scenario 1C: No Upline (Default Referral)
**Setup:** User registers directly under Default Referrer (A8888NR)

```
Owner (A8888NR, Level 1)
    └─ User A (A8892NR, Level 5) [No upline, direct under owner]
```

**Test Steps:**
1. Register User A under A8888NR (default referrer)
2. Upgrade User A to Level 5
3. User A deposits/upgrades
4. Check: Does default referral (Owner) receive commission?
5. Verify royaltyPool or platformIncome increases

**Expected Results:**
- [ ] Default referrer (Owner) receives commission
- [ ] Commission stored properly
- [ ] platformIncome or royaltyPool updated
- [ ] Amount correct

**UI Verification:**
- [ ] Owner dashboard shows income from User A
- [ ] Income categorized correctly
- [ ] Amount accurate

---

## 📋 TEST SCENARIO 2: SPONSOR COMMISSION TESTING

### Scenario 2A: Sponsor Level LOWER than Sponsored
**Setup:** Sponsor (Level 2) sponsors User (Level 5)

```
Owner (A8888NR)
    └─ Sponsor (A8892NR, Level 2)
        └─ Referrer (B8893WR)
            └─ Sponsored User (C8894WR, Level 5)
```

**Test Steps:**
1. Register Sponsor under Owner (Level 1)
2. Upgrade Sponsor to Level 2
3. Register Referrer under Sponsor
4. Register Sponsored User under Referrer
5. Upgrade Sponsored User to Level 5
6. Sponsored User deposits/upgrades
7. Check: Does Sponsor receive sponsorIncome?

**Expected Results:**
- [ ] Sponsor receives sponsorIncome
- [ ] Amount calculated based on level bonus
- [ ] Data stored in contract
- [ ] Displayed on UI

---

### Scenario 2B: Sponsor Level HIGHER than Sponsored
**Setup:** Sponsor (Level 9) sponsors User (Level 3)

**Test Steps:**
1. Register Sponsor, upgrade to Level 9
2. Register User under Sponsor hierarchy
3. User upgrades to Level 3
4. User deposits
5. Check: Does Sponsor receive sponsorIncome?

**Expected Results:**
- [ ] Sponsor receives sponsorIncome
- [ ] Amount calculation consistent
- [ ] Compared with Scenario 2A
- [ ] Displayed correctly on UI

---

### Scenario 2C: No Sponsor
**Setup:** User has no sponsor in line

**Test Steps:**
1. Register User directly under default referrer
2. User upgrades to Level 5
3. Check: Who receives sponsor commission?

**Expected Results:**
- [ ] Default referrer receives it, OR
- [ ] platformIncome accumulates it, OR
- [ ] Verify contract logic

---

## 📋 TEST SCENARIO 3: ROYALTY COMMISSION TESTING

### Scenario 3A: Royalty Distribution Mechanics
**Setup:** Multiple users at Level 8+ generate royalty

```
Owner (A8888NR, Level 1)
    ├─ User A (A8892NR, Level 10) ← Eligible for royalty
    ├─ User B (B8893WR, Level 9) ← Eligible for royalty
    ├─ User C (C8894WR, Level 8) ← Eligible for royalty (on threshold)
    └─ User D (D8895WR, Level 7) ← NOT eligible
```

**Test Steps:**
1. Register all 4 users
2. Upgrade A to Level 10, B to Level 9, C to Level 8, D to Level 7
3. All users deposit/upgrade
4. Check royaltyPool accumulation (5% of deposits)
5. Query royaltyIncome for each user
6. Verify data displayed on UI

**Expected Results:**
- [ ] Royalty pool = 5% of total deposits
- [ ] Users A, B, C have claimableRoyalty > 0
- [ ] User D has claimableRoyalty = 0
- [ ] UI shows correct royalty amounts
- [ ] royaltyPercent applied: Level 8→12%, 9→15%, 10→20%, 11→25%, 12→28% (or verify contract)

---

### Scenario 3B: Royalty Distribution Trigger
**Setup:** Royalty distribution at specific time/condition

**Test Steps:**
1. Setup users eligible for royalty (8+)
2. Wait for royalty distribution time or trigger manually
3. Check: Distribution executes correctly
4. Verify: Amount distributed to eligible users
5. Check: royaltyLastDist timestamp updates
6. UI shows newly distributed royalty

**Expected Results:**
- [ ] Distribution triggered correctly
- [ ] All eligible users receive share
- [ ] Total distributed = royaltyPool
- [ ] UI updates with new royalty

---

### Scenario 3C: Royalty Claim
**Setup:** User claims available royalty

**Test Steps:**
1. User has claimableRoyalty > 0
2. User claims royalty
3. Check: Funds transferred to wallet
4. Check: claimableRoyalty reduced
5. Verify UI updates

**Expected Results:**
- [ ] Claim transaction successful
- [ ] Wallet balance increases
- [ ] claimableRoyalty = 0 after claim
- [ ] Event emitted
- [ ] UI shows "Claimed"

---

## 📋 TEST SCENARIO 4: NOBLE GIFT (50 USER) STRESS TEST

### Scenario 4A: 50-User Noble Gift Chain
**Setup:** Register 50 users in sequential structure

```
Level Distribution:
- Level 1: 1 user (owner)
- Level 2-5: Users registering in chain
- ...continuing to 50 total
```

**Test Steps:**
1. Register 50 users sequentially
2. Each user upgrades or maintains level
3. Each user deposits
4. Monitor: Noble Gift queue progression
5. Check: Does first recipient = Platform?
6. Verify: Queue processing order
7. Check: No stuck transactions
8. Monitor: Gas usage per user

**Expected Results:**
- [ ] All 50 users registered successfully
- [ ] First noble gift recipient is platform wallet
- [ ] Queue processes smoothly
- [ ] No reverts or failures
- [ ] Gas usage reasonable (~600k-800k per user)
- [ ] Data integrity maintained

---

### Scenario 4B: Noble Gift Queue Management
**Setup:** Monitor queue as users register

**Test Steps:**
1. Register users 1-10
2. Check queue progression
3. Register users 11-25
4. Check queue state
5. Register users 26-50
6. Monitor final queue
7. Verify: No overlaps or duplicates
8. Verify: Correct ranking/ordering

**Expected Results:**
- [ ] Queue updates correctly
- [ ] No duplicate entries
- [ ] Order maintained (FIFO or priority-based)
- [ ] Rankings consistent
- [ ] All users in correct position

---

### Scenario 4C: Level Migration with Noble Gift
**Setup:** Users upgrade levels while noble gift queued

```
User registers → In Queue → User upgrades Level → Still in queue? → Moves position?
```

**Test Steps:**
1. Register user (joins noble gift queue)
2. User upgrades level
3. Check: Does queue position change?
4. Check: Does noble gift amount update?
5. Check: No transaction failures
6. Verify: All data consistent

**Expected Results:**
- [ ] Level upgrade doesn't break queue
- [ ] Position updated if needed
- [ ] No data corruption
- [ ] Noble gift amount recalculated if applicable
- [ ] UI reflects changes

---

### Scenario 4D: Noble Gift Completion
**Setup:** Track 50 users through complete noble gift cycle

**Test Steps:**
1. All 50 users registered and active
2. Monitor: First user completes noble gift
3. Verify: Recipient receives correct amount
4. Check: Next user moves to queue position 1
5. Repeat for 5-10 users
6. Verify: No gaps or skips
7. Check: Total distributed correct

**Expected Results:**
- [ ] First recipient = platform ✓
- [ ] Each completion moves next user up
- [ ] No gaps in queue
- [ ] Amounts correct (50% receiver, 45% promotion, 5% fee, 10% gas subsidy)
- [ ] All transitions smooth
- [ ] No stuck users

---

## 📋 TEST SCENARIO 5: UI DASHBOARD VERIFICATION

### Verification for All Scenarios

**Dashboard Should Display:**

For Scenario 1 (Upline Commission):
```
User Dashboard:
├─ Upline Income: {amount} ETH
├─ Upline Breakdown by layer:
│  ├─ Layer 1: {amount}
│  ├─ Layer 2: {amount}
│  └─ ...
└─ Total Upline: {amount}
```

For Scenario 2 (Sponsor Commission):
```
User Dashboard:
├─ Sponsor Income: {amount} ETH
├─ Sponsored Users Count: {count}
└─ Sponsor Commission Rate: {percentage}%
```

For Scenario 3 (Royalty):
```
User Dashboard:
├─ Royalty Income: {amount} ETH
├─ Claimable Royalty: {amount} ETH
├─ Royalty Level Bonus: {percentage}%
└─ [Claim Button] if claimable > 0
```

For Scenario 4 (Noble Gift):
```
User Dashboard:
├─ Noble Gift Status: In Queue / Completed
├─ Queue Position: {position}/50
├─ Expected Gift Amount: {amount} ETH
└─ Gift Received: {amount} ETH (if completed)
```

---

## 🎯 TEST EXECUTION PLAN

### Phase 4A: Commission Testing (3-4 hours)
1. [ ] Create test_phase4a_upline_commission.js
2. [ ] Create test_phase4b_sponsor_commission.js
3. [ ] Create test_phase4c_royalty_commission.js
4. [ ] Execute all 3 test suites
5. [ ] Document results

### Phase 4B: Noble Gift Stress Test (2-3 hours)
1. [ ] Create test_phase4d_noble_gift_50users.js
2. [ ] Execute 50-user registration
3. [ ] Monitor queue progression
4. [ ] Test level migrations
5. [ ] Verify completion cycles
6. [ ] Document results

### Phase 4C: UI Verification (1 hour)
1. [ ] Manual browser testing
2. [ ] Verify all commission displays
3. [ ] Verify noble gift queue display
4. [ ] Screenshot confirmation
5. [ ] Document any UI issues

---

## 📊 SUCCESS CRITERIA

### All Scenarios Must Pass:
- [ ] All commission scenarios execute without error
- [ ] UI displays commission data correctly
- [ ] 50-user noble gift queue processes smoothly
- [ ] First gift recipient = platform
- [ ] Level migrations don't cause issues
- [ ] Gas usage within reasonable limits (~700k avg)
- [ ] No data corruption or state inconsistency
- [ ] All calculations accurate
- [ ] Zero security issues

---

## 🎬 NEXT STEPS AFTER ADVANCED TESTING

1. **If all pass:** Proceed to Firebase setup
2. **If issues found:** Debug and fix, re-test
3. **If significant issues:** May need contract updates
4. **Final verification:** Manual UI testing in browser
5. **Sign-off:** Ready for testnet deployment

---

## 📝 TESTING NOTES

- Use fresh test accounts (avoid conflicts with Phase 1-3)
- Monitor gas usage for optimization
- Log all transactions for verification
- Take screenshots of UI for documentation
- Document any edge cases found
- Verify contract emits correct events

---

**Preparation Status:** ✅ Ready to implement test scripts
**Estimated Time:** 6-8 hours total
**Priority:** HIGH (before Firebase setup)

