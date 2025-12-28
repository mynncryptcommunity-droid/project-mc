import { useState, useEffect } from 'react';
import './GooeyNav.css';

export default function GooeyNav({ items, initialActiveIndex, colors, onNavLinkClick, onJoinNowClick }) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex || 0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateFilter = () => {
      const filter = document.querySelector('#gooey-filter');
      if (filter) {
        const blur = isHovering ? "6" : "3";
        const matrix = isHovering ? "18 -7" : "19 -9";
        filter.querySelector('feGaussianBlur').setAttribute('stdDeviation', blur);
        const values = filter.querySelector('feColorMatrix').getAttribute('values').split(' ');
        values[values.length - 2] = matrix.split(' ')[0];
        values[values.length - 1] = matrix.split(' ')[1];
        filter.querySelector('feColorMatrix').setAttribute('values', values.join(' '));
      }
    };
    updateFilter();
  }, [isHovering]);

  return (
    <div className="gooey-nav">
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div 
        className="gooey-nav-items" 
        style={{ 
          filter: 'url(#gooey-filter)',
          background: colors?.background || 'rgba(24,59,78,0.5)'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {items.map((item, index) => 
        item.isJoinNow ? (
          <button
              key={index}
              className="gooey-nav-item join-now-link"
              onClick={onJoinNowClick}
              type="button"
              style={{
                '--active-color': colors?.active || '#DDA853',
                '--text-color': colors?.text || '#F3F3E0'
              }}
            >
              {item.label}
            </button>
          ) : (
          <a
            key={index}
            href={item.href}
            className={`gooey-nav-item ${index === activeIndex ? 'active' : ''}`}
            onClick={(e) => {
              if (item.href.startsWith('#')) {
                e.preventDefault();
                const element = document.querySelector(item.href);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }
              setActiveIndex(index);
              if (onNavLinkClick) {
                onNavLinkClick();
              }
            }}
            style={{
              '--active-color': colors?.active || '#DDA853',
              '--text-color': colors?.text || '#F3F3E0'
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}