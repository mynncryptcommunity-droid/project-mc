/**
 * LevelDisclaimerBanner Component
 * Display the level disclaimer prominently in the dashboard
 */

import React from 'react';
import { getLevelDisclaimer } from '../config/dashboardTooltipsConfig';

const LevelDisclaimerBanner = ({ 
  className = '',
  position = 'top',
  variant = 'warning'
}) => {
  const disclaimer = getLevelDisclaimer();

  const variantClasses = {
    warning: 'bg-yellow-900/20 border-l-4 border-yellow-600 text-yellow-600',
    info: 'bg-blue-900/20 border-l-4 border-blue-600 text-blue-600',
    neutral: 'bg-gray-900/20 border-l-4 border-gray-600 text-gray-600'
  };

  return (
    <div
      className={`
        p-3 rounded-r-lg flex items-start gap-3 
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
      <div className="flex-1">
        <p className="text-sm font-medium">
          {disclaimer}
        </p>
      </div>
    </div>
  );
};

export default LevelDisclaimerBanner;
