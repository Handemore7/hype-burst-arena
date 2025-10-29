import { Crown, Medal, Award } from "lucide-react";

interface PositionBadgeProps {
  position: number;
  color: string;
}

export const PositionBadge = ({ position, color }: PositionBadgeProps) => {
  const icons = {
    1: Crown,
    2: Medal,
    3: Award,
  };

  const Icon = icons[position as keyof typeof icons];
  if (!Icon) return null;

  const bgColors = {
    1: "hsl(var(--winner-gold))",
    2: "hsl(0 0% 70%)",
    3: "hsl(25 76% 50%)",
  };

  return (
    <div
      className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full font-black text-sm animate-pulse-glow"
      style={{
        background: bgColors[position as keyof typeof bgColors],
        boxShadow: `0 0 20px ${bgColors[position as keyof typeof bgColors]}`,
      }}
    >
      <Icon className="w-5 h-5 text-background" />
    </div>
  );
};
