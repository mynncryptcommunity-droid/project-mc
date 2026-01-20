/**
 * DASHBOARD TOOLTIPS IMPLEMENTATION GUIDE
 * 
 * This guide shows how to integrate dashboard tooltips into Dashboard.jsx
 * All tooltips appear in front (z-50) for immediate access
 */

// ============================================================================
// EXAMPLE IMPLEMENTATIONS - Add these to Dashboard.jsx
// ============================================================================

/**
 * STEP 1: Add imports at top of Dashboard.jsx
 */

// Add after other imports:
import Tooltip from './Tooltip';
import { 
  createDashboardTooltipProps,
  getDashboardTooltip 
} from '../config/dashboardTooltipsConfig';

// ============================================================================
// STEP 2: GLOBAL DASHBOARD TOOLTIP (Header)
// ============================================================================
// Location: Dashboard header/title area
// Example JSX to add:

{/* Global Dashboard Tooltip in Header */}
<div className="flex items-center gap-2">
  <h1 className="text-2xl font-bold text-sfc-gold">MynnCrypt Dashboard</h1>
  <Tooltip 
    content={getDashboardTooltip('globalDashboard')}
    position="bottom"
    icon="🛡️"
  />
</div>

// ============================================================================
// STEP 3: QUEUE STATUS SECTION TOOLTIPS
// ============================================================================
// Location: Where queue status (Donated/In Queue/Receiver) is displayed
// Example JSX for each status:

{/* Donated Status Tooltip */}
<div className="flex items-center gap-2">
  <span className="text-green-400">✓ Donated</span>
  <Tooltip 
    content={getDashboardTooltip('queueDonated')}
    icon="❓"
  />
</div>

{/* In Queue Status Tooltip */}
<div className="flex items-center gap-2">
  <span className="text-blue-400">⏳ In Queue</span>
  <Tooltip 
    content={getDashboardTooltip('queueInQueue')}
    icon="❓"
  />
</div>

{/* Receiver Status Tooltip */}
<div className="flex items-center gap-2">
  <span className="text-yellow-400">🎁 Receiver</span>
  <Tooltip 
    content={getDashboardTooltip('queueReceiver')}
    icon="❓"
  />
</div>

// ============================================================================
// STEP 4: STREAM A & STREAM B TOOLTIPS
// ============================================================================
// Location: Stream display section
// Example JSX:

{/* Stream A & B Tooltip */}
<div className="flex items-center gap-2">
  <h3 className="text-lg font-semibold">Streams</h3>
  <Tooltip 
    content={getDashboardTooltip('streams')}
    icon="⛓️"
    position="bottom"
  />
</div>

// ============================================================================
// STEP 5: REFERRAL TOOLTIP
// ============================================================================
// Location: Referral info section
// Example JSX:

{/* Referral Tooltip */}
<div className="flex items-center gap-2">
  <h3 className="text-lg font-semibold">Your Referrals</h3>
  <Tooltip 
    content={getDashboardTooltip('referral')}
    icon="👥"
  />
</div>

// ============================================================================
// STEP 6: TEAM TREE TOOLTIP
// ============================================================================
// Location: Team Tree view section
// Example JSX:

{/* Team Tree Tooltip */}
<div className="flex items-center gap-2">
  <h3 className="text-lg font-semibold">Team Tree</h3>
  <Tooltip 
    content={getDashboardTooltip('teamTree')}
    icon="🌳"
    position="bottom"
  />
</div>

// ============================================================================
// STEP 7: INCOME HISTORY TOOLTIP
// ============================================================================
// Location: Income history/transaction list
// Example JSX:

{/* Income History Tooltip */}
<div className="flex items-center gap-2">
  <h3 className="text-lg font-semibold">Income History</h3>
  <Tooltip 
    content={getDashboardTooltip('incomeHistory')}
    icon="📊"
  />
</div>

// ============================================================================
// STEP 8: SPONSOR/UPLINE/ROYALTY TOOLTIP
// ============================================================================
// Location: Income breakdown section (where these income types are shown)
// Example JSX:

