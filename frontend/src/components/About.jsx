// Icon imports removed - using emoji instead

export default function About() {
  const features = [
    {
      emoji: "🔐",
      title: "Code, Not People",
      points: [
        "No admin-controlled payouts.",
        "Everything runs automatically on smart contracts.",
      ],
    },
    {
      emoji: "⛓️",
      title: "Transparent by Default",
      points: [
        "All data is public, on-chain, and verifiable.",
        "Nothing is hidden off-chain.",
      ],
    },
    {
      emoji: "👥",
      title: "Equal Rules for Everyone",
      points: [
        "No VIPs, no special access, no shortcuts.",
        "Same rules apply to all participants.",
      ],
    },
  ];

  return (
    <section id="about" className="py-20 bg-sfc-dark-blue relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-sfc-gold rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sfc-cream rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-sfc-cream mb-4 relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-sfc-gold to-sfc-cream bg-clip-text text-transparent">
              Why Choose MynnCrypt?
            </span>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-sfc-gold rounded-full"></div>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              
              {/* Emoji container with dynamic background */}
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-sfc-gold to-sfc-mid-blue flex items-center justify-center mb-6 shadow-xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 mx-auto fade-element text-4xl">
                {feature.emoji}
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center fade-element">
                <h3 className="text-2xl font-bold text-sfc-cream mb-6 tracking-wide">
                  {feature.title}
                </h3>
                <ul className="space-y-4 text-sfc-cream/90">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
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