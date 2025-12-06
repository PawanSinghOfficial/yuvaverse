import React from 'react';
import { AvatarConfig, PATHS } from './constants';

interface AvatarHairProps {
  config: AvatarConfig;
}

export function AvatarHair({ config }: AvatarHairProps) {
  const hairPath = PATHS.hair[config.hairStyle as keyof typeof PATHS.hair] || PATHS.hair.short;
  
  return (
    <g>
      <path d={hairPath} fill={config.hairColor} stroke="black" strokeWidth="2.5" />
      {/* Simple highlight */}
      <path d={hairPath} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" transform="translate(2, 2) scale(0.9)" style={{ clipPath: `path('${hairPath}')` }} />
    </g>
  );
}
