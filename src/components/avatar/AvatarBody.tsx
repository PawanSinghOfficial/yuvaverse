import React from 'react';
import { AvatarConfig, PATHS } from './constants';

interface AvatarBodyProps {
  config: AvatarConfig;
  pose: string;
}

export function AvatarBody({ config, pose }: AvatarBodyProps) {
  // Helper for arms with outline
  const Arm = ({ d }: { d: string }) => (
    <g>
      <path d={d} stroke="black" strokeWidth="14" strokeLinecap="round" />
      <path d={d} stroke={config.skinTone} strokeWidth="10" strokeLinecap="round" />
    </g>
  );

  let armLeft = <Arm d="M25,85 L10,100" />;
  let armRight = <Arm d="M75,85 L90,100" />;
  let heldItem = null;

  // Pose logic
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
    armRight = <Arm d="M75,85 L85,50" />;
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
    <g>
      {/* Neck (Rendered first so it's behind everything) */}
      <rect x="42" y="70" width="16" height="15" fill={config.skinTone} stroke="black" strokeWidth="2.5" />

      {/* Legs (only if not portrait) */}
      {pose !== "portrait" && (
         <path d={PATHS.bottom[config.bottomStyle as keyof typeof PATHS.bottom] || PATHS.bottom.jeans} fill={config.bottomColor} stroke="black" strokeWidth="2.5" />
      )}

      {/* Torso */}
      <path d={PATHS.top[config.topStyle as keyof typeof PATHS.top] || PATHS.top.tshirt} fill={config.topColor} stroke="black" strokeWidth="2.5" />
      
      {/* Simple clothing fold/shadow */}
      <path d="M30,110 Q50,115 70,110" fill="none" stroke="black" strokeWidth="1" opacity="0.1" />

      {/* Arms */}
      {armLeft}
      {armRight}
      
      {/* Held Item (Rendered last so it's in front) */}
      {heldItem}
    </g>
  );
}