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
  pose?: "portrait" | "standing" | "cheering" | "thinking" | "typing" | "gaming" | "laptop" | "reading" | "sleeping" | "confused" | "winning" | "listening" | "waving" | "thumbs_up" | "holding_phone" | "crossed_arms";
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
    closed: <g><path d="M37,50 Q40,53 43,50" fill="none" stroke="black" strokeWidth="2"/><path d="M57,50 Q60,53 63,50" fill="none" stroke="black" strokeWidth="2"/></g>,
    angry: <g><path d="M35,45 L45,50" stroke="black" strokeWidth="2"/><path d="M65,45 L55,50" stroke="black" strokeWidth="2"/><circle cx="40" cy="52" r="2" fill="black"/><circle cx="60" cy="52" r="2" fill="black"/></g>,
  },
  mouth: {
    smile: <path d="M40,65 Q50,75 60,65" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>,
    laugh: <path d="M40,65 Q50,80 60,65 Z" fill="white" stroke="black" strokeWidth="1"/>,
    neutral: <line x1="42" y1="68" x2="58" y2="68" stroke="black" strokeWidth="2" strokeLinecap="round"/>,
    surprised: <circle cx="50" cy="68" r="4" fill="none" stroke="black" strokeWidth="2"/>,
    sad: <path d="M40,75 Q50,65 60,75" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>,
    smirk: <path d="M40,68 Q50,72 60,65" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>,
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
        <path d="M20,100 L80,100 L75,90 L25,90 Z" fill="#4B5563" />
        <path d="M25,90 L75,90 L75,60 L25,60 Z" fill="#9CA3AF" />
        {/* Laptop Logo */}
        <circle cx="50" cy="75" r="4" fill="#E5E7EB" />
        <path d="M50,71 L50,68" stroke="#E5E7EB" strokeWidth="1" />
      </g>
    );
  } else if (pose === "reading") {
    armLeft = <path d="M25,85 L40,75" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L60,75" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <path d="M35,65 L50,70 L65,65 L65,85 L50,90 L35,85 Z" fill="#F3F4F6" stroke="#1F2937" strokeWidth="1" />
        <path d="M50,70 L50,90" stroke="#1F2937" strokeWidth="1" />
        <path d="M38,70 L48,73" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M38,75 L48,78" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M52,73 L62,70" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M52,78 L62,75" stroke="#9CA3AF" strokeWidth="1" />
      </g>
    );
  } else if (pose === "sleeping") {
    armLeft = <path d="M25,85 L40,95" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L60,95" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <text x="70" y="40" fontSize="20" fill="#3B82F6" style={{ opacity: 0.7 }}>Z</text>
        <text x="80" y="30" fontSize="14" fill="#3B82F6" style={{ opacity: 0.5 }}>z</text>
      </g>
    );
  } else if (pose === "confused") {
    armLeft = <path d="M25,85 L15,100" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L85,50" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>; // Scratching head
    heldItem = (
      <text x="85" y="40" fontSize="24" fill="#F59E0B" fontWeight="bold">?</text>
    );
  } else if (pose === "winning") {
    armLeft = <path d="M25,85 L15,50" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L90,50" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <path d="M35,40 L65,40 L55,70 L45,70 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1"/>
        <path d="M35,40 Q25,45 35,55" fill="none" stroke="#F59E0B" strokeWidth="2"/>
        <path d="M65,40 Q75,45 65,55" fill="none" stroke="#F59E0B" strokeWidth="2"/>
        <rect x="42" y="70" width="16" height="5" fill="#78350F" />
      </g>
    );
  } else if (pose === "listening") {
    armLeft = <path d="M25,85 L15,100" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L90,100" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <path d="M30,50 Q50,20 70,50" fill="none" stroke="#374151" strokeWidth="4" />
        <rect x="25" y="45" width="10" height="15" rx="2" fill="#1F2937" />
        <rect x="65" y="45" width="10" height="15" rx="2" fill="#1F2937" />
      </g>
    );
  } else if (pose === "waving") {
    armRight = <path d="M75,85 L95,35" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <path d="M90,30 Q100,20 110,30" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.6" />
        <path d="M95,35 Q105,25 115,35" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.4" />
      </g>
    );
  } else if (pose === "thumbs_up") {
    armRight = <path d="M75,85 L95,75" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <g>
        <path d="M95,75 L95,65" stroke={config.skinTone} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="95" cy="65" r="2" fill={config.skinTone} />
      </g>
    );
  } else if (pose === "holding_phone") {
    armRight = <path d="M75,85 L85,65" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    heldItem = (
      <rect x="80" y="55" width="10" height="18" rx="1" fill="#1F2937" transform="rotate(-15 85 64)" />
    );
  } else if (pose === "crossed_arms") {
    armLeft = <path d="M25,85 L75,85" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
    armRight = <path d="M75,85 L25,85" stroke={config.skinTone} strokeWidth="8" strokeLinecap="round"/>;
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
            {config.accessories === "beanie" && (
               <path d="M28,35 Q50,5 72,35 L72,40 Q50,30 28,40 Z" fill={config.topColor} />
            )}
            {config.accessories === "sunglasses" && (
               <g>
                 <path d="M32,48 L48,48 L48,55 Q40,60 32,55 Z" fill="#1F2937" />
                 <path d="M52,48 L68,48 L68,55 Q60,60 52,55 Z" fill="#1F2937" />
                 <line x1="48" y1="50" x2="52" y2="50" stroke="#1F2937" strokeWidth="2" />
                 <line x1="28" y1="50" x2="32" y2="50" stroke="#1F2937" strokeWidth="2" />
                 <line x1="68" y1="50" x2="72" y2="50" stroke="#1F2937" strokeWidth="2" />
               </g>
            )}
            {config.accessories === "headphones" && (
               <g>
                 <path d="M20,50 Q20,10 80,50" fill="none" stroke="#374151" strokeWidth="4" />
                 <rect x="15" y="45" width="10" height="20" rx="4" fill="#1F2937" />
                 <rect x="75" y="45" width="10" height="20" rx="4" fill="#1F2937" />
               </g>
            )}
            {config.accessories === "bandana" && (
               <path d="M25,35 Q50,25 75,35 L75,25 Q50,15 25,25 Z" fill="#EF4444" />
            )}
            {config.accessories === "scarf" && (
               <path d="M35,75 Q50,85 65,75 L65,90 Q50,100 35,90 Z" fill="#D97706" />
            )}
            {config.accessories === "necklace" && (
               <path d="M35,75 Q50,95 65,75" fill="none" stroke="#F59E0B" strokeWidth="2" />
            )}
            {config.accessories === "earrings" && (
               <g>
                 <circle cx="28" cy="55" r="2" fill="#F59E0B" />
                 <circle cx="72" cy="55" r="2" fill="#F59E0B" />
               </g>
            )}
            {config.accessories === "mask" && (
               <path d="M30,55 Q50,75 70,55 L70,65 Q50,85 30,65 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}