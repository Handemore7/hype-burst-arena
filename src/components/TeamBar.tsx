import { Team } from "@/types/game";
import { Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamBarProps {
  team: Team;
  isWinner: boolean;
  rank: number;
  targetPoints: number;
  isOvertaking: boolean;
}

export const TeamBar = ({ team, isWinner, rank, targetPoints, isOvertaking }: TeamBarProps) => {
  const percentage = Math.min((team.points / targetPoints) * 100, 100);
  const isCloseToWinning = percentage >= 80;
  
  const colorClasses = {
    cyan: "bg-gradient-cyan shadow-glow-cyan",
    purple: "bg-gradient-purple shadow-glow-purple",
    amber: "bg-gradient-amber shadow-glow-amber",
  };

  const glowClasses = {
    cyan: "shadow-glow-cyan",
    purple: "shadow-glow-purple",
    amber: "shadow-glow-amber",
  };

  return (
    <div
      className={cn(
        "relative transition-all duration-500",
        isWinner && "animate-winner-spotlight z-10",
        isOvertaking && "animate-shake z-20"
      )}
    >
      {/* Rank Badge */}
      <div className="flex items-center gap-4 mb-2">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold",
            rank === 1 && "bg-gradient-winner shadow-glow-winner",
            rank === 2 && "bg-card border-2 border-secondary",
            rank === 3 && "bg-card border border-border"
          )}
        >
          {rank === 1 && isWinner ? (
            <Crown className="w-6 h-6 text-winner-gold animate-crown-bounce" />
          ) : (
            rank
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {team.name}
              {team.isCombo && (
                <span className="flex items-center gap-1 text-sm bg-gradient-winner px-2 py-1 rounded-full animate-pulse-glow">
                  <Zap className="w-4 h-4" />
                  COMBO x2
                </span>
              )}
            </h3>
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
            isCloseToWinning ? "border-2 border-winner-gold" : "border-border"
          )}>
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

      {/* Overtaking Effect */}
      {isOvertaking && (
        <div className="absolute -top-2 -right-2 animate-bounce">
          <div className="bg-gradient-winner text-background text-xs font-bold px-2 py-1 rounded-full">
            🚀 OVERTAKE!
          </div>
        </div>
      )}
    </div>
  );
};
