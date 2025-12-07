import React from 'react';
import { AvatarConfig, PATHS } from './constants';

interface AvatarFaceProps {
  config: AvatarConfig;
}

export function AvatarFace({ config }: AvatarFaceProps) {
  const renderEyes = () => {
    // Common eye style: White sclera + colored iris + black pupil + highlight
    const Eye = ({ cx, cy, type }: { cx: number, cy: number, type: string }) => (
      <g>
        {/* Sclera (White part) */}
        <ellipse cx={cx} cy={cy} rx="6" ry="4" fill="white" stroke="none" />
        
        {/* Iris (Colored part - defaulting to dark brown/black for now, could be configurable) */}
        <circle cx={cx} cy={cy} r="2.5" fill="#3E2723" />
        
        {/* Pupil */}
        <circle cx={cx} cy={cy} r="1.2" fill="black" />
        
        {/* Highlight */}
        <circle cx={cx - 1.5} cy={cy - 1.5} r="0.8" fill="white" opacity="0.8" />
        
        {/* Eyelashes/Lids based on type */}
        {type === 'happy' && <path d={`M${cx-6},${cy} Q${cx},${cy-5} ${cx+6},${cy}`} fill="none" stroke="black" strokeWidth="1.5" />}
        {type === 'tired' && <path d={`M${cx-6},${cy+2} Q${cx},${cy+5} ${cx+6},${cy+2}`} fill="none" stroke="black" strokeWidth="1" opacity="0.5" />}
      </g>
    );

    switch (config.eyes) {
      case 'happy':
        return <g>
          <path d="M34,48 Q40,42 46,48" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M54,48 Q60,42 66,48" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
        </g>;
      case 'glasses':
        return <g>
          <Eye cx={40} cy={48} type="normal" />
          <Eye cx={60} cy={48} type="normal" />
          <circle cx="40" cy="48" r="8" fill="rgba(255,255,255,0.2)" stroke="black" strokeWidth="2"/>
          <circle cx="60" cy="48" r="8" fill="rgba(255,255,255,0.2)" stroke="black" strokeWidth="2"/>
          <line x1="48" y1="48" x2="52" y2="48" stroke="black" strokeWidth="2"/>
        </g>;
      case 'wink':
        return <g>
          <Eye cx={40} cy={48} type="normal" />
          <path d="M54,48 Q60,52 66,48" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
        </g>;
      case 'closed':
        return <g>
          <path d="M34,50 Q40,54 46,50" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M54,50 Q60,54 66,50" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
        </g>;
      case 'angry':
        return <g>
          <path d="M34,44 L46,49" stroke="black" strokeWidth="2"/>
          <path d="M66,44 L54,49" stroke="black" strokeWidth="2"/>
          <Eye cx={40} cy={50} type="normal" />
          <Eye cx={60} cy={50} type="normal" />
        </g>;
      case 'star_struck':
        return <g>
          <path d="M40,46 L42,50 L46,50 L43,53 L44,57 L40,55 L36,57 L37,53 L34,50 L38,50 Z" fill="#F59E0B" stroke="black" strokeWidth="1"/>
          <path d="M60,46 L62,50 L66,50 L63,53 L64,57 L60,55 L56,57 L57,53 L54,50 L58,50 Z" fill="#F59E0B" stroke="black" strokeWidth="1"/>
        </g>;
      case 'normal':
      default:
        return <g>
          <Eye cx={40} cy={48} type="normal" />
          <Eye cx={60} cy={48} type="normal" />
          {/* Eyebrows */}
          <path d="M35,42 Q40,40 45,42" fill="none" stroke="black" strokeWidth="1.5" opacity="0.6" />
          <path d="M55,42 Q60,40 65,42" fill="none" stroke="black" strokeWidth="1.5" opacity="0.6" />
        </g>;
    }
  };

  const renderMouth = () => {
    switch (config.mouth) {
      case 'laugh':
        return <g>
          <path d="M35,68 Q50,85 65,68 Z" fill="#7f1d1d" stroke="black" strokeWidth="1.5"/>
          <path d="M38,68 Q50,75 62,68" fill="white" /> {/* Teeth */}
          <path d="M45,78 Q50,82 55,78" fill="#EF4444" opacity="0.7" /> {/* Tongue */}
        </g>;
      case 'neutral':
        return <path d="M40,72 Q50,72 60,72" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>;
      case 'surprised':
        return <ellipse cx="50" cy="72" rx="5" ry="7" fill="#7f1d1d" stroke="black" strokeWidth="1.5"/>;
      case 'sad':
        return <path d="M38,78 Q50,68 62,78" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>;
      case 'smirk':
        return <path d="M38,72 Q50,76 62,68" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>;
      case 'tongue':
        return <g>
          <path d="M38,70 Q50,70 62,70" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          <path d="M46,70 Q50,82 54,70" fill="#EF4444" stroke="black" strokeWidth="1.5"/>
        </g>;
      case 'wavy':
        return <path d="M38,72 Q44,68 50,72 Q56,76 62,72" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>;
      case 'smile':
      default:
        return <path d="M38,68 Q50,80 62,68" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>;
    }
  };

  const renderFacialHair = () => {
    switch (config.facialHair) {
      case 'beard':
        return <path d="M30,60 Q30,85 50,95 Q70,85 70,60" fill="none" stroke={config.hairColor} strokeWidth="3" strokeLinecap="round" />;
      case 'mustache':
        return <path d="M38,64 Q50,60 62,64" fill="none" stroke={config.hairColor} strokeWidth="3" strokeLinecap="round" />;
      case 'goatee':
        return <path d="M46,80 Q50,88 54,80" fill="none" stroke={config.hairColor} strokeWidth="3" strokeLinecap="round" />;
      default:
        return null;
    }
  };

  return (
    <g>
      {/* Face Shape - Simple Round */}
      <rect x="22" y="15" width="56" height="70" rx="28" fill={config.skinTone} stroke="black" strokeWidth="2.5" />
      
      {/* Ears */}
      <path d="M22,45 Q16,40 16,50 Q16,60 22,55" fill={config.skinTone} stroke="black" strokeWidth="2.5" />
      <path d="M78,45 Q84,40 84,50 Q84,60 78,55" fill={config.skinTone} stroke="black" strokeWidth="2.5" />

      {/* Blush */}
      <ellipse cx="32" cy="58" rx="5" ry="3" fill="#FF0000" opacity="0.2" />
      <ellipse cx="68" cy="58" rx="5" ry="3" fill="#FF0000" opacity="0.2" />

      {/* Nose */}
      <path d="M45,55 Q50,60 55,55" fill="none" stroke="black" strokeWidth="2" opacity="0.6" />

      {/* Facial Features */}
      {renderEyes()}
      {renderMouth()}
      {renderFacialHair()}
    </g>
  );
}