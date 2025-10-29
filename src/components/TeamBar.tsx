import { Team } from "@/types/game";
import { Crown, Zap, Flame, TrendingUp, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface TeamBarProps {
  team: Team;
  isWinner: boolean;
  rank: number;
  targetPoints: number;
  isOvertaking: boolean;
  isClashing: boolean;
}

export const TeamBar = ({ team, isWinner, rank, targetPoints, isOvertaking, isClashing }: TeamBarProps) => {
  const percentage = Math.min((team.points / targetPoints) * 100, 100);
  const isCloseToWinning = percentage >= 80;
  const [showTrashTalk, setShowTrashTalk] = useState(false);

  const trashTalkMessages = [
    "💀 GET REKT!",
    "🚀 ZOOMING PAST!",
    "👋 SEE YA!",
    "⚡ TOO FAST!",
    "🔥 ON FIRE!",
    "💥 BOOM!",
    "😤 DOMINATED!",
    "🎯 PRECISION!",
  ];

  useEffect(() => {
    if (isOvertaking) {
      setShowTrashTalk(true);
      const timer = setTimeout(() => setShowTrashTalk(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOvertaking]);
  
  const colorClasses: Record<string, string> = {
    red: "bg-gradient-red shadow-glow-red",
    purple: "bg-gradient-purple shadow-glow-purple",
    blue: "bg-gradient-blue shadow-glow-blue",
    green: "bg-gradient-green shadow-glow-green",
    yellow: "bg-gradient-yellow shadow-glow-yellow",
    cyan: "bg-gradient-cyan shadow-glow-cyan",
    amber: "bg-gradient-amber shadow-glow-amber",
  };

  const glowClasses: Record<string, string> = {
    red: "shadow-glow-red",
    purple: "shadow-glow-purple",
    blue: "shadow-glow-blue",
    green: "shadow-glow-green",
    yellow: "shadow-glow-yellow",
    cyan: "shadow-glow-cyan",
    amber: "shadow-glow-amber",
  };

  const RankIcon = rank === 2 ? Medal : rank === 3 ? Award : null;

  return (
    <div
      className={cn(
        "relative transition-all duration-500",
        isWinner && "animate-winner-spotlight z-10",
        isOvertaking && "animate-shake z-20",
        isClashing && "animate-clash-flash"
      )}
    >
      {/* Trash Talk on Overtake */}
      {showTrashTalk && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 -top-16 text-2xl font-black whitespace-nowrap animate-float-up pointer-events-none z-50"
          style={{
            textShadow: `0 0 20px hsl(var(--team-${team.color}-glow)), 0 0 40px hsl(var(--team-${team.color}-glow))`,
            color: `hsl(var(--team-${team.color}-glow))`,
          }}
        >
          {trashTalkMessages[Math.floor(Math.random() * trashTalkMessages.length)]}
        </div>
      )}

      {/* Momentum Indicator */}
      {team.streak >= 3 && (
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          {team.streak >= 5 && (
            <Flame 
              className="w-6 h-6 animate-fire-flicker drop-shadow-[0_0_8px_rgba(255,120,0,0.8)]" 
              style={{ color: `hsl(var(--team-${team.color}))` }}
            />
          )}
          {team.streak >= 3 && (
            <Zap 
              className="w-5 h-5 animate-momentum-pulse" 
              style={{ color: `hsl(var(--team-${team.color}))` }}
            />
          )}
          <div 
            className="text-xs font-black px-2 py-0.5 rounded-full animate-pulse"
            style={{ 
              background: `hsl(var(--team-${team.color}))`,
              boxShadow: `0 0 12px hsl(var(--team-${team.color}))`
            }}
          >
            {team.streak}x
          </div>
          <TrendingUp 
            className="w-4 h-4 opacity-70" 
            style={{ color: `hsl(var(--team-${team.color}))` }}
          />
        </div>
      )}
      {/* Rank Badge */}
      <div className="flex items-center gap-4 mb-2">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold",
            rank === 1 && "bg-gradient-winner shadow-glow-winner animate-pulse-glow",
            rank === 2 && "bg-muted",
            rank === 3 && "bg-card border border-border"
          )}
        >
          {rank === 1 ? (
            <Crown className="w-6 h-6 text-background animate-crown-bounce" />
          ) : RankIcon ? (
            <RankIcon className="w-5 h-5" />
          ) : (
            rank
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">
                {team.name}
              </h3>
              {team.isCombo && (
                <span className="flex items-center gap-1 text-sm bg-gradient-combo px-2 py-1 rounded-full animate-pulse-glow">
                  <Zap className="w-4 h-4 text-background" />
                  <span className="text-background font-black">COMBO x2</span>
                </span>
              )}
              {team.lastGain > 0 && (
                <span 
                  className="text-sm font-black animate-float-up"
                  style={{ color: `hsl(var(--team-${team.color}-glow))` }}
                >
                  +{team.lastGain}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-3xl font-black tabular-nums transition-all",
                isWinner && "text-winner-gold-glow"
              )}
            >
              {Math.floor(team.points)}
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className={cn(
            "relative h-12 bg-card rounded-lg overflow-hidden border transition-all duration-300",
            isCloseToWinning ? "border-2 border-winner-gold shadow-glow-winner" : "border-border",
            isClashing && "border-2 animate-clash-flash"
          )}
            style={isClashing ? { borderColor: `hsl(var(--team-${team.color}))` } : {}}
          >
            {/* Progress Fill */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 transition-all duration-300 ease-out",
                colorClasses[team.color],
                team.isCombo && "animate-pulse-glow",
                isWinner && "animate-shake",
                isCloseToWinning && "animate-pulse-glow"
              )}
              style={{ width: `${percentage}%` }}
            >
              {/* Inner Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {/* Close to Winning Effect */}
              {isCloseToWinning && (
                <div className="absolute inset-0 bg-gradient-to-r from-winner-gold/20 via-winner-gold-glow/30 to-winner-gold/20 animate-pulse" />
              )}
            </div>

            {/* Target Line */}
            {percentage < 100 && (
              <div className="absolute inset-y-0 right-0 w-0.5 bg-foreground/20" />
            )}

            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  "text-lg font-bold z-10 transition-colors",
                  percentage > 50 ? "text-background" : "text-foreground"
                )}
              >
                {Math.floor(percentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Winner Glow Effect */}
      {isWinner && (
        <div
          className={cn(
            "absolute inset-0 -z-10 rounded-lg blur-2xl opacity-60",
            glowClasses[team.color]
          )}
        />
      )}
      
      {/* Close to Winning Glow */}
      {isCloseToWinning && !isWinner && (
        <div className="absolute inset-0 -z-10 rounded-lg blur-xl opacity-40 shadow-glow-winner animate-pulse" />
      )}

    </div>
  );
};
