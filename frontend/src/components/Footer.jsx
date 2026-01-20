import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-sfc-dark-blue/80 border-t border-sfc-cream/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold text-sfc-cream mb-4">MC Dapps</h3>
            <p className="text-sfc-cream/80 mb-4 max-w-md">
              The leading DApps platform that connects you with the future of decentralized finance.
            </p>
            <div className="flex space-x-4">
              <button className="border border-sfc-cream/20 text-sfc-cream hover:bg-sfc-gold/20 px-4 py-2 rounded-lg transition-colors">
                Twitter
              </button>
              <button className="border border-sfc-cream/20 text-sfc-cream hover:bg-sfc-gold/20 px-4 py-2 rounded-lg transition-colors">
                Discord
              </button>
              <button className="border border-sfc-cream/20 text-sfc-cream hover:bg-sfc-gold/20 px-4 py-2 rounded-lg transition-colors">
                Telegram
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sfc-cream font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sfc-cream/80">
              <li>
                <a href="#" className="hover:text-sfc-gold transition-colors">
                  Swap
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sfc-gold transition-colors">
                  Liquidity
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sfc-gold transition-colors">
                  Farming
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sfc-gold transition-colors">
                  Staking
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sfc-cream font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sfc-cream/80">
              <li>
                <a href="#" className="hover:text-sfc-gold transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/faq')}
                  className="hover:text-sfc-gold transition-colors text-left"
                >
                  🛡️ Anti-Scam FAQ
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-sfc-gold transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sfc-gold transition-colors">
                  Bug Report
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}