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
  accessoryColor?: string;
  facialHair: string;
  eyes: string;
  mouth: string;
  backgroundColor: string;
};

interface UserAvatarProps {
  config?: AvatarConfig | null;
  className?: string;
  pose?: "portrait" | "standing" | "cheering" | "thinking" | "typing" | "gaming" | "laptop" | "reading" | "sleeping" | "confused" | "winning" | "listening" | "waving" | "thumbs_up" | "holding_phone" | "crossed_arms" | "shrugging" | "pointing" | "meditating" | "taking_photo";
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
    normal: <g><ellipse cx="40" cy="50" rx="4" ry="6" fill="black"/><ellipse cx="60" cy="50" rx="4" ry="6" fill="black"/><circle cx="42" cy="48" r="1.5" fill="white"/><circle cx="62" cy="48" r="1.5" fill="white"/></g>,
    happy: <g><path d="M36,50 Q40,45 44,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/><path d="M56,50 Q60,45 64,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/></g>,
    glasses: <g><circle cx="40" cy="50" r="7" fill="rgba(255,255,255,0.3)" stroke="black" strokeWidth="2.5"/><circle cx="60" cy="50" r="7" fill="rgba(255,255,255,0.3)" stroke="black" strokeWidth="2.5"/><line x1="47" y1="50" x2="53" y2="50" stroke="black" strokeWidth="2.5"/><circle cx="40" cy="50" r="2" fill="black"/><circle cx="60" cy="50" r="2" fill="black"/></g>,
    wink: <g><ellipse cx="40" cy="50" rx="4" ry="6" fill="black"/><circle cx="42" cy="48" r="1.5" fill="white"/><path d="M56,50 Q60,54 64,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/></g>,
    closed: <g><path d="M36,50 Q40,54 44,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/><path d="M56,50 Q60,54 64,50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/></g>,
    angry: <g><path d="M34,44 L46,49" stroke="black" strokeWidth="2.5"/><path d="M66,44 L54,49" stroke="black" strokeWidth="2.5"/><circle cx="40" cy="52" r="3" fill="black"/><circle cx="60" cy="52" r="3" fill="black"/></g>,
    tired: <g><circle cx="40" cy="50" r="3" fill="black"/><circle cx="60" cy="50" r="3" fill="black"/><path d="M35,56 Q40,60 45,56" fill="none" stroke="black" strokeWidth="2" opacity="0.6"/><path d="M55,56 Q60,60 65,56" fill="none" stroke="black" strokeWidth="2" opacity="0.6"/></g>,
    star_struck: <g><path d="M40,46 L42,50 L46,50 L43,53 L44,57 L40,55 L36,57 L37,53 L34,50 L38,50 Z" fill="#F59E0B" stroke="black" strokeWidth="1.5"/><path d="M60,46 L62,50 L66,50 L63,53 L64,57 L60,55 L56,57 L57,53 L54,50 L58,50 Z" fill="#F59E0B" stroke="black" strokeWidth="1.5"/></g>,
  },
  mouth: {
    smile: <path d="M38,65 Q50,78 62,65" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>,
    laugh: <path d="M38,65 Q50,85 62,65 Z" fill="#7f1d1d" stroke="black" strokeWidth="2.5"/>,
    neutral: <line x1="40" y1="68" x2="60" y2="68" stroke="black" strokeWidth="3" strokeLinecap="round"/>,
    surprised: <ellipse cx="50" cy="68" rx="6" ry="8" fill="#7f1d1d" stroke="black" strokeWidth="2.5"/>,
    sad: <path d="M38,75 Q50,62 62,75" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>,
    smirk: <path d="M38,68 Q50,74 62,64" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>,
    tongue: <g><path d="M38,65 Q50,65 62,65" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/><path d="M44,65 Q50,82 56,65" fill="#EF4444" stroke="black" strokeWidth="2"/></g>,
    wavy: <path d="M38,70 Q44,64 50,70 Q56,76 62,70" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>,
  },
  top: {
    tshirt: "M25,80 L75,80 L80,120 L20,120 Z",
    hoodie: "M20,80 Q50,70 80,80 L85,120 L15,120 Z",
    formal: "M25,80 L50,90 L75,80 L75,120 L25,120 Z",
    blazer: "M25,80 L50,100 L75,80 L80,120 L20,120 Z",
    sweater: "M22,80 Q50,75 78,80 L82,120 L18,120 Z",
  },
  bottom: {
    jeans: "M25,120 L25,180 L48,180 L48,130 L52,130 L52,180 L75,180 L75,120 Z",
    shorts: "M25,120 L25,150 L48,150 L48,130 L52,130 L52,150 L75,150 L75,120 Z",
    skirt: "M25,120 L20,160 L80,160 L75,120 Z",
    sweatpants: "M25,120 L22,180 L48,180 L48,135 L52,135 L52,180 L78,180 L75,120 Z",
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
  const accColor = config.accessoryColor || config.topColor; // Fallback to top color if not set
  
  // Pose transformations
  let bodyTransform = "";
  let headTransform = "";
  let armLeft = <path d="M25,85 L10,100" stroke={config.skinTone} strokeWidth="10" strokeLinecap="round" className="drop-shadow-sm"/>;
  let armRight = <path d="M75,85 L90,100" stroke={config.skinTone} strokeWidth="10" strokeLinecap="round" className="drop-shadow-sm"/>;
  let heldItem = null;

  // Helper for arms with outline
  const Arm = ({ d }: { d: string }) => (
    <g>
      <path d={d} stroke="black" strokeWidth="14" strokeLinecap="round" />
      <path d={d} stroke={config.skinTone} strokeWidth="10" strokeLinecap="round" />
    </g>
  );

  // Redefine arms using the helper for cartoon outline effect
  armLeft = <Arm d="M25,85 L10,100" />;
  armRight = <Arm d="M75,85 L90,100" />;

  if (pose === "cheering") {
    armLeft = <Arm d="M25,85 L10,50" />;
    armRight = <Arm d="M75,85 L90,50" />;
  } else if (pose === "thinking") {
    armRight = <Arm d="M75,85 L85,60" />;
  } else if (pose === "typing") {
    armLeft = <Arm d="M25,85 L40,100" />;
    armRight = <Arm d="M75,85 L60,100" />;
  } else if (pose === "gaming") {
    armLeft = <Arm d="M25,85 L40,75" />;
    armRight = <Arm d="M75,85 L60,75" />;
    heldItem = (
      <g>
        <rect x="35" y="70" width="30" height="16" rx="4" fill="#374151" stroke="black" strokeWidth="2" />
        <circle cx="40" cy="78" r="2" fill="#EF4444" />
        <circle cx="45" cy="82" r="2" fill="#3B82F6" />
        <circle cx="55" cy="78" r="2" fill="#10B981" />
        <circle cx="60" cy="82" r="2" fill="#F59E0B" />
      </g>
    );
  } else if (pose === "laptop") {
    armLeft = <Arm d="M25,85 L40,95" />;
    armRight = <Arm d="M75,85 L60,95" />;
    heldItem = (
      <g>
        <path d="M20,100 L80,100 L75,90 L25,90 Z" fill="#4B5563" stroke="black" strokeWidth="2" />
        <path d="M25,90 L75,90 L75,60 L25,60 Z" fill="#9CA3AF" stroke="black" strokeWidth="2" />
        {/* Laptop Logo */}
        <circle cx="50" cy="75" r="4" fill="#E5E7EB" />
        <path d="M50,71 L50,68" stroke="#E5E7EB" strokeWidth="1" />
      </g>
    );
  } else if (pose === "reading") {
    armLeft = <Arm d="M25,85 L40,75" />;
    armRight = <Arm d="M75,85 L60,75" />;
    heldItem = (
      <g>
        <path d="M35,65 L50,70 L65,65 L65,85 L50,90 L35,85 Z" fill="#F3F4F6" stroke="black" strokeWidth="2" />
        <path d="M50,70 L50,90" stroke="black" strokeWidth="1" />
        <path d="M38,70 L48,73" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M38,75 L48,78" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M52,73 L62,70" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M52,78 L62,75" stroke="#9CA3AF" strokeWidth="1" />
      </g>
    );
  } else if (pose === "sleeping") {
    armLeft = <Arm d="M25,85 L40,95" />;
    armRight = <Arm d="M75,85 L60,95" />;
    heldItem = (
      <g>
        <text x="70" y="40" fontSize="20" fill="#3B82F6" style={{ opacity: 0.7 }} fontWeight="bold">Z</text>
        <text x="80" y="30" fontSize="14" fill="#3B82F6" style={{ opacity: 0.5 }} fontWeight="bold">z</text>
      </g>
    );
  } else if (pose === "confused") {
    armLeft = <Arm d="M25,85 L15,100" />;
    armRight = <Arm d="M75,85 L85,50" />; // Scratching head
    heldItem = (
      <text x="85" y="40" fontSize="24" fill="#F59E0B" fontWeight="bold" stroke="black" strokeWidth="1">?</text>
    );
  } else if (pose === "winning") {
    armLeft = <Arm d="M25,85 L15,50" />;
    armRight = <Arm d="M75,85 L90,50" />;
    heldItem = (
      <g>
        <path d="M35,40 L65,40 L55,70 L45,70 Z" fill="#F59E0B" stroke="black" strokeWidth="2" />
        <path d="M35,40 Q25,45 35,55" fill="none" stroke="#F59E0B" strokeWidth="2" />
        <path d="M65,40 Q75,45 65,55" fill="none" stroke="#F59E0B" strokeWidth="2" />
        <rect x="42" y="70" width="16" height="5" fill="#78350F" stroke="black" strokeWidth="1" />
      </g>
    );
  } else if (pose === "listening") {
    armLeft = <Arm d="M25,85 L15,100" />;
    armRight = <Arm d="M75,85 L90,100" />;
    heldItem = (
      <g>
        <path d="M30,50 Q50,20 70,50" fill="none" stroke="#374151" strokeWidth="4" />
        <rect x="25" y="45" width="10" height="15" rx="2" fill="#1F2937" stroke="black" strokeWidth="1" />
        <rect x="65" y="45" width="10" height="15" rx="2" fill="#1F2937" stroke="black" strokeWidth="1" />
      </g>
    );
  } else if (pose === "waving") {
    armRight = <Arm d="M75,85 L95,35" />;
    heldItem = (
      <g>
        <path d="M90,30 Q100,20 110,30" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.6" />
        <path d="M95,35 Q105,25 115,35" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.4" />
      </g>
    );
  } else if (pose === "thumbs_up") {
    armRight = <Arm d="M75,85 L95,75" />;
    heldItem = (
      <g>
        <path d="M95,75 L95,65" stroke={config.skinTone} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="95" cy="65" r="3" fill={config.skinTone} stroke="black" strokeWidth="1" />
      </g>
    );
  } else if (pose === "holding_phone") {
    armRight = <Arm d="M75,85 L85,65" />;
    heldItem = (
      <rect x="80" y="55" width="10" height="18" rx="1" fill="#1F2937" transform="rotate(-15 85 64)" stroke="black" strokeWidth="1" />
    );
  } else if (pose === "crossed_arms") {
    armLeft = <Arm d="M25,85 L75,85" />;
    armRight = <Arm d="M75,85 L25,85" />;
  } else if (pose === "shrugging") {
    armLeft = <Arm d="M25,85 L10,75" />;
    armRight = <Arm d="M75,85 L90,75" />;
    heldItem = (
      <g>
        <path d="M10,75 L15,70" stroke={config.skinTone} strokeWidth="4" strokeLinecap="round"/>
        <path d="M90,75 L85,70" stroke={config.skinTone} strokeWidth="4" strokeLinecap="round"/>
      </g>
    );
  } else if (pose === "pointing") {
    armRight = <Arm d="M75,85 L95,50" />;
    heldItem = (
      <g>
        <path d="M95,50 L100,40" stroke={config.skinTone} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="100" cy="40" r="3" fill={config.skinTone} stroke="black" strokeWidth="1" />
      </g>
    );
  } else if (pose === "meditating") {
    armLeft = <Arm d="M25,85 L40,95" />;
    armRight = <Arm d="M75,85 L60,95" />;
    heldItem = (
      <g>
        <circle cx="40" cy="95" r="4" fill={config.skinTone} stroke="black" strokeWidth="1" />
        <circle cx="60" cy="95" r="4" fill={config.skinTone} stroke="black" strokeWidth="1" />
      </g>
    );
  } else if (pose === "taking_photo") {
    armLeft = <Arm d="M25,85 L40,65" />;
    armRight = <Arm d="M75,85 L60,65" />;
    heldItem = (
      <g>
        <rect x="35" y="55" width="30" height="20" rx="2" fill="#1F2937" stroke="black" strokeWidth="1" />
        <circle cx="50" cy="65" r="6" fill="#374151" stroke="#4B5563" strokeWidth="2" />
        <rect x="55" y="52" width="6" height="3" fill="#EF4444" />
      </g>
    );
  }

  return (
    <div 
      className={cn("relative overflow-hidden rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", className)}
      style={{ 
        backgroundColor: config.backgroundColor,
        width: sizePx,
        height: sizePx,
        borderRadius: pose === "portrait" ? "50%" : "16px"
      }}
    >
      <svg viewBox={viewBox} className="w-full h-full">
        {/* Body Group */}
        <g transform={bodyTransform}>
          {/* Legs (only if not portrait) */}
          {pose !== "portrait" && (
             <path d={PATHS.bottom[config.bottomStyle as keyof typeof PATHS.bottom] || PATHS.bottom.jeans} fill={config.bottomColor} stroke="black" strokeWidth="2.5" />
          )}

          {/* Torso */}
          <path d={PATHS.top[config.topStyle as keyof typeof PATHS.top] || PATHS.top.tshirt} fill={config.topColor} stroke="black" strokeWidth="2.5" />
          
          {/* Arms */}
          {armLeft}
          {armRight}
          
          {/* Held Item */}
          {heldItem}

          {/* Neck */}
          <rect x="42" y="70" width="16" height="15" fill={config.skinTone} stroke="black" strokeWidth="2.5" />

          {/* Head Group */}
          <g transform={headTransform}>
            {/* Face Shape */}
            <ellipse cx="50" cy="50" rx="22" ry="25" fill={config.skinTone} stroke="black" strokeWidth="2.5" />
            
            {/* Hair (Back) */}
            {/* Simplified: Hair is usually on top, but long hair might be behind. For now, simple layer. */}

            {/* Facial Features */}
            {PATHS.eyes[config.eyes as keyof typeof PATHS.eyes] || PATHS.eyes.normal}
            {PATHS.mouth[config.mouth as keyof typeof PATHS.mouth] || PATHS.mouth.smile}
            
            {/* Facial Hair */}
            {config.facialHair === "beard" && (
               <path d="M30,60 Q50,90 70,60" fill="none" stroke={config.hairColor} strokeWidth="3" />
            )}
            {config.facialHair === "mustache" && (
               <path d="M35,65 Q50,60 65,65" fill="none" stroke={config.hairColor} strokeWidth="4" strokeLinecap="round" />
            )}
            {config.facialHair === "goatee" && (
               <path d="M45,75 Q50,85 55,75" fill="none" stroke={config.hairColor} strokeWidth="3" />
            )}

            {/* Hair (Front) */}
            <path d={PATHS.hair[config.hairStyle as keyof typeof PATHS.hair] || PATHS.hair.short} fill={config.hairColor} stroke="black" strokeWidth="2.5" />

            {/* Accessories */}
            {config.accessories === "cap" && (
               <g>
                 <path d="M25,30 Q50,10 75,30 L85,35 L25,35 Z" fill={accColor} stroke="black" strokeWidth="2.5" />
                 <path d="M25,35 Q50,25 75,35" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                 <path d="M25,35 L15,38 Q50,45 85,38 L75,35" fill={accColor} opacity="0.8" stroke="black" strokeWidth="2" />
               </g>
            )}
            {config.accessories === "beanie" && (
               <g>
                 <path d="M28,35 Q50,5 72,35 L72,40 Q50,30 28,40 Z" fill={accColor} stroke="black" strokeWidth="2.5" />
                 <path d="M28,35 Q50,15 72,35" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                 <rect x="28" y="38" width="44" height="4" rx="1" fill={accColor} stroke="black" strokeWidth="1" />
               </g>
            )}
            {config.accessories === "sunglasses" && (
               <g>
                 <path d="M32,48 L48,48 L48,55 Q40,60 32,55 Z" fill={accColor} stroke="black" strokeWidth="2" />
                 <path d="M52,48 L68,48 L68,55 Q60,60 52,55 Z" fill={accColor} stroke="black" strokeWidth="2" />
                 <line x1="48" y1="50" x2="52" y2="50" stroke="black" strokeWidth="3" />
                 <line x1="28" y1="50" x2="32" y2="50" stroke="black" strokeWidth="3" />
                 <line x1="68" y1="50" x2="72" y2="50" stroke="black" strokeWidth="3" />
                 <path d="M34,50 L46,50" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                 <path d="M54,50 L66,50" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
               </g>
            )}
            {config.accessories === "headphones" && (
               <g>
                 <path d="M20,50 Q20,10 80,50" fill="none" stroke={accColor} strokeWidth="6" />
                 <rect x="15" y="45" width="10" height="20" rx="4" fill={accColor} stroke="black" strokeWidth="2" />
                 <rect x="75" y="45" width="10" height="20" rx="4" fill={accColor} stroke="black" strokeWidth="2" />
                 <rect x="18" y="48" width="4" height="14" rx="1" fill="rgba(0,0,0,0.2)" />
                 <rect x="78" y="48" width="4" height="14" rx="1" fill="rgba(0,0,0,0.2)" />
               </g>
            )}
            {config.accessories === "bandana" && (
               <g>
                 <path d="M25,35 Q50,25 75,35 L75,25 Q50,15 25,25 Z" fill={accColor} stroke="black" strokeWidth="2.5" />
                 <circle cx="35" cy="30" r="1" fill="rgba(255,255,255,0.5)" />
                 <circle cx="50" cy="25" r="1" fill="rgba(255,255,255,0.5)" />
                 <circle cx="65" cy="30" r="1" fill="rgba(255,255,255,0.5)" />
               </g>
            )}
            {config.accessories === "scarf" && (
               <g>
                 <path d="M35,75 Q50,85 65,75 L65,90 Q50,100 35,90 Z" fill={accColor} stroke="black" strokeWidth="2" />
                 <path d="M35,75 Q50,80 65,75" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                 <path d="M45,75 L45,90" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                 <path d="M55,75 L55,90" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
               </g>
            )}
            {config.accessories === "necklace" && (
               <g>
                 <path d="M35,75 Q50,95 65,75" fill="none" stroke={accColor} strokeWidth="3" />
                 <circle cx="50" cy="85" r="4" fill={accColor} stroke="black" strokeWidth="1" />
               </g>
            )}
            {config.accessories === "earrings" && (
               <g>
                 <circle cx="28" cy="55" r="3" fill={accColor} stroke="black" strokeWidth="1" />
                 <circle cx="72" cy="55" r="3" fill={accColor} stroke="black" strokeWidth="1" />
                 <circle cx="28" cy="55" r="1" fill="rgba(255,255,255,0.5)" />
                 <circle cx="72" cy="55" r="1" fill="rgba(255,255,255,0.5)" />
               </g>
            )}
            {config.accessories === "mask" && (
               <g>
                 <path d="M30,55 Q50,75 70,55 L70,65 Q50,85 30,65 Z" fill={accColor} stroke="black" strokeWidth="2" />
                 <path d="M30,55 L25,50" stroke="black" strokeWidth="1" />
                 <path d="M70,55 L75,50" stroke="black" strokeWidth="1" />
               </g>
            )}
            {config.accessories === "bowtie" && (
               <g>
                 <path d="M42,75 L35,70 L35,80 Z" fill={accColor} stroke="black" strokeWidth="1.5" />
                 <path d="M58,75 L65,70 L65,80 Z" fill={accColor} stroke="black" strokeWidth="1.5" />
                 <circle cx="50" cy="75" r="3" fill={accColor} stroke="black" strokeWidth="1.5" />
               </g>
            )}
            {config.accessories === "flower" && (
               <g transform="translate(70, 25)">
                 <circle cx="0" cy="0" r="3" fill="#F59E0B" stroke="black" strokeWidth="1" />
                 <circle cx="0" cy="-5" r="3" fill={accColor} stroke="black" strokeWidth="1" />
                 <circle cx="5" cy="-2" r="3" fill={accColor} stroke="black" strokeWidth="1" />
                 <circle cx="3" cy="4" r="3" fill={accColor} stroke="black" strokeWidth="1" />
                 <circle cx="-3" cy="4" r="3" fill={accColor} stroke="black" strokeWidth="1" />
                 <circle cx="-5" cy="-2" r="3" fill={accColor} stroke="black" strokeWidth="1" />
               </g>
            )}
            {config.accessories === "eyepatch" && (
               <g>
                 <path d="M35,45 L65,35" stroke="black" strokeWidth="2" />
                 <path d="M32,48 L48,48 L48,58 Q40,62 32,58 Z" fill="#1F2937" stroke="black" strokeWidth="1" />
               </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}