import React from 'react';
import { AvatarConfig } from './constants';

interface AvatarFaceProps {
  config: AvatarConfig;
}

export function AvatarFace({ config }: AvatarFaceProps) {
  const renderEyes = () => {
    switch (config.eyes) {
      case 'happy':
        return <g><path d="M36,50 Q40,45 44,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/><path d="M56,50 Q60,45 64,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/></g>;
      case 'glasses':
        return <g><circle cx="40" cy="50" r="7" fill="rgba(255,255,255,0.3)" stroke="black" strokeWidth="2.5"/><circle cx="60" cy="50" r="7" fill="rgba(255,255,255,0.3)" stroke="black" strokeWidth="2.5"/><line x1="47" y1="50" x2="53" y2="50" stroke="black" strokeWidth="2.5"/><circle cx="40" cy="50" r="2" fill="black"/><circle cx="60" cy="50" r="2" fill="black"/></g>;
      case 'wink':
        return <g><ellipse cx="40" cy="50" rx="4" ry="6" fill="black"/><circle cx="42" cy="48" r="1.5" fill="white"/><path d="M56,50 Q60,54 64,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/></g>;
      case 'closed':
        return <g><path d="M36,50 Q40,54 44,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/><path d="M56,50 Q60,54 64,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/></g>;
      case 'angry':
        return <g><path d="M34,44 L46,49" stroke="black" strokeWidth="2.5"/><path d="M66,44 L54,49" stroke="black" strokeWidth="2.5"/><circle cx="40" cy="52" r="3" fill="black"/><circle cx="60" cy="52" r="3" fill="black"/></g>;
      case 'tired':
        return <g><circle cx="40" cy="50" r="3" fill="black"/><circle cx="60" cy="50" r="3" fill="black"/><path d="M35,56 Q40,60 45,56" fill="none" stroke="black" strokeWidth="2" opacity="0.6"/><path d="M55,56 Q60,60 65,56" fill="none" stroke="black" strokeWidth="2" opacity="0.6"/></g>;
      case 'star_struck':
        return <g><path d="M40,46 L42,50 L46,50 L43,53 L44,57 L40,55 L36,57 L37,53 L34,50 L38,50 Z" fill="#F59E0B" stroke="black" strokeWidth="1.5"/><path d="M60,46 L62,50 L66,50 L63,53 L64,57 L60,55 L56,57 L57,53 L54,50 L58,50 Z" fill="#F59E0B" stroke="black" strokeWidth="1.5"/></g>;
      case 'normal':
      default:
        return <g><ellipse cx="40" cy="50" rx="4" ry="6" fill="black"/><ellipse cx="60" cy="50" rx="4" ry="6" fill="black"/><circle cx="42" cy="48" r="1.5" fill="white"/><circle cx="62" cy="48" r="1.5" fill="white"/></g>;
    }
  };

  const renderMouth = () => {
    switch (config.mouth) {
      case 'laugh':
        return <path d="M38,65 Q50,85 62,65 Z" fill="#7f1d1d" stroke="black" strokeWidth="2.5"/>;
      case 'neutral':
        return <line x1="40" y1="68" x2="60" y2="68" stroke="black" strokeWidth="3" strokeLinecap="round"/>;
      case 'surprised':
        return <ellipse cx="50" cy="68" rx="6" ry="8" fill="#7f1d1d" stroke="black" strokeWidth="2.5"/>;
      case 'sad':
        return <path d="M38,75 Q50,62 62,75" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>;
      case 'smirk':
        return <path d="M38,68 Q50,74 62,64" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>;
      case 'tongue':
        return <g><path d="M38,65 Q50,65 62,65" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/><path d="M44,65 Q50,82 56,65" fill="#EF4444" stroke="black" strokeWidth="2"/></g>;
      case 'wavy':
        return <path d="M38,70 Q44,64 50,70 Q56,76 62,70" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>;
      case 'smile':
      default:
        return <path d="M38,65 Q50,78 62,65" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>;
    }
  };

  const renderFacialHair = () => {
    switch (config.facialHair) {
      case 'beard':
        return <path d="M30,60 Q50,90 70,60" fill="none" stroke={config.hairColor} strokeWidth="3" />;
      case 'mustache':
        return <path d="M35,65 Q50,60 65,65" fill="none" stroke={config.hairColor} strokeWidth="4" strokeLinecap="round" />;
      case 'goatee':
        return <path d="M45,75 Q50,85 55,75" fill="none" stroke={config.hairColor} strokeWidth="3" />;
      default:
        return null;
    }
  };

  return (
    <g>
      {/* Face Shape */}
      <ellipse cx="50" cy="50" rx="22" ry="25" fill={config.skinTone} stroke="black" strokeWidth="2.5" />
      
      {/* Blush */}
      <ellipse cx="35" cy="58" rx="3" ry="1.5" fill="#FF0000" opacity="0.3" />
      <ellipse cx="65" cy="58" rx="3" ry="1.5" fill="#FF0000" opacity="0.3" />

      {/* Facial Features */}
      {renderEyes()}
      {renderMouth()}
      {renderFacialHair()}
    </g>
  );
}