{/* Income Types Tooltip */}
<div className="flex items-center gap-2">
  <p className="text-sm">Sponsor Income / Upline Income / Royalty</p>
  <Tooltip 
    content={getDashboardTooltip('sponsorUplineRoyalty')}
    icon="💰"
  />
</div>

// ============================================================================
// STEP 9: REGISTER/JOIN TOOLTIP (CRITICAL - if visible on dashboard)
// ============================================================================
// Location: Register/Join buttons or instructions
// Example JSX:

{/* Register Join Tooltip - IMPORTANT */}
<div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 p-2 rounded">
  <Tooltip 
    content={getDashboardTooltip('registerJoin')}
    icon="⚠️"
    position="bottom"
  />
  <span className="text-sm text-red-300">Read before joining</span>
</div>

// ============================================================================
// STEP 10: SHARE/INVITE TOOLTIP
// ============================================================================
// Location: Share/Invite section
// Example JSX:

{/* Share Invite Tooltip */}
<div className="flex items-center gap-2">
  <h3 className="text-lg font-semibold">Share & Invite</h3>
  <Tooltip 
    content={getDashboardTooltip('shareInvite')}
    icon="📢"
  />
</div>

// ============================================================================
// ADDITIONAL TOOLTIPS FOR REINFORCEMENT
// ============================================================================

{/* Smart Contract Address Tooltip */}
<div className="flex items-center gap-1">
  <code className="text-xs bg-sfc-dark-blue/50 p-1 rounded">
    0x7a0831473eC7854ed5Aec663280edebbb215adCc
  </code>
  <Tooltip 
    content={getDashboardTooltip('smartContractAddress')}
    icon="🔗"
  />
</div>

{/* Wallet Verification Tooltip */}
<div className="flex items-center gap-2">
  <span className="text-sm">Wallet: {userAddress}</span>
  <Tooltip 
    content={getDashboardTooltip('walletVerification')}
    icon="🔐"
  />
</div>

{/* On-Chain Data Tooltip */}
<div className="flex items-center gap-2">
  <span className="text-xs text-green-400">✓ On-Chain Verified</span>
  <Tooltip 
    content={getDashboardTooltip('onChainData')}
    icon="⛓️"
  />
</div>

{/* Admin Limitations Tooltip */}
<div className="flex items-center gap-2 bg-green-900/20 border border-green-500/30 p-2 rounded">
  <Tooltip 
    content={getDashboardTooltip('adminLimitations')}
    icon="🛡️"
    position="bottom"
  />
  <span className="text-xs text-green-300">Security: Immutable Contract</span>
</div>

{/* No Guarantees Tooltip */}
<div className="flex items-center gap-2">
  <p className="text-xs text-sfc-cream/70">Important: No Guaranteed Returns</p>
  <Tooltip 
    content={getDashboardTooltip('noGuarantees')}
    icon="⚠️"
  />
</div>

// ============================================================================
// STYLING NOTES
// ============================================================================
/*
1. All tooltips appear at z-50 (front layer)
2. Tooltips use sfc-navy background with sfc-gold border
3. Text is sfc-cream color for readability
4. Icons are emoji-based for consistency
5. Links inside tooltips open in new tab/navigate to internal routes
6. Tooltip positions (top/bottom/left/right) adjust automatically
7. Max-width is set to prevent overflow on small screens
8. Hover effect shows tooltip with fade animation
*/

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================
/*
☐ Add Tooltip import to Dashboard.jsx
☐ Add dashboardTooltipsConfig import
☐ Add global tooltip to dashboard header
☐ Add queue status tooltips (Donated/In Queue/Receiver)
☐ Add stream tooltips (Stream A & B)
☐ Add referral tooltip
☐ Add team tree tooltip
☐ Add income history tooltip
☐ Add sponsor/upline/royalty tooltip
☐ Add register/join tooltip (if applicable)
☐ Add share/invite tooltip
☐ Add reinforcement tooltips:
   - Smart contract address
   - Wallet verification
   - On-chain data
   - Admin limitations
   - No guarantees
☐ Test all tooltips display correctly
☐ Verify z-50 positioning works properly
☐ Test links work correctly
☐ Commit changes to GitHub
☐ Deploy to production
*/
