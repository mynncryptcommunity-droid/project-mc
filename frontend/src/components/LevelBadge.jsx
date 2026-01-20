/**
 * LevelBadge Component - Display level with mining theme
 * Shows level icon, name, and disclaimer text
 */

import React from 'react';
import { getLevelInfo, LEVEL_DISCLAIMER } from '../config/levelNamesConfig';

const LevelBadge = ({ 
  levelNumber, 
  showIcon = true, 
  showDisclaimer = true,
  size = 'medium',
  variant = 'default'
}) => {
  const levelInfo = getLevelInfo(levelNumber);

  if (!levelInfo) {
    return <span className="text-red-500">Invalid Level</span>;
  }

  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-3 py-2',
    large: 'text-lg px-4 py-3'
  };

  const variantClasses = {
    default: 'bg-opacity-10 border-opacity-50',
    solid: 'bg-opacity-90 border-opacity-100',
    outline: 'bg-transparent border-opacity-100',
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Level Badge */}
      <div
        className={`
          inline-flex items-center gap-2 rounded-lg border-2 
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
        style={{
          backgroundColor: `${levelInfo.color}20`,
          borderColor: levelInfo.color,
          color: levelInfo.color
        }}
      >
        {showIcon && <span className="text-xl">{levelInfo.icon}</span>}
        <span className="font-semibold">{levelInfo.name}</span>
        {levelInfo.isStreamA && (
          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">
            Stream A
          </span>
        )}
        {levelInfo.isStreamB && (
          <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded">
            Stream B
          </span>
        )}
      </div>

      {/* Description */}
      {levelInfo.description && (
        <p className="text-xs text-gray-400 italic">
          {levelInfo.description}
        </p>
      )}

      {/* Disclaimer */}
      {showDisclaimer && (
        <p className="text-xs text-yellow-600 opacity-70 border-l-2 border-yellow-600 pl-2 mt-1">
          ⚠️ {LEVEL_DISCLAIMER}
        </p>
      )}
    </div>
  );
};

export default LevelBadge;
