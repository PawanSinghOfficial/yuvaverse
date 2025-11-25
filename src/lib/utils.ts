import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeLevel = {
  label: string;
  minPoints: number;
  gradient: string;
  accent: string;
  icon: string;
};

const BADGE_ORDERED_LEVELS: BadgeLevel[] = [
  {
    label: "Ace",
    minPoints: 1500,
    gradient: "from-fuchsia-500 to-amber-400",
    accent: "text-fuchsia-50",
    icon: "🂡",
  },
  {
    label: "Diamond",
    minPoints: 1200,
    gradient: "from-cyan-400 to-blue-500",
    accent: "text-white",
    icon: "💎",
  },
  {
    label: "Platinum",
    minPoints: 900,
    gradient: "from-slate-300 to-slate-100",
    accent: "text-slate-900",
    icon: "⛏️",
  },
  {
    label: "Gold",
    minPoints: 500,
    gradient: "from-amber-400 to-yellow-400",
    accent: "text-amber-950",
    icon: "🥇",
  },
  {
    label: "Silver",
    minPoints: 300,
    gradient: "from-zinc-200 to-zinc-100",
    accent: "text-zinc-700",
    icon: "🥈",
  },
  {
    label: "Bronze",
    minPoints: 0,
    gradient: "from-orange-600 to-amber-500",
    accent: "text-amber-50",
    icon: "🥉",
  },
];

export function getBadgeFromPoints(points = 0): BadgeLevel {
  const badge = BADGE_ORDERED_LEVELS.find((level) => points >= level.minPoints);
  return badge ?? BADGE_ORDERED_LEVELS[BADGE_ORDERED_LEVELS.length - 1];
}

export { BADGE_ORDERED_LEVELS as BADGE_LEVELS };