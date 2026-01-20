/**
 * Dashboard Tooltips Configuration
 * All tooltips emphasize smart contract automation, on-chain verification, and no admin control
 */

const dashboardTooltips = {
  // 1️⃣ GLOBAL TOOLTIP - Header dashboard
  globalDashboard: {
    text: "This system runs fully on smart contracts.\nNo admin can change payouts or queue positions.",
    link: {
      text: "Verify how this works →",
      url: "/how-it-works"
    },
    position: "bottom"
  },

  // 2️⃣ QUEUE POSITION TOOLTIPS
  queueDonated: {
    text: "Funds are sent directly to the smart contract.\nNo one can redirect or hold them.",
    position: "top"
  },

  queueInQueue: {
    text: "Queue order is stored on-chain and visible to everyone.\nPositions cannot be edited or skipped.",
    position: "top"
  },

  queueReceiver: {
    text: "Receiver status is triggered automatically by contract logic,\nnot by admin decision.",
    position: "top"
  },

  // 3️⃣ STREAM A & STREAM B TOOLTIP
  streams: {
    text: "Streams follow fixed smart contract rules.\nEntry does not guarantee rewards or returns.",
    link: {
      text: "See distribution rules →",
      url: "/faq"
    },
    position: "bottom"
  },

  // 4️⃣ REFERRAL TOOLTIP
  referral: {
    text: "Referrals track community structure only.\nThey do not control who gets paid.",
    position: "top"
  },

  // 5️⃣ TEAM TREE TOOLTIP
  teamTree: {
    text: "This structure is read from blockchain data.\nNo user or admin can modify the hierarchy.",
    position: "bottom"
  },

  // 6️⃣ INCOME HISTORY TOOLTIP
  incomeHistory: {
    text: "All income records are derived from on-chain transactions.\nYou can verify each entry via blockchain explorer.",
    link: {
      text: "View transaction →",
      url: "https://opbnb.bscscan.com"
    },
    position: "top"
  },

  // 7️⃣ SPONSOR / UPLINE / ROYALTY TOOLTIP
  sponsorUplineRoyalty: {
    text: "These rewards are calculated automatically by the contract.\nNo manual approval is involved.",
    position: "top"
  },

  // 8️⃣ REGISTER / JOIN PAGE TOOLTIP - VERY IMPORTANT
  registerJoin: {
    text: "⚠️ This is a smart contract system, not an investment product.\nThere is no guaranteed profit.\n\nDo your own research before joining.",
    link: {
      text: "Read Anti-Scam FAQ →",
      url: "/faq"
    },
    position: "bottom",
    priority: "high" // Special styling for this critical tooltip
  },

  // 9️⃣ SHARE / INVITE TOOLTIP
  shareInvite: {
    text: "Always encourage others to verify the contract themselves.\nNever ask anyone to trust blindly.\n\n✅ Share facts, not promises",
    position: "top"
  },

  // 🔟 LEVEL DISCLAIMER - CRITICAL
  levelDisclaimer: {
    text: "Level represents mining progression, not guaranteed outcomes.",
    position: "bottom",
    priority: "critical"
  },

  // 🔟 ADDITIONAL TOOLTIPS FOR REINFORCEMENT
  smartContractAddress: {
    text: "Contract addresses are permanent on-chain records.\nYou can verify them on blockchain explorer anytime.",
    link: {
      text: "View contract →",
      url: "https://opbnb.bscscan.com"
    },
    position: "bottom"
  },

  walletVerification: {
    text: "Your wallet address proves your identity.\nKeep your private keys secure and never share them.",
    position: "top"
  },

  onChainData: {
    text: "All data shown here is verified directly from the blockchain.\nNo server manipulation is possible.",
    position: "bottom"
  },

  adminLimitations: {
    text: "❌ Admin cannot:\n• Change queue positions\n• Redirect funds\n• Approve/deny payments\n• Modify smart contract (immutable)",
    position: "top"
  },

  noGuarantees: {
    text: "Entry does not guarantee returns.\nAll outcomes depend on protocol rules and your participation.",
    position: "bottom"
  }
};

/**
 * Helper function to get tooltip by key
 */
export const getDashboardTooltip = (key) => {
  return dashboardTooltips[key] || null;
};

/**
 * Helper function to create tooltip props for use with Tooltip component
 */
export const createDashboardTooltipProps = (key, position = null) => {
  const tooltip = dashboardTooltips[key];
  if (!tooltip) return null;

  return {
    text: tooltip.text,
    link: tooltip.link || null,
    position: position || tooltip.position || "top",
    isPriority: tooltip.priority === "high" || tooltip.priority === "critical"
  };
};

/**
 * Get level disclaimer text
 */
export const getLevelDisclaimer = () => {
  return dashboardTooltips.levelDisclaimer.text;
};

/**
 * Get all tooltips (for reference/debugging)
 */
export const getAllDashboardTooltips = () => dashboardTooltips;

export default dashboardTooltips;
