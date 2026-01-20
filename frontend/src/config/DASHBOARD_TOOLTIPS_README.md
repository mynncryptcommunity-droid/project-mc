# Dashboard Tooltips Implementation Guide

## Overview
Dashboard tooltips provide immediate access to information about smart contract transparency, on-chain verification, and admin limitations. All tooltips are positioned at `z-50` (front layer) for easy discovery.

---

## 📋 Tooltip Categories (9+)

### 1️⃣ GLOBAL TOOLTIP - Dashboard Header
**Icon:** 🛡️ or ❓  
**Location:** Dashboard header/title  
**Content:**
```
This system runs fully on smart contracts.
No admin can change payouts or queue positions.
```
**Link:** Verify how this works → `/how-it-works`

---

### 2️⃣ QUEUE POSITION TOOLTIPS
**Location:** Queue status display (3 variants)

#### Donated Status
**Icon:** ✓ (green)  
**Content:**
```
Funds are sent directly to the smart contract.
No one can redirect or hold them.
```

#### In Queue Status
**Icon:** ⏳ (blue)  
**Content:**
```
Queue order is stored on-chain and visible to everyone.
Positions cannot be edited or skipped.
```

#### Receiver Status
**Icon:** 🎁 (yellow)  
**Content:**
```
Receiver status is triggered automatically by contract logic,
not by admin decision.
```

---

### 3️⃣ STREAM A & STREAM B TOOLTIPS
**Icon:** ⛓️  
**Location:** Stream display section  
**Content:**
```
Streams follow fixed smart contract rules.
Entry does not guarantee rewards or returns.
```
**Link:** See distribution rules → `/faq`

---

### 4️⃣ REFERRAL TOOLTIP
**Icon:** 👥  
**Location:** Referral information section  
**Content:**
```
Referrals track community structure only.
They do not control who gets paid.
```

---

### 5️⃣ TEAM TREE TOOLTIP
**Icon:** 🌳  
**Location:** Team Tree view  
**Content:**
```
This structure is read from blockchain data.
No user or admin can modify the hierarchy.
```

---

### 6️⃣ INCOME HISTORY TOOLTIP
**Icon:** 📊  
**Location:** Income history / transaction list  
**Content:**
```
All income records are derived from on-chain transactions.
You can verify each entry via blockchain explorer.
```
**Link:** View transaction → `https://opbnb.bscscan.com`

---

### 7️⃣ SPONSOR / UPLINE / ROYALTY TOOLTIP
**Icon:** 💰  
**Location:** Income breakdown section  
**Content:**
```
These rewards are calculated automatically by the contract.
No manual approval is involved.
```

---

### 8️⃣ REGISTER / JOIN TOOLTIP ⚠️ CRITICAL
**Icon:** ⚠️  
**Location:** Register/Join buttons or instructions  
**Priority:** High (special styling)  
**Content:**
```
⚠️ This is a smart contract system, not an investment product.
There is no guaranteed profit.

Do your own research before joining.
```
**Link:** Read Anti-Scam FAQ → `/faq`  
**Special:** Show with warning styling (red border/background)

---

### 9️⃣ SHARE / INVITE TOOLTIP
**Icon:** 📢  
**Location:** Share & Invite section  
**Content:**
```
Always encourage others to verify the contract themselves.
Never ask anyone to trust blindly.

✅ Share facts, not promises
```

---

## 🔟 Additional Reinforcement Tooltips

### Smart Contract Address
**Icon:** 🔗  
**Content:**
```
Contract addresses are permanent on-chain records.
You can verify them on blockchain explorer anytime.
```
**Link:** View contract → `https://opbnb.bscscan.com`

### Wallet Verification
**Icon:** 🔐  
**Content:**
```
Your wallet address proves your identity.
Keep your private keys secure and never share them.
```

### On-Chain Data
**Icon:** ⛓️  
**Content:**
```
All data shown here is verified directly from the blockchain.
No server manipulation is possible.
```

### Admin Limitations
**Icon:** 🛡️  
**Content:**
```
❌ Admin cannot:
• Change queue positions
• Redirect funds
• Approve/deny payments
• Modify smart contract (immutable)
```

### No Guarantees
**Icon:** ⚠️  
**Content:**
```
Entry does not guarantee returns.
All outcomes depend on protocol rules and your participation.
```

---

## 📚 Files Created

### 1. `dashboardTooltipsConfig.js`
- **Location:** `/frontend/src/config/dashboardTooltipsConfig.js`
- **Purpose:** Central configuration for all dashboard tooltips
- **Exports:**
  - `getDashboardTooltip(key)` - Get single tooltip
  - `createDashboardTooltipProps(key, position)` - Create props for Tooltip component
  - `getAllDashboardTooltips()` - Get all tooltips

### 2. `DASHBOARD_TOOLTIPS_GUIDE.js`
- **Location:** `/frontend/src/config/DASHBOARD_TOOLTIPS_GUIDE.js`
- **Purpose:** Implementation guide with code examples
- **Contains:** JSX examples for each tooltip placement

### 3. `DASHBOARD_TOOLTIPS_README.md` (This file)
- **Purpose:** Complete documentation and reference

---

## 🚀 Integration Steps

### Step 1: Add Imports to Dashboard.jsx
```jsx
import Tooltip from './Tooltip';
import { 
  createDashboardTooltipProps,
  getDashboardTooltip 
} from '../config/dashboardTooltipsConfig';
```

### Step 2: Add Global Header Tooltip
```jsx
<div className="flex items-center gap-2">
  <h1 className="text-2xl font-bold text-sfc-gold">MynnCrypt Dashboard</h1>
  <Tooltip 
    content={getDashboardTooltip('globalDashboard')}
    position="bottom"
    icon="🛡️"
  />
</div>
```

