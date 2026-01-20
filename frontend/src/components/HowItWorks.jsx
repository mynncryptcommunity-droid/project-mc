import React, { useState } from 'react';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('how-it-works');

  const steps = [
    {
      number: '1️⃣',
      title: 'Register & Connect Wallet',
      description: 'Start by connecting your wallet and creating an account in the MynnCrypt system.'
    },
    {
      number: '2️⃣',
      title: 'Join the System',
      description: 'Complete your registration through a smart contract interaction on the blockchain.'
    },
    {
      number: '3️⃣',
      title: 'Enter the Queue',
      description: 'You automatically join the transparent queue system, your position is recorded on-chain.'
    },
    {
      number: '4️⃣',
      title: 'Receive Automatically',
      description: 'When your queue position is reached, rewards are automatically distributed by the contract.'
    },
    {
      number: '5️⃣',
      title: 'Advance Through Ranks',
      description: 'Progress through auto-promotion, unlocking higher earning potential and better benefits.'
    }
  ];

  return (
    <section className="bg-sfc-dark-blue text-sfc-cream min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-center mb-4">
          <span className="gradient-text">HOW IT WORKS</span>
        </h1>
        <p className="text-center text-sfc-gold mb-12 text-lg font-semibold">
          All processes are handled entirely by smart contracts.
        </p>

        <div className="tab-container mb-10">
          <div className="flex justify-center gap-4 mb-8">
            <button 
              className={`tab-button ${activeTab === 'how-it-works' ? 'active' : ''}`}
              onClick={() => setActiveTab('how-it-works')}
            >
              5-Step Process
            </button>
            <button 
              className={`tab-button ${activeTab === 'smart-contract' ? 'active' : ''}`}
              onClick={() => setActiveTab('smart-contract')}
            >
              Smart Contract
            </button>
            <button 
              className={`tab-button ${activeTab === 'mynngift' ? 'active' : ''}`}
              onClick={() => setActiveTab('mynngift')}
            >
              Mynngift
            </button>
            <button 
              className={`tab-button ${activeTab === 'why-us' ? 'active' : ''}`}
              onClick={() => setActiveTab('why-us')}
            >
              Why Us?
            </button>
          </div>

          <div className="content-container">
            {activeTab === 'how-it-works' && (
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="feature-card border-l-4 border-sfc-gold">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl flex-shrink-0">{step.number}</span>
                      <div>
                        <h3 className="feature-title mb-2">{step.title}</h3>
                        <p className="text-sfc-cream/90">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-8 p-6 bg-gradient-to-r from-sfc-gold/10 to-sfc-cream/5 border-2 border-sfc-gold/40 rounded-lg">
                  <p className="text-center text-lg font-semibold text-sfc-gold">
                    ✅ All processes are handled entirely by smart contracts.
                  </p>
                  <p className="text-center text-sfc-cream/80 mt-2">
                    No intermediaries, no manual approval, just automated blockchain execution.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'smart-contract' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="feature-card">
                  <h3 className="feature-title">Automatic & Fast Registration</h3>
                  <p>Once you join, the Mynncrypt Smart Contract will automatically create your unique ID, manage referrer data, and place you in a transparent network structure. No delays, no bureaucracy, just a seamless process!</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">Beneficial Level & Upgrade System</h3>
                  <p>You can level up in the community, unlocking greater earning potential. Each upgrade is automatically managed by the smart contract, ensuring fair fund distribution.</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">Guaranteed Income Distribution</h3>
                  <p>Every transaction automatically distributes funds to the rightful parties, including referrers, sharefees, and Mynngift for automatic donations.</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">Royalty Pool & Auto-Upgrade</h3>
                  <p>Get passive income from the Royalty Pool and enjoy the smart Auto-Upgrade feature for sustainable growth within the community.</p>
                </div>
              </div>
            )}

            {activeTab === 'mynngift' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="feature-card">
                  <h3 className="feature-title">Integrated Automatic Donations</h3>
                  <p>When reaching level 4 & level 8, a portion of the upgrade fee is automatically allocated to Mynngift, creating a sustainable funding stream for donations.</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">Ranking System & Collective Donations</h3>
                  <p>Mynngift has multiple "Ranks" with different donation values. The smart contract will automatically distribute funds when criteria are met.</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">Transparent Fund Distribution</h3>
                  <p>50% for donation recipients, 45% for promotion, and 5% for operational costs. Clear and automatic distribution, written in code!</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">Gas Fee Subsidy</h3>
                  <p>The Gas Subsidy Pool helps cover your transaction costs when interacting with Mynngift. Direct support for your activities!</p>
                </div>
              </div>
            )}

            {activeTab === 'why-us' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="feature-card">
                  <h3 className="feature-title">Absolute Transparency</h3>
                  <p>Every line of code is public and can be audited on the blockchain. No "black box" or secrets. Everything is permanently recorded!</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">Full Automation</h3>
                  <p>Operates 24/7 without human intervention. No delays, no human errors, and no manipulation.</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">Unmatched Security</h3>
                  <p>Built with the highest security standards, using ReentrancyGuard and code that cannot be changed after deployment.</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">True Decentralization</h3>
                  <p>Runs on the blockchain, without central control. You are part of a strong and sovereign network!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #DDA853, #F3F3E0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .tab-button {
          padding: 12px 24px;
          border-radius: 50px;
          background: rgba(221, 168, 83, 0.1);
          color: #F3F3E0;
          border: 1px solid rgba(221, 168, 83, 0.2);
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .tab-button:hover {
          background: rgba(221, 168, 83, 0.2);
          transform: translateY(-2px);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #DDA853, #E5C893);
          color: #183B4E;
          box-shadow: 0 4px 15px rgba(221, 168, 83, 0.3);
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(221, 168, 83, 0.1);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(221, 168, 83, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #DDA853, #F3F3E0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .feature-card p {
          color: rgba(243, 243, 224, 0.9);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .tab-button {
            padding: 8px 16px;
            font-size: 0.9rem;
          }

          .feature-card {
            padding: 20px;
          }

          .feature-title {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </section>
  );
}