import React from 'react';
import { AvatarConfig, PATHS } from './constants';

interface AvatarHairProps {
  config: AvatarConfig;
  layer?: 'front' | 'back';
}

export function AvatarHair({ config, layer = 'front' }: AvatarHairProps) {
  const styleKey = config.hairStyle as keyof typeof PATHS.hairFront;
  
  // Select path based on layer
  const hairPath = layer === 'front' 
    ? (PATHS.hairFront[styleKey] || PATHS.hairFront.short)
    : (PATHS.hairBack[styleKey] || "");
  
  if (!hairPath) return null;

  return (
    <g>
      <path d={hairPath} fill={config.hairColor} stroke="black" strokeWidth="2.5" />
      {/* Simple highlight only for front layer */}
      {layer === 'front' && (
        <path d={hairPath} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" transform="translate(2, 2) scale(0.9)" style={{ clipPath: `path('${hairPath}')` }} />
      )}
    </g>
  );
}