# 🧪 COMPREHENSIVE TESTING CHECKLIST
## MynnCrypt + MynnGift Smart Contract & UI Integration
**Status:** Ready for Testing Phase 1 (Local Development)
**Date:** December 21, 2025
**Target:** OpBNB Mainnet → OpBNB Testnet → Local Testing

---

## 📋 PHASE 1: SMART CONTRACT FUNCTION TESTING (Local - localhost:8545)

### A. USER REGISTRATION & ID GENERATION
- [ ] **Test: Register with default referrer (A8889NR)**
  - Connect wallet
  - Call register("A8889NR", walletAddress) with 4.4e15 wei (0.0044 ETH)
  - Verify: New user ID generated (format: A####WR or A####NR)
  - Verify: User added to globalUsers array
  - Verify: id mapping updated
  - Expected: User ID contains 5 digits + 2 letters (WR/NR)

- [ ] **Test: Register with custom referrer**
  - Use valid registered user ID as referrer
  - Register new account
  - Verify: referrer field matches input
  - Verify: newId format correct based on referrer's layer

- [ ] **Test: Invalid registration attempts**
  - [ ] Try register same address twice → Should revert "Already Registered"
  - [ ] Try register with invalid referrer → Should revert "Invalid Referrer"
  - [ ] Try register with wrong ETH amount → Should revert "Invalid value"
  - [ ] Try register with address(0) → Should revert "Invalid address"

---

### B. USER DATA STRUCTURE VALIDATION
**Check UserInfo struct fields are correct:**

```
User struct index mapping:
0: totalIncome
1: totalDeposit
2: royaltyIncome
3: referralIncome
4: levelIncome
5: sponsorIncome
6: start (timestamp)
7: level ← CRITICAL: Should be 1 for new users
8: directTeam
9: totalMatrixTeam
10: layer
11: account (wallet address)
12: id (user ID string)
13: referrer (referrer ID string)
14: upline (upline ID string)
15: directTeamMembers (array)
```

- [ ] **Verify new user level = 1**
  - Register new user
  - Query userInfo[userId].level
  - Expected: 1

- [ ] **Verify initial deposit tracked**
  - Register with 4.4e15 wei
  - Query userInfo[userId].totalDeposit
  - Expected: 4.4e15

- [ ] **Verify timestamps recorded**
  - Query userInfo[userId].start
  - Expected: block.timestamp or close to it

- [ ] **Verify direct team counter**
  - Register user A (referrer: A8889NR)
  - Register user B (referrer: A)
  - Register user C (referrer: A)
  - Query userInfo[A].directTeam
  - Expected: 2 (users B and C)

- [ ] **Verify layer assignment**
  - Register user A (referrer: A8889NR, layer 0)
  - Register user B (referrer: A, should be layer 1)
  - Register user C (referrer: B, should be layer 2)
  - Query each user's layer field
  - Expected: A=0, B=1, C=2

---

### C. LEVEL UPGRADE MECHANISM
- [ ] **Test: Upgrade level 1 → 2**
  - Register user with level 1
  - Call upgrade function with payment (7.20e15 wei)
  - Verify: userInfo[userId].level = 2
  - Verify: userInfo[userId].totalDeposit updated
  - Check: Event UserUpgraded emitted

- [ ] **Test: Upgrade multiple levels**
  - User upgrades: 1→2→3→4→5
  - Verify: Each level increment works
  - Verify: Total deposit accumulates correctly

- [ ] **Test: Invalid upgrade (insufficient funds)**
  - Try upgrade with less than required amount
  - Should revert or reject transaction

- [ ] **Test: Level cap (max level 12)**
  - Upgrade user to level 12
  - Try upgrade to level 13
  - Should not allow or cap at 12

---

### D. REFERRAL SYSTEM & INCOME DISTRIBUTION
- [ ] **Test: Referral commission payment**
  - Setup: A8889NR (Level 1) ← Referrer A (Level 2) ← User B
  - User B deposits/upgrades
  - Verify: Referrer A receives commission
  - Check: referralIncome updated
  - Check: Event ReferralDistribution emitted

- [ ] **Test: Multi-level referral chain**
  - Setup chain: A8889NR → A (Ref) → B (Direct) → C (Direct) → D (Direct)
  - User C deposits
  - Verify: Both A and B receive referral income (based on upline logic)

- [ ] **Test: Referral bonus distribution**
  - Multiple users register under same referrer
  - Verify: Each generates commission
  - Verify: Referrer can claim total

---

### E. UPLINE REWARD SYSTEM
- [ ] **Test: Upline receives deposit reward**
  - Setup: A8889NR → User A → User B
  - User B deposits/upgrades
  - Verify: User A (upline) receives uplineIncome
  - Check: Amount matches percentage in contract

- [ ] **Test: Multi-layer upline distribution**
  - User B deposits
  - Verify A receives upline reward
  - Verify uplineIncome tracked for both A and B

- [ ] **Test: Upline percent by layer**
  - Different layers have different percentages (from uplinePercents array)
  - Verify: Distribution matches hardcoded percentages

---

### F. SPONSOR REWARD SYSTEM
- [ ] **Test: Sponsor income accumulation**
  - User A sponsors User B
  - User B deposits/upgrades
  - Verify: User A receives sponsorIncome
  - Check: Amount calculated correctly

- [ ] **Test: Sponsor bonus on level upgrade**
  - User A (sponsor) of User B
  - User B upgrades level
  - Verify: Sponsor receives bonus

---

### G. ROYALTY SYSTEM
- [ ] **Test: Royalty pool accumulation**
  - Register multiple users at different levels
  - Verify: royaltyPool increases
  - Check: Percentage correctly deducted from deposits

- [ ] **Test: Level-based royalty eligibility**
  - Users at level 8-12 eligible for royalty
  - Users below level 8 should not receive royalty
  - Verify: Correct filtering

- [ ] **Test: Royalty distribution**
  - Trigger royalty distribution
  - Verify: Users level 8+ receive royalty
  - Check: Amount distributed correctly
  - Check: Event TotalRoyaltyDistributed emitted

- [ ] **Test: Royalty claim**
  - User claims available royalty
  - Verify: claimableRoyalty decreases
  - Verify: Funds transferred to wallet
  - Check: Event RoyaltyClaimed emitted

---

### H. SHAREFEE & PLATFORM INCOME
- [ ] **Test: Sharefee deduction on register**
  - Register user with deposit
  - Verify: 5% goes to sharefee address
  - Check: platformIncome updated

- [ ] **Test: Sharefee address receives funds**
  - Monitor sharefee wallet balance
  - After multiple registrations, verify balance increased
  - Expected: 5% of total deposits

---

### I. MynnGift INTEGRATION
- [ ] **Test: Transfer to MynnGift contract**
  - Register user
  - Verify: mynnGift receives portion (based on RECEIVER_SHARE = 50%)
  - Check: Event mynnGiftDistribution emitted

- [ ] **Test: MynnGift gift calculation**
  - User deposits at different levels
  - Verify: Correct amount sent to MynnGift
  - Check: getUserTotalDonation returns correct value

---

### J. EDGE CASES & ERROR HANDLING
- [ ] **Test: Re-entrancy protection**
  - Try malicious re-entrant call
  - Should be blocked by nonReentrant modifier

- [ ] **Test: Zero address prevention**
  - Try operations with address(0)
  - All should revert with proper error

- [ ] **Test: String validation**
  - Empty referrer ID → Should revert
  - Invalid referrer → Should revert
  - Very long strings → Should handle gracefully

- [ ] **Test: Integer overflow/underflow**
  - Large deposit amounts
  - Multiple level upgrades
  - Should handle without overflow (Solidity 0.8.26 has SafeMath)

- [ ] **Test: Reentrancy in payment distribution**
  - Multiple users triggering payouts simultaneously
  - Should handle correctly without state corruption

---

## 📋 PHASE 2: UI INTEGRATION TESTING

### A. REGISTRATION FLOW
- [ ] **Test: Connect Wallet**
  - Click "Connect Wallet"
  - Select MetaMask
  - Verify: Connected wallet displayed
  - Verify: Address shows in header

- [ ] **Test: Navigate to Register**
  - Click "Start Now" on Hero or "Register" in menu
  - Verify: Register modal opens
  - Verify: Email field visible
  - Verify: Phone field visible
  - Verify: Referral ID field visible

- [ ] **Test: Register with referral link**
  - Navigate with: `localhost:5173/register?ref=A8889NR`
  - Verify: Referral ID auto-filled
  - Verify: Input disabled (gray background)
  - Verify: Hint text shows "from link"

- [ ] **Test: Register without referral link**
  - Navigate to: `localhost:5173/register`
  - Verify: Referral ID empty
  - Verify: Input enabled
  - Verify: Placeholder shows "Enter referral code"

- [ ] **Test: Manual referral code entry**
  - Referral ID field enabled
  - Type: A8889NR
  - Verify: Field accepts input
  - Verify: Validation works

- [ ] **Test: Register button**
  - Fill all fields correctly
  - Click Register
  - Check: MetaMask popup appears
  - Check: Transaction sent to register()
  - Check: Wait for confirmation

- [ ] **Test: Registration validation**
  - [ ] Empty email → Should show error
  - [ ] Invalid email format → Should show error
  - [ ] Empty phone → Should show error
  - [ ] Empty referral code → Should show error
  - [ ] Invalid referral format → Should show error

- [ ] **Test: Successful registration**
  - Fill all fields
  - Register successful
  - Verify: Modal closes
  - Verify: Redirects to dashboard
  - Verify: UserID displayed

- [ ] **Test: Already registered**
  - Register with same wallet twice
  - Second attempt should show error
  - Expected: "Wallet already registered" or similar

---

### B. HEADER & REDIRECT LOGIC
- [ ] **Test: Unregistered wallet stays on home**
  - Connect NEW unregistered wallet
  - Verify: Can browse homepage
  - Verify: NOT auto-redirected to dashboard
  - Verify: Register button available

- [ ] **Test: Registered wallet can access dashboard**
  - Connect registered wallet
  - Navigate to dashboard
  - Verify: Dashboard loads
  - Verify: User data displayed

- [ ] **Test: Redirect on disconnect**
  - Connected to registered wallet
  - Disconnect wallet
  - Verify: Redirects to home
  - Verify: Dashboard not accessible

- [ ] **Test: Loading state handling**
  - Connect wallet
  - Check userIdLoading state during query
  - Verify: Spinner or loading indicator shown
  - Verify: No premature redirect while loading

- [ ] **Test: Error state handling**
  - Simulate network error
  - Verify: Error message shown (not redirect)
  - Verify: Retry option available

---

### C. DASHBOARD DISPLAY
- [ ] **Test: User info displayed correctly**
  - Dashboard loads for registered user
  - Verify: All user data fields present:
    - [ ] Level (correct value, e.g., 1 for new users)
    - [ ] Total Deposit
    - [ ] Total Income
    - [ ] Direct Team
    - [ ] User ID
    - [ ] Upline/Referrer

- [ ] **Test: Level display (CRITICAL)**
  - New registered user
  - Query dashboard
  - Verify: Level = 1 (NOT 17658!)
  - Verify: All struct fields map correctly

- [ ] **Test: Income breakdown**
  - Verify displayed income:
    - [ ] Referral Income
    - [ ] Level Income
    - [ ] Sponsor Income
    - [ ] Royalty Income
  - Check: Values accurate to contract

- [ ] **Test: Direct team display**
  - User with 2+ referrals
  - Verify: Correct count shown
  - Verify: Team members listed (if applicable)

- [ ] **Test: Matrix team display**
  - User in matrix system
  - Verify: Total matrix team count correct
  - Verify: Visualization shows structure (if applicable)

---

### D. COPY REFERRAL LINK
- [ ] **Test: Copy button functionality**
  - Click "Copy Link" button
  - Verify: No error thrown
  - Verify: Link copied to clipboard
  - Verify: Success message shows

- [ ] **Test: Link format**
  - Copy link
  - Paste and check format
  - Expected: `http://localhost:5173/register?ref=USER_ID`
  - Verify: User ID correct

- [ ] **Test: Copy error handling**
  - Simulate clipboard error
  - Verify: Error message shown
  - Verify: Graceful failure (not crash)

---

### E. SHARE BUTTONS
- [ ] **Test: WhatsApp share**
  - Click WhatsApp button
  - Verify: Opens WhatsApp
  - Verify: Message pre-filled with link
  - Verify: Link format correct

- [ ] **Test: Telegram share**
  - Click Telegram button
  - Verify: Opens Telegram
  - Verify: Link included

- [ ] **Test: Other share methods**
  - Test all available share buttons
  - Verify: Links work correctly
  - Verify: Pre-filled messages appear

---

### F. UPGRADE LEVEL
- [ ] **Test: Upgrade button appears**
  - Level 1 user
  - Verify: "Upgrade" button visible
  - Verify: Shows next level cost

- [ ] **Test: Upgrade action**
  - Click Upgrade button
  - Verify: MetaMask popup
  - Verify: Correct amount shown
  - Execute upgrade

- [ ] **Test: Level updated**
  - After upgrade confirmation
  - Refresh/query dashboard
  - Verify: Level incremented
  - Verify: Total deposit updated

- [ ] **Test: Multiple upgrades**
  - Upgrade: 1→2→3→4
  - Verify: Each upgrade works
  - Verify: Data cumulative

---

### G. WALLET CONNECTION/DISCONNECTION
- [ ] **Test: Connect button**
  - Click "Connect" in header
  - Verify: MetaMask opens
  - Verify: Can select wallet
  - Verify: Connection established

- [ ] **Test: Account switching**
  - Connected to wallet A
  - Switch to wallet B in MetaMask
  - Verify: Dashboard updates for wallet B
  - Verify: Different user data shown

- [ ] **Test: Disconnect button**
  - Click disconnect/logout
  - Verify: Wallet disconnected
  - Verify: Redirects to home
  - Verify: Dashboard not accessible

- [ ] **Test: Network switching**
  - Connected to localhost:8545
  - Try switch to different network
  - Verify: Error or warning shown
  - Verify: Prompt to switch back to correct network

---

## 📋 PHASE 3: END-TO-END USER JOURNEY TESTING

### Complete Registration to Dashboard Flow
- [ ] **Journey: Unregistered user registers and accesses dashboard**
  1. [ ] Land on homepage with new wallet
  2. [ ] Click "Start Now"
  3. [ ] Connect wallet (MetaMask)
  4. [ ] Register modal opens
  5. [ ] Fill email: user@example.com
  6. [ ] Fill phone: +1234567890
  7. [ ] Referral auto-filled: A8889NR (from link)
  8. [ ] Click Register
  9. [ ] MetaMask confirms transaction
  10. [ ] Registration successful message
  11. [ ] Modal closes
  12. [ ] Redirected to dashboard
  13. [ ] Dashboard loads with user data
  14. [ ] All fields display correctly
  15. [ ] Level shows 1
  16. [ ] User ID visible

- [ ] **Journey: Referral and commission**
  1. [ ] Registered User A
  2. [ ] Gets referral link with User A's ID
  3. [ ] User B registers via User A's link
  4. [ ] User A's direct team increases
  5. [ ] User A's referral income updates
  6. [ ] Verify amounts match contract

- [ ] **Journey: Copy and share referral**
  1. [ ] User A in dashboard
  2. [ ] Click "Copy Link"
  3. [ ] Link copied successfully
  4. [ ] Paste in new browser
  5. [ ] Register page opens with ref parameter
  6. [ ] Referral ID auto-filled correctly

---

## 📋 PHASE 4: DATA INTEGRITY VERIFICATION

### Contract-to-UI Data Mapping
- [ ] **Verify all 16 struct fields display correctly**
  - Compare contract data with UI display
  - Verify no BigInt conversion errors
  - Verify proper number formatting

- [ ] **Verify calculation accuracy**
  - Total income = referralIncome + levelIncome + sponsorIncome + royaltyIncome
  - Verify sum is correct

- [ ] **Verify timestamp display**
  - start field shows registration date
  - Format displayed correctly (not raw unix timestamp)

---

## 📋 PHASE 5: PERFORMANCE & STRESS TESTING

- [ ] **Test: Multiple users registering**
  - Register 5+ users in sequence
  - Verify: All transactions process
  - Verify: No state corruption
  - Verify: Dashboard responsive

- [ ] **Test: Large numbers handling**
  - User with very high deposit amount
  - Verify: Display format correct
  - Verify: Calculations accurate
  - Verify: No overflow issues

- [ ] **Test: Network latency**
  - Simulate slow network
  - Verify: Loading indicators work
  - Verify: Timeouts handled
  - Verify: Error messages clear

---

## 📋 PHASE 6: BROWSER COMPATIBILITY

- [ ] **Test on Chrome**
  - All features working
  - MetaMask integration
  - Clipboard functionality

- [ ] **Test on Firefox**
  - All features working
  - MetaMask integration

- [ ] **Test on Safari**
  - All features working
  - Potential clipboard issues?

- [ ] **Test on mobile (if applicable)**
  - Responsive design
  - Wallet connection
  - Registration flow

---

## ✅ SIGN-OFF CHECKLIST

Before moving to TestNet:
- [ ] All Phase 1 tests passed (Smart Contract)
- [ ] All Phase 2 tests passed (UI Integration)
- [ ] All Phase 3 tests passed (User Journey)
- [ ] All Phase 4 tests passed (Data Integrity)
- [ ] All Phase 5 tests passed (Performance)
- [ ] No console errors
- [ ] No transaction failures
- [ ] Gas estimation working correctly
- [ ] Documentation updated with findings

---

## 🚀 NEXT STEPS

1. **Execute Phase 1-2 tests locally**
   - Contract functions verified ✓
   - UI integration confirmed ✓

2. **Document any issues found**
   - Create bug tickets
   - Verify fixes work
   - Re-test fixed items

3. **Deploy to OpBNB Testnet**
   - Update hardhat.config.ts
   - Get testnet BNB from faucet
   - Deploy contracts to testnet
   - Update frontend ABI and addresses

4. **Run same tests on testnet**
   - Verify blockchain behavior
   - Test real gas costs
   - Confirm UI still works

5. **Setup Firebase** (after all contract/UI tests pass)
   - Configure Firestore
   - Create register-user endpoint
   - Integrate email/phone storage
   - Test full flow

---

## 📞 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

**Issue: "Level shows wrong value"**
- Solution: Verify array index mapping (index 7 = level)
- Check: safeConvertToBigInt function called

**Issue: "Cannot convert to BigInt"**
- Solution: Check data type before conversion
- Verify: safeConvertToBigInt validation working

**Issue: "Copy link not working"**
- Solution: Check browser console for errors
- Verify: navigator.clipboard API support
- Check: .then()/.catch() handling

**Issue: "Wallet not connecting"**
- Solution: Verify MetaMask installed
- Check: localhost:8545 network configured
- Verify: Contract addresses correct in .env

**Issue: "Registration fails"**
- Solution: Check wallet has enough ETH
- Verify: Referrer ID is valid
- Check: Correct amount sent (4.4e15 wei)

---

## 📝 NOTES

- **All tests must pass BEFORE Firebase setup**
- **Document findings in test results**
- **Record gas usage for OpBNB testnet planning**
- **Create screenshots of successful tests**
- **Keep detailed logs of any failures**

