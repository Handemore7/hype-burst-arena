import { Flame, Zap, TrendingUp } from "lucide-react";

interface MomentumIndicatorProps {
  streak: number;
  color: string;
}

export const MomentumIndicator = ({ streak, color }: MomentumIndicatorProps) => {
  if (streak < 3) return null;

  return (
    <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
      {streak >= 5 && (
        <Flame 
          className="w-6 h-6 animate-fire-flicker drop-shadow-[0_0_8px_rgba(255,120,0,0.8)]" 
          style={{ color }} 
        />
      )}
      {streak >= 3 && (
        <Zap 
          className="w-5 h-5 animate-momentum-pulse" 
          style={{ color }} 
        />
      )}
      <div 
        className="text-xs font-black px-2 py-0.5 rounded-full animate-pulse"
        style={{ 
          background: `linear-gradient(135deg, ${color}, hsl(var(--momentum-fire)))`,
          boxShadow: `0 0 12px ${color}`
        }}
      >
        {streak}x
      </div>
      <TrendingUp 
        className="w-4 h-4 opacity-70" 
        style={{ color }} 
      />
    </div>
  );
};
