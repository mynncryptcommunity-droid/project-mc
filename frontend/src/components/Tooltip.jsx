import { useState } from 'react';

/**
 * Tooltip Component
 * Displays helpful information on hover
 * Positioned in front (z-50) for easy access
 * 
 * Props:
 * - content: string or object with text and link
 * - position: 'top', 'bottom', 'left', 'right' (default: 'top')
 * - icon: string (emoji or text to display)
 * - children: the element that triggers tooltip
 */
const Tooltip = ({ 
  content, 
  position = 'top', 
  icon = '❓',
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Parse content - can be string or object with text and link
  const getText = () => {
    if (typeof content === 'string') return content;
    return content.text || '';
  };

  const getLink = () => {
    if (typeof content === 'object' && content.link) {
      return content.link;
    }
    return null;
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-sfc-navy border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-sfc-navy border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-sfc-navy border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-sfc-navy border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <div className={`relative inline-block group ${className}`}>
      {/* Trigger Element */}
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block cursor-help"
      >
        {children || (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sfc-gold/20 border border-sfc-gold/50 hover:bg-sfc-gold/30 transition-colors text-sfc-gold font-bold text-sm">
            {icon}
          </span>
        )}
      </div>

      {/* Tooltip Content */}
      {isVisible && (
        <div className={`
          absolute ${positionClasses[position]}
          bg-sfc-navy border-2 border-sfc-gold/60 
          rounded-lg p-4 w-max max-w-xs 
          text-sfc-cream text-sm leading-relaxed
          shadow-2xl shadow-sfc-navy/50
          z-50 pointer-events-auto
          animate-fadeIn
        `}>
          {/* Arrow */}
          <div className={`
            absolute w-0 h-0 
            border-4
            ${arrowClasses[position]}
          `}></div>

          {/* Text Content */}
          <p className="whitespace-normal mb-2">
            {getText()}
          </p>

          {/* Link if provided */}
          {getLink() && (
            <a
              href={getLink().url}
              target={getLink().target || '_self'}
              onClick={(e) => {
                if (getLink().onClick) {
                  e.preventDefault();
                  getLink().onClick();
                }
              }}
              className="inline-flex items-center text-sfc-gold hover:text-sfc-cream transition-colors font-semibold mt-2"
            >
              {getLink().text} →
            </a>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Tooltip;
