import React from 'react';
import { AvatarConfig } from './constants';

interface AvatarAccessoriesProps {
  config: AvatarConfig;
}

export function AvatarAccessories({ config }: AvatarAccessoriesProps) {
  const accColor = config.accessoryColor || config.topColor;

  switch (config.accessories) {
    case 'cap':
      return (
        <g>
          <path d="M25,30 Q50,10 75,30 L85,35 L25,35 Z" fill={accColor} stroke="black" strokeWidth="2.5" />
          <path d="M25,35 Q50,25 75,35" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          <path d="M25,35 L15,38 Q50,45 85,38 L75,35" fill={accColor} opacity="0.8" stroke="black" strokeWidth="2" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M28,35 Q50,5 72,35 L72,40 Q50,30 28,40 Z" fill={accColor} stroke="black" strokeWidth="2.5" />
          <path d="M28,35 Q50,15 72,35" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <rect x="28" y="38" width="44" height="4" rx="1" fill={accColor} stroke="black" strokeWidth="1" />
        </g>
      );
    case 'sunglasses':
      return (
        <g>
          <path d="M32,48 L48,48 L48,55 Q40,60 32,55 Z" fill={accColor} stroke="black" strokeWidth="2" />
          <path d="M52,48 L68,48 L68,55 Q60,60 52,55 Z" fill={accColor} stroke="black" strokeWidth="2" />
          <line x1="48" y1="50" x2="52" y2="50" stroke="black" strokeWidth="3" />
          <line x1="28" y1="50" x2="32" y2="50" stroke="black" strokeWidth="3" />
          <line x1="68" y1="50" x2="72" y2="50" stroke="black" strokeWidth="3" />
          <path d="M34,50 L46,50" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path d="M54,50 L66,50" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M20,50 Q20,10 80,50" fill="none" stroke={accColor} strokeWidth="6" />
          <rect x="15" y="45" width="10" height="20" rx="4" fill={accColor} stroke="black" strokeWidth="2" />
          <rect x="75" y="45" width="10" height="20" rx="4" fill={accColor} stroke="black" strokeWidth="2" />
          <rect x="18" y="48" width="4" height="14" rx="1" fill="rgba(0,0,0,0.2)" />
          <rect x="78" y="48" width="4" height="14" rx="1" fill="rgba(0,0,0,0.2)" />
        </g>
      );
    case 'bandana':
      return (
        <g>
          <path d="M25,35 Q50,25 75,35 L75,25 Q50,15 25,25 Z" fill={accColor} stroke="black" strokeWidth="2.5" />
          <circle cx="35" cy="30" r="1" fill="rgba(255,255,255,0.5)" />
          <circle cx="50" cy="25" r="1" fill="rgba(255,255,255,0.5)" />
          <circle cx="65" cy="30" r="1" fill="rgba(255,255,255,0.5)" />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <path d="M35,75 Q50,85 65,75 L65,90 Q50,100 35,90 Z" fill={accColor} stroke="black" strokeWidth="2" />
          <path d="M35,75 Q50,80 65,75" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <path d="M45,75 L45,90" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <path d="M55,75 L55,90" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        </g>
      );
    case 'necklace':
      return (
        <g>
          <path d="M35,75 Q50,95 65,75" fill="none" stroke={accColor} strokeWidth="3" />
          <circle cx="50" cy="85" r="4" fill={accColor} stroke="black" strokeWidth="1" />
        </g>
      );
    case 'earrings':
      return (
        <g>
          <circle cx="28" cy="55" r="3" fill={accColor} stroke="black" strokeWidth="1" />
          <circle cx="72" cy="55" r="3" fill={accColor} stroke="black" strokeWidth="1" />
          <circle cx="28" cy="55" r="1" fill="rgba(255,255,255,0.5)" />
          <circle cx="72" cy="55" r="1" fill="rgba(255,255,255,0.5)" />
        </g>
      );
    case 'mask':
      return (
        <g>
          <path d="M30,55 Q50,75 70,55 L70,65 Q50,85 30,65 Z" fill={accColor} stroke="black" strokeWidth="2" />
          <path d="M30,55 L25,50" stroke="black" strokeWidth="1" />
          <path d="M70,55 L75,50" stroke="black" strokeWidth="1" />
        </g>
      );
    case 'bowtie':
      return (
        <g>
          <path d="M42,75 L35,70 L35,80 Z" fill={accColor} stroke="black" strokeWidth="1.5" />
          <path d="M58,75 L65,70 L65,80 Z" fill={accColor} stroke="black" strokeWidth="1.5" />
          <circle cx="50" cy="75" r="3" fill={accColor} stroke="black" strokeWidth="1.5" />
        </g>
      );
    case 'flower':
      return (
        <g transform="translate(70, 25)">
          <circle cx="0" cy="0" r="3" fill="#F59E0B" stroke="black" strokeWidth="1" />
          <circle cx="0" cy="-5" r="3" fill={accColor} stroke="black" strokeWidth="1" />
          <circle cx="5" cy="-2" r="3" fill={accColor} stroke="black" strokeWidth="1" />
          <circle cx="3" cy="4" r="3" fill={accColor} stroke="black" strokeWidth="1" />
          <circle cx="-3" cy="4" r="3" fill={accColor} stroke="black" strokeWidth="1" />
          <circle cx="-5" cy="-2" r="3" fill={accColor} stroke="black" strokeWidth="1" />
        </g>
      );
    case 'eyepatch':
      return (
        <g>
          <path d="M35,45 L65,35" stroke="black" strokeWidth="2" />
          <path d="M32,48 L48,48 L48,58 Q40,62 32,58 Z" fill="#1F2937" stroke="black" strokeWidth="1" />
        </g>
      );
    default:
      return null;
  }
}
