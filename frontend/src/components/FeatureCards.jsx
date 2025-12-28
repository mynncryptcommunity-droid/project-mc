import React from 'react';

export default function FeatureCards() {
  const features = [
    {
      title: "Platinum Security",
      description: "Bank-level encryption with audited smart contracts, multi-signature wallets, and 24/7 security monitoring",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      accent: "gold"
    },
    {
      title: "Diamond Speed",
      description: "Lightning-fast transactions with instant confirmations and optimized gas fees for seamless DeFi experience",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      accent: "blue"
    },
    {
      title: "Royal Community",
      description: "Exclusive network of verified investors with premium benefits, early access, and VIP support",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      accent: "purple"
    }
  ];

  return (
    <section className="py-16 bg-sfc-dark-blue">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-sfc-cream mb-4 relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-sfc-gold to-sfc-cream bg-clip-text text-transparent">
              Exclusive Features
            </span>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-sfc-gold rounded-full"></div>
          </h2>
          <p className="text-xl text-sfc-cream/80 max-w-3xl mx-auto mt-6">
            Premium-tier services designed for discerning investors who demand excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-gradient-to-br from-sfc-dark-blue/30 to-sfc-mid-blue/20 backdrop-blur-lg rounded-3xl p-8 border border-sfc-gold/30 shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-sfc-gold/30 hover:border-sfc-gold/50 hover:-translate-y-3"
            >
              {/* Decorative corner elements */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-sfc-gold/20 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-sfc-gold/20 rounded-bl-lg"></div>
              
              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-r from-transparent via-sfc-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Icon container with dynamic background */}
              <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.accent === 'gold' ? 'from-yellow-400 to-yellow-600' : feature.accent === 'blue' ? 'from-blue-400 to-blue-600' : 'from-purple-400 to-purple-600'} flex items-center justify-center mb-6 shadow-xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                <div className="text-white drop-shadow-lg">
                  {feature.icon}
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-sfc-cream mb-4 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sfc-cream/90 leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                {/* Elegant button */}
                <button className="relative overflow-hidden group/button">
                  <span className="relative z-10 text-sfc-gold font-medium flex items-center group-hover/button:translate-x-1 transition-transform duration-300">
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover/button:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-sfc-gold transition-all duration-500 group-hover/button:w-full"></div>
                </button>
              </div>
              
              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-sfc-gold/5 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}