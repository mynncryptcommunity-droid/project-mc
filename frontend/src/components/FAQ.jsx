import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqData = [
    {
      question: "Is MynnCrypt a scam?",
      answer: "Short answer: MynnCrypt is a smart contract system, not a promise.\n\nThere is:\n• no admin-controlled payout\n• no manual reward distribution\n• no hidden wallet that can take user funds\n\nEvery action is executed automatically by code and recorded on the blockchain.\n\n👉 You don't need to trust us — you can verify everything yourself."
    },
    {
      question: "Who controls the money?",
      answer: "No one controls user funds.\n\nWhen you interact with MynnCrypt:\n• funds go directly into the smart contract\n• rewards are distributed automatically by the contract rules\n• no admin can pause, redirect, or withdraw user rewards\n\nAnalogy (easy to understand):\nLike a vending machine.\nYou insert money, the machine follows fixed rules.\nThe machine owner cannot change the outcome."
    },
    {
      question: "Can the admin take my money?",
      answer: "No.\n\nThe admin:\n❌ cannot withdraw user balances\n❌ cannot skip queue positions\n❌ cannot edit rewards\n❌ cannot choose who gets paid\n\nThe admin's role is limited to maintenance settings, not user funds."
    },
    {
      question: "Why does it look like a referral system?",
      answer: "Because referrals are used for community tracking, not promises.\n\nImportant differences:\n• Referrals do not guarantee income\n• Income is based on queue position, not recruitment\n• You can receive without inviting anyone\n\nSimple explanation:\nReferral shows who invited you.\nIt does not decide who gets paid."
    },
    {
      question: "Is there guaranteed profit?",
      answer: "No. There is zero profit guarantee.\n\nMynnCrypt does not promise:\n• fixed returns\n• daily income\n• ROI percentages\n\nRewards depend entirely on:\n• system participation\n• queue rotation\n• smart contract execution\n\nThis is a system, not an investment promise."
    },
    {
      question: "Where does the reward money come from?",
      answer: "Rewards come from community participation, processed by the contract.\n\nEach cycle:\n• contributions are collected\n• automatically split by predefined percentages\n• distributed to receivers based on queue order\n\nNo new money is created.\nNo hidden source exists."
    },
    {
      question: "How do I know the queue is real?",
      answer: "Because:\n• queue data is stored on the blockchain\n• all users see the same queue\n• your position cannot be edited\n\nIf you are position #25:\nEveryone sees you as #25."
    },
    {
      question: "What if the admin disappears?",
      answer: "Nothing changes.\n\n• The smart contract keeps running\n• Queue rotation continues\n• Rewards are still distributed\n• No admin action is required\n\nOnce deployed, the system does not need the creator to function."
    },
    {
      question: "Can rewards be blocked or frozen?",
      answer: "No.\n\nThere is:\n• no pause button for user rewards\n• no blacklist function\n• no manual approval step\n\nIf the contract rules say you receive — you receive."
    },
    {
      question: "Is this an investment platform?",
      answer: "No.\n\nMynnCrypt is:\n• not an investment\n• not a savings platform\n• not a profit scheme\n\nIt is a decentralized community reward protocol where participation follows fixed rules."
    },
    {
      question: "Why are there two streams (A & B)?",
      answer: "To separate user behavior:\n\nStream A: lower entry, learning & community flow\nStream B: higher entry, faster rotation\n\nThey are:\n• independent\n• optional\n• visible on-chain\n\nUsers choose their own path."
    },
    {
      question: "Can I lose money?",
      answer: "Yes — like any blockchain interaction, risk exists.\n\nYou should only participate if:\n• you understand the system\n• you accept the mechanics\n• you are comfortable with blockchain risk\n\nAlways verify before joining."
    },
    {
      question: "How can I verify everything myself?",
      answer: "You can:\n• View smart contract on blockchain explorer\n• Track transactions and events\n• Compare dashboard data with on-chain data\n• Watch queue movement in real time\n\nDon't trust screenshots. Verify transactions."
    },
    {
      question: "Why doesn't MynnCrypt use NFTs or points?",
      answer: "Because:\n• NFTs add complexity without improving fairness\n• points are often off-chain and unverifiable\n\nMynnCrypt focuses on:\n• real transactions\n• transparent queues\n• on-chain logic only"
    },
    {
      question: "What makes MynnCrypt different from scams?",
      answer: "Common Scams:\n• Manual payouts\n• Admin decides winners\n• Hidden wallets\n• Promised profit\n• Off-chain logic\n\nMynnCrypt:\n• Automatic distribution\n• Queue-based\n• Public contracts\n• No promises\n• On-chain execution"
    }
  ];

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen text-sfc-cream relative pt-24 pb-12">
      {/* Background */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundImage: 'url(/newbackground.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        opacity: 0.7, 
        zIndex: 0 
      }} className="parallax-background"></div>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'linear-gradient(to bottom, rgba(24, 59, 78, 0.7), rgba(39, 84, 138, 0.7))', 
        zIndex: 1 
      }}></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 fade-element">
          <div className="text-5xl font-bold mb-4 text-sfc-gold">🛡️ MYNNCRYPT</div>
          <div className="text-2xl font-semibold mb-4 text-sfc-cream">Anti-Scam FAQ</div>
          <div className="text-xl text-sfc-gold italic font-light">
            Don't trust words. Verify the system.
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-sfc-navy/40 to-sfc-blue/40 border border-sfc-gold/30 rounded-lg overflow-hidden fade-element"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-sfc-navy/50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-sfc-cream text-left">
                  ❓ {item.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-sfc-gold transition-transform duration-300 flex-shrink-0 ml-4 ${
                    expandedIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  expandedIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 py-4 bg-sfc-navy/20 border-t border-sfc-gold/20">
                  <p className="text-sfc-cream whitespace-pre-line leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Advice Section */}
        <div className="mt-12 p-8 bg-gradient-to-r from-sfc-gold/10 to-sfc-cream/5 border-2 border-sfc-gold/40 rounded-lg fade-element text-center">
          <h3 className="text-2xl font-bold text-sfc-gold mb-6">🔍 Final Advice</h3>
          <div className="space-y-4 text-lg text-sfc-cream">
            <p className="italic font-semibold">
              Do not trust claims.
              <br />
              Trust what you can verify on-chain.
            </p>
            <p className="italic font-semibold">
              If you don't understand it — don't join.
              <br />
              If you understand it — decide for yourself.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-sfc-gold to-sfc-cream text-sfc-navy font-bold rounded-lg hover:shadow-xl hover:shadow-sfc-gold/50 transition-all duration-300 transform hover:scale-105"
          >
            ← Back to Home
          </a>
        </div>
      </div>

      <style>{`
        .fade-element {
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default FAQ;