### Step 3: Add Status Tooltips
```jsx
<div className="flex items-center gap-2">
  <span className="text-green-400">✓ Donated</span>
  <Tooltip 
    content={getDashboardTooltip('queueDonated')}
    icon="❓"
  />
</div>
```

### Step 4: Add Section Tooltips
Apply same pattern to:
- Queue status (In Queue, Receiver)
- Streams (Stream A & B)
- Referrals
- Team Tree
- Income History
- Sponsor/Upline/Royalty
- Share/Invite

### Step 5: Add Critical Register/Join Tooltip
```jsx
<div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 p-2 rounded">
  <Tooltip 
    content={getDashboardTooltip('registerJoin')}
    icon="⚠️"
    position="bottom"
  />
  <span className="text-sm text-red-300">Read before joining</span>
</div>
```

### Step 6: Add Reinforcement Tooltips
Place throughout dashboard for extra emphasis on:
- Smart contract immutability
- On-chain verification
- Admin limitations
- No guaranteed returns

---

## 🎨 Visual Design

### Color Scheme
- **Background:** `sfc-navy` with `sfc-gold/60` border
- **Text:** `sfc-cream`
- **Links:** `sfc-gold` with hover effect
- **Critical Warnings:** Red border/background

### Positioning
- **Default:** top
- **Options:** top, bottom, left, right
- **Z-index:** z-50 (front layer)

### Animations
- **Trigger:** Hover on icon
- **Effect:** Fade in smoothly
- **Duration:** Instant fade-in

### Icon Usage
- Use emoji icons for consistency
- Each tooltip has a representative emoji
- Icons are displayed in a small circle (if no children)

---

## ✅ Tooltip Checklist

### Essential (Phase 1)
- [ ] Global dashboard tooltip
- [ ] Queue status tooltips (3)
- [ ] Streams tooltip
- [ ] Income history tooltip
- [ ] Register/join tooltip (CRITICAL)

### Important (Phase 2)
- [ ] Referral tooltip
- [ ] Team tree tooltip
- [ ] Sponsor/upline/royalty tooltip
- [ ] Share/invite tooltip

### Reinforcement (Phase 3)
- [ ] Smart contract address
- [ ] Wallet verification
- [ ] On-chain data
- [ ] Admin limitations
- [ ] No guarantees

---

## 🔗 Links & Navigation

### Internal Routes
- `/how-it-works` - How It Works page
- `/faq` - Anti-Scam FAQ

### External Links
- `https://opbnb.bscscan.com` - opBNB BlockScout Explorer
- Can be customized per tooltip

---

## 🧪 Testing

### Manual Testing Steps
1. Load Dashboard
2. Hover over each icon (❓, 🛡️, etc.)
3. Verify tooltip content displays
4. Verify positioning (top/bottom)
5. Click links and verify they work
6. Test on mobile (responsive)

### Browser DevTools
- Check z-index: Should be z-50 (4000+)
- Check styling: Gold border, navy background
- Check text: Clear and readable

---

## 📝 Implementation Notes

### Best Practices
1. **Always show icon** - Use consistent emoji icons
2. **Position wisely** - Avoid overflow on edges
3. **Keep text brief** - 2-3 lines max
4. **Include links** - For CTA and verification
5. **Emphasize security** - Repeat "on-chain", "immutable", "no admin"

### Common Issues
- **Tooltip hidden behind elements?** - Check z-index, increase if needed
- **Text wrapping poorly?** - Adjust `max-w-xs` or `w-max` in Tooltip.jsx
- **Links not working?** - Verify URL format in config
- **Icon not visible?** - Ensure emoji renders correctly in browser

---

## 🚀 Deployment

### Version Control
```bash
git add frontend/src/config/dashboardTooltipsConfig.js
git add frontend/src/config/DASHBOARD_TOOLTIPS_GUIDE.js
git add frontend/src/components/Dashboard.jsx  # (after integration)
git commit -m "Add dashboard tooltips system for smart contract transparency"
git push origin main
```

### Vercel Auto-Deploy
- Changes push automatically to production
- No additional deployment steps needed
- Verify on https://www.mynnncrypt.com after push

---

## 📚 Additional Resources

### Related Files
- `/frontend/src/components/Tooltip.jsx` - Reusable Tooltip component
- `/frontend/src/config/tooltipsConfig.js` - Main site tooltips (reference)
- `/frontend/src/components/FAQ.jsx` - Anti-Scam FAQ page

### Smart Contract Info
- **Network:** opBNB Mainnet (Chain ID: 204)
- **MynnCrypt Contract:** `0x7a0831473eC7854ed5Aec663280edebbb215adCc`
- **MynnGift Contract:** `0x9017B11f41D6c0E9201E9f6F6540Abf209794e5A`
- **Explorer:** https://opbnb.bscscan.com

---

## ❓ FAQ

**Q: Can tooltips be disabled?**  
A: Not by user. Design is intentional to ensure awareness of smart contract nature.

**Q: Can tooltip content be changed?**  
A: Yes, edit `dashboardTooltipsConfig.js` and restart dev server or redeploy.

**Q: Do tooltips collect data?**  
A: No, they're purely client-side display elements.

**Q: Can tooltips be added dynamically?**  
A: Yes, extend `dashboardTooltips` object with new keys.

---

## 📞 Support

For questions or improvements:
1. Check `DASHBOARD_TOOLTIPS_GUIDE.js` for examples
2. Review `Tooltip.jsx` component documentation
3. Refer to `dashboardTooltipsConfig.js` structure

---

**Last Updated:** January 20, 2026  
**Status:** Ready for Implementation  
**Version:** 1.0
