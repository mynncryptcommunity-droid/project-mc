import { ShieldCheckIcon, BoltIcon, UsersIcon } from '@heroicons/react/24/solid';

export default function About() {
  const features = [
    {
      title: "Platinum Security",
      description: "Bank-level encryption with audited smart contracts, multi-signature wallets, and 24/7 security monitoring",
      icon: <ShieldCheckIcon className="h-12 w-12 text-sfc-gold" />,
    },
    {
      title: "Diamond Speed",
      description: "Lightning-fast transactions with instant confirmations and optimized gas fees for seamless DeFi experience",
      icon: <BoltIcon className="h-12 w-12 text-sfc-gold" />,
    },
    {
      title: "Royal Community",
      description: "Exclusive network of verified investors with premium benefits, early access, and VIP support",
      icon: <UsersIcon className="h-12 w-12 text-sfc-gold" />,
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
              Why Choose Us?
            </span>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-sfc-gold rounded-full"></div>
          </h2>
          <p className="text-xl text-sfc-cream/80 max-w-3xl mx-auto mt-6">
            Platform designed specifically to provide the best DeFi experience
          </p>
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
              
              {/* Icon container with dynamic background */}
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-sfc-gold to-sfc-mid-blue flex items-center justify-center mb-6 shadow-xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 mx-auto fade-element">
                <div className="text-sfc-dark-blue drop-shadow-lg">
                  {feature.icon}
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center fade-element">
                <h3 className="text-2xl font-bold text-sfc-cream mb-4 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sfc-cream/90 leading-relaxed mb-6">
                  {feature.description}
                </p>
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