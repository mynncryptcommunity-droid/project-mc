/**
 * MYNNCRYPT TOOLTIPS CONFIGURATION
 * All educational tooltips for anti-scam messaging
 * Centralized for easy management and updates
 */

export const tooltips = {
  // 1️⃣ GLOBAL TOOLTIP - Header/Dashboard
  global: {
    text: '🛡️ This system runs fully on smart contracts.\nNo admin can change payouts or queue positions.',
    link: {
      text: 'Verify how this works',
      url: '/faq',
      target: '_self'
    }
  },

  // 2️⃣ QUEUE POSITION TOOLTIPS
  donated: {
    text: '📤 Funds are sent directly to the smart contract.\nNo one can redirect or hold them.',
    link: {
      text: 'Learn more',
      url: '/faq',
      target: '_self'
    }
  },

  inQueue: {
    text: '⏳ Queue order is stored on-chain and visible to everyone.\nPositions cannot be edited or skipped.',
    link: {
      text: 'View on blockchain',
      url: 'https://opbnbscan.com',
      target: '_blank'
    }
  },

  receiver: {
    text: '✅ Receiver status is triggered automatically by contract logic,\nnot by admin decision.',
    link: {
      text: 'How it works',
      url: '/faq',
      target: '_self'
    }
  },

  // 3️⃣ STREAM A / STREAM B TOOLTIP
  streams: {
    text: '🔀 Streams follow fixed smart contract rules.\nEntry does not guarantee rewards or returns.',
    link: {
      text: 'See distribution rules',
      url: '/faq',
      target: '_self'
    }
  },

  // 4️⃣ REFERRAL TOOLTIP
  referral: {
    text: '🤝 Referrals track community structure only.\nThey do not control who gets paid.',
    link: {
      text: 'Understand referrals',
      url: '/faq',
      target: '_self'
    }
  },

  // 5️⃣ TEAM TREE TOOLTIP
  teamTree: {
    text: '🌳 This structure is read from blockchain data.\nNo user or admin can modify the hierarchy.',
    link: {
      text: 'Verify data',
      url: 'https://opbnbscan.com',
      target: '_blank'
    }
  },

  // 6️⃣ INCOME HISTORY TOOLTIP
  incomeHistory: {
    text: '💰 All income records are derived from on-chain transactions.\nYou can verify each entry via blockchain explorer.',
    link: {
      text: 'View transaction',
      url: 'https://opbnbscan.com',
      target: '_blank'
    }
  },

  // 7️⃣ SPONSOR / UPLINE / ROYALTY TOOLTIP
  rewards: {
    text: '🎁 These rewards are calculated automatically by the contract.\nNo manual approval is involved.',
    link: {
      text: 'How rewards work',
      url: '/faq',
      target: '_self'
    }
  },

  // 8️⃣ REGISTER / JOIN PAGE TOOLTIP (VERY IMPORTANT)
  register: {
    text: '⚠️ This is a smart contract system, not an investment product.\nThere is no guaranteed profit. Please understand the system before joining.',
    link: {
      text: 'Read Anti-Scam FAQ',
      url: '/faq',
      target: '_self'
    }
  },

  // 9️⃣ SHARE / INVITE TOOLTIP
  share: {
    text: '📢 Always encourage others to verify the contract themselves.\nNever ask anyone to trust blindly.',
    link: {
      text: 'How to explain',
      url: '/faq',
      target: '_self'
    }
  },

  // 🔟 ADDITIONAL SECURITY TOOLTIPS
  smartContract: {
    text: '🔐 All transactions are executed by code, not humans.\nTransparency is guaranteed by blockchain.',
    link: {
      text: 'View smart contract',
      url: 'https://opbnbscan.com/address/0x7a0831473eC7854ed5Aec663280edebbb215adCc',
      target: '_blank'
    }
  },

  noAdmin: {
    text: '🚫 Admin cannot:\n❌ Withdraw funds\n❌ Edit queue positions\n❌ Change reward amounts\n❌ Pause the system',
    link: {
      text: 'Why this matters',
      url: '/faq',
      target: '_self'
    }
  },

  onChain: {
    text: '⛓️ Everything is on-chain and permanent.\nNo edits, no deletions, no hidden actions.',
    link: {
      text: 'Understand blockchain',
      url: '/how-it-works',
      target: '_self'
    }
  },

  verification: {
    text: '✔️ You can verify everything yourself:\n• Transaction history\n• Queue positions\n• Payment distribution\n• Contract logic',
    link: {
      text: 'How to verify',
      url: '/faq',
      target: '_self'
    }
  },

  gasFeesOpBNB: {
    text: '⚡ OpBNB Mainnet has very low transaction fees.\nYour funds go directly to the contract, not to intermediaries.',
    link: null
  },

  // DASHBOARD SPECIFIC
  dashboardBalance: {
    text: '💵 Your balance is calculated from on-chain data.\nAutomatically updated every transaction.',
    link: {
      text: 'View your contract data',
      url: 'https://opbnbscan.com',
      target: '_blank'
    }
  },

  dashboardQueue: {
    text: '📊 Queue position updates based on\ncontract logic and participation.',
    link: {
      text: 'How queue works',
      url: '/faq',
      target: '_self'
    }
  },

  claimRewards: {
    text: '🎯 Rewards can only be claimed when\nyour queue position triggers the receiver status.',
    link: {
      text: 'Learn more',
      url: '/faq',
      target: '_self'
    }
  },

  // WALLET RELATED
  walletConnection: {
    text: '🔑 Your wallet is only used for signing transactions.\nWe never store your private keys.',
    link: null
  },

  networkWarning: {
    text: '⚠️ Make sure you are connected to opBNB Mainnet (Chain 204).\nUsing wrong network = wrong smart contract!',
    link: {
      text: 'How to switch networks',
      url: '/how-it-works',
      target: '_self'
    }
  }
};

/**
 * Helper function to get tooltip by key
 */
export const getTooltip = (key) => {
  return tooltips[key] || tooltips.global;
};

/**
 * Helper function to create tooltip props object
 */
export const createTooltipProps = (key, position = 'top', icon = '❓') => {
  return {
    content: getTooltip(key),
    position,
    icon
  };
};
