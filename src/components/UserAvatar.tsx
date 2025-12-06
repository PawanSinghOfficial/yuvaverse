import React from 'react';
import { cn } from "@/lib/utils";

export type AvatarConfig = {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  topStyle: string;
  topColor: string;
  bottomStyle?: string;
  bottomColor?: string;
  accessories: string;
  facialHair: string;
  eyes: string;
  mouth: string;
  backgroundColor: string;
};

interface UserAvatarProps {
  config?: AvatarConfig | null;
  className?: string;
  pose?: "portrait" | "standing" | "cheering" | "thinking" | "typing" | "gaming" | "laptop" | "reading";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

// Simplified SVG paths for demonstration. In a real app, these would be more detailed.
const PATHS = {
  hair: {
    short: "M30,30 Q50,10 70,30 L70,40 Q50,20 30,40 Z",
    long: "M30,30 Q50,10 70,30 L75,80 Q50,90 25,80 Z",
    messy: "M25,35 Q50,5 75,35 L75,45 Q80,30 70,25 Q50,15 30,25 Q20,30 25,45 Z",
    bald: "",
  },
  eyes: {
    normal: <g><circle cx="40" cy="50" r="3" fill="black"/><circle cx="60" cy="50" r="3" fill="black"/></g>,
    happy: <g><path d="M37,50 Q40,47 43,50" fill="none" stroke="black" strokeWidth="2"/><path d="M57,50 Q60,47 63,50" fill="none" stroke="black" strokeWidth="2"/></g>,
    glasses: <g><circle cx="40" cy="50" r="6" fill="none" stroke="black" strokeWidth="1"/><circle cx="60" cy="50" r="6" fill="none" stroke="black" strokeWidth="1"/><line x1="46" y1="50" x2="54" y2="50" stroke="black" strokeWidth="1"/></g>,
    wink: <g><circle cx="40" cy="50" r="3" fill="black"/><path d="M57,50 Q60,53 63,50" fill="none" stroke="black" strokeWidth="2"/></g>,
  },
  mouth: {
    smile: <path d="M40,65 Q50,75 60,65" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>,
    laugh: <path d="M40,65 Q50,80 60,65 Z" fill="white" stroke="black" strokeWidth="1"/>,
    neutral: <line x1="42" y1="68" x2="58" y2="68" stroke="black" strokeWidth="2" strokeLinecap="round"/>,
    surprised: <circle cx="50" cy="68" r="4" fill="none" stroke="black" strokeWidth="2"/>,
  },
  top: {
    tshirt: "M25,80 L75,80 L80,120 L20,120 Z",
    hoodie: "M20,80 Q50,70 80,80 L85,120 L15,120 Z",
    formal: "M25,80 L50,90 L75,80 L75,120 L25,120 Z",
  },
  bottom: {
    jeans: "M25,120 L25,180 L48,180 L48,130 L52,130 L52,180 L75,180 L75,120 Z",
    shorts: "M25,120 L25,150 L48,150 L48,130 L52,130 L52,150 L75,150 L75,120 Z",
    skirt: "M25,120 L20,160 L80,160 L75,120 Z",
  }
};

const COLORS = {
  skin: { light: "#FFDFC4", medium: "#E0AC69", dark: "#8D5524" },
  hair: { black: "#2C2C2C", brown: "#6A4E23", blonde: "#E6CEA8", red: "#A52A2A" },
  clothes: { red: "#EF4444", blue: "#3B82F6", green: "#10B981", black: "#1F2937", white: "#F3F4F6", yellow: "#F59E0B" },
};

export default function UserAvatar({ config, className, pose = "portrait", size = "md" }: UserAvatarProps) {
  if (!config) {
    return (
      <div className={cn("rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold", 
        size === "sm" && "w-8 h-8 text-xs",
        size === "md" && "w-12 h-12 text-sm",
        size === "lg" && "w-24 h-24 text-xl",
        size === "xl" && "w-32 h-32 text-2xl",
        size === "2xl" && "w-48 h-48 text-4xl",
        className
      )}>
        ?
      </div>
    );
  }

  const sizePx = size === "sm" ? 32 : size === "md" ? 48 : size === "lg" ? 96 : size === "xl" ? 128 : 192;
  const viewBox = pose === "portrait" ? "0 0 100 100" : "0 0 100 200";
  
  // Pose transformations
  let bodyTransform = "";
  let headTransform = "";
  let armLeft = <path d="M25,85 L10,100" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
  let armRight = <path d="M75,85 L90,100" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
  let heldItem = null;

  if (pose === "cheering") {
    armLeft = <path d="M25,85 L10,50" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L90,50" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
  } else if (pose === "thinking") {
    armRight = <path d="M75,85 L85,60" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
  } else if (pose === "typing") {
    armLeft = <path d="M25,85 L40,100" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L60,100" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
  } else if (pose === "gaming") {
    armLeft = <path d="M25,85 L40,75" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L60,75" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <rect x="35" y="70" width="30" height="16" rx="4" fill="#374151" />
        <circle cx="40" cy="78" r="2" fill="#EF4444" />
        <circle cx="45" cy="82" r="2" fill="#3B82F6" />
        <circle cx="55" cy="78" r="2" fill="#10B981" />
        <circle cx="60" cy="82" r="2" fill="#F59E0B" />
      </g>
    );
  } else if (pose === "laptop") {
    armLeft = <path d="M25,85 L40,95" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L60,95" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <path d="M20,100 L80,100 L75,90 L25,90 Z" fill="#9CA3AF" />
        <path d="M25,90 L75,90 L75,60 L25,60 Z" fill="#D1D5DB" />
        <path d="M28,63 L72,63 L72,87 L28,87 Z" fill="#3B82F6" />
      </g>
    );
  } else if (pose === "reading") {
    armLeft = <path d="M25,85 L40,75" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L60,75" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <rect x="35" y="65" width="30" height="25" fill="#F3F4F6" stroke="#1F2937" strokeWidth="1" />
        <path d="M35,65 L65,65" stroke="#1F2937" strokeWidth="1" />
        <path d="M40,70 L60,70" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M40,75 L60,75" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M40,80 L60,80" stroke="#9CA3AF" strokeWidth="1" />
      </g>
    );
  }

  return (
    <div 
      className={cn("relative overflow-hidden rounded-full border-2 border-white shadow-sm", className)}
      style={{ 
        backgroundColor: config.backgroundColor,
        width: sizePx,
        height: sizePx,
        borderRadius: pose === "portrait" ? "50%" : "10px"
      }}
    >
      <svg viewBox={viewBox} className="w-full h-full">
        {/* Body Group */}
        <g transform={bodyTransform}>
          {/* Legs (only if not portrait) */}
          {pose !== "portrait" && (
             <path d={PATHS.bottom[config.bottomStyle as keyof typeof PATHS.bottom] || PATHS.bottom.jeans} fill={config.bottomColor} />
          )}

          {/* Torso */}
          <path d={PATHS.top[config.topStyle as keyof typeof PATHS.top] || PATHS.top.tshirt} fill={config.topColor} />
          
          {/* Arms */}
          {armLeft}
          {armRight}
          
          {/* Held Item */}
          {heldItem}

          {/* Neck */}
          <rect x="42" y="70" width="16" height="15" fill={config.skinTone} />

          {/* Head Group */}
          <g transform={headTransform}>
            {/* Face Shape */}
            <ellipse cx="50" cy="50" rx="22" ry="25" fill={config.skinTone} />
            
            {/* Hair (Back) */}
            {/* Simplified: Hair is usually on top, but long hair might be behind. For now, simple layer. */}

            {/* Facial Features */}
            {PATHS.eyes[config.eyes as keyof typeof PATHS.eyes] || PATHS.eyes.normal}
            {PATHS.mouth[config.mouth as keyof typeof PATHS.mouth] || PATHS.mouth.smile}
            
            {/* Facial Hair */}
            {config.facialHair === "beard" && (
               <path d="M30,60 Q50,90 70,60" fill="none" stroke="#2C2C2C" strokeWidth="2" />
            )}

            {/* Hair (Front) */}
            <path d={PATHS.hair[config.hairStyle as keyof typeof PATHS.hair] || PATHS.hair.short} fill={config.hairColor} />

            {/* Accessories */}
            {config.accessories === "cap" && (
               <path d="M25,30 Q50,10 75,30 L85,35 L25,35 Z" fill={config.topColor} />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}