import React from 'react';

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

export const COLORS = {
  skin: { light: "#FFDFC4", medium: "#E0AC69", dark: "#8D5524" },
  hair: { black: "#2C2C2C", brown: "#6A4E23", blonde: "#E6CEA8", red: "#A52A2A" },
  clothes: { red: "#EF4444", blue: "#3B82F6", green: "#10B981", black: "#1F2937", white: "#F3F4F6", yellow: "#F59E0B" },
};

// Simplified SVG paths
export const PATHS = {
  hair: {
    // Legacy support if needed, but we will use hairFront and hairBack
    short: "M30,30 Q50,10 70,30 L70,40 Q50,20 30,40 Z",
    long: "M30,30 Q50,10 70,30 L75,80 Q50,90 25,80 Z",
    messy: "M25,35 Q50,5 75,35 L75,45 Q80,30 70,25 Q50,15 30,25 Q20,30 25,45 Z",
    bald: "",
  },
  hairFront: {
    short: "M30,30 Q50,10 70,30 L70,40 Q50,20 30,40 Z",
    long: "M30,30 Q50,10 70,30 Q60,40 50,40 Q40,40 30,30 Z", // Bangs only
    messy: "M25,35 Q50,5 75,35 L75,45 Q80,30 70,25 Q50,15 30,25 Q20,30 25,45 Z",
    bald: "",
  },
  hairBack: {
    short: "",
    long: "M20,40 Q50,20 80,40 L85,90 Q50,100 15,90 Z", // Wider and behind
    messy: "",
    bald: "",
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