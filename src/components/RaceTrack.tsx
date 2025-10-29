import { Team } from "@/types/game";
import { Crown, Zap, Flame, TrendingUp, Flag, Frown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface RaceTrackProps {
  team: Team;
  isWinner: boolean;
  rank: number;
  targetPoints: number;
  isOvertaking: boolean;
  isClashing: boolean;
  isLastPlace: boolean;
}

export const RaceTrack = ({ 
  team, 
  isWinner, 
  rank, 
  targetPoints, 
  isOvertaking, 
  isClashing,
  isLastPlace 
}: RaceTrackProps) => {
  const percentage = Math.min((team.points / targetPoints) * 100, 100);
  const isCloseToWinning = percentage >= 85;
  const [showTrashTalk, setShowTrashTalk] = useState(false);

  const trashTalkMessages = [
    "💀 OVERTAKE!",
    "🚀 ZOOMING!",
    "👋 LATER!",
    "⚡ SPEED!",
    "🔥 FIRE!",
    "💥 BOOM!",
  ];

  useEffect(() => {
    if (isOvertaking) {
      setShowTrashTalk(true);
      const timer = setTimeout(() => setShowTrashTalk(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOvertaking]);

  // Character emojis based on team state
  const getCharacterEmoji = () => {
    if (isWinner) return "🏆";
    if (team.isCombo) return "😤";
    if (isCloseToWinning) return "😈";
    if (team.streak >= 3) return "🔥";
    if (isLastPlace) return "😰";
    if (isClashing) return "😬";
    return "😐";
  };

  const colorMap: Record<string, string> = {
    red: "hsl(var(--team-red))",
    purple: "hsl(var(--team-purple))",
    blue: "hsl(var(--team-blue))",
    green: "hsl(var(--team-green))",
    yellow: "hsl(var(--team-yellow))",
    cyan: "hsl(var(--team-cyan))",
    amber: "hsl(var(--team-amber))",
  };

  return (
    <div className="relative mb-8">
      {/* Team Name & Score Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-lg font-black border-2",
              rank === 1 && "bg-gradient-winner border-winner-gold shadow-glow-winner animate-pulse-glow",
              rank === 2 && "bg-muted border-muted-foreground/30",
              rank === 3 && "bg-card border-border"
            )}
          >
            {rank === 1 ? <Crown className="w-5 h-5 text-background animate-crown-bounce" /> : rank}
          </div>
          
          {/* Team Name */}
          <h3 className={cn(
            "text-2xl font-black transition-all",
            rank === 1 && "text-winner-gold-glow"
          )}>
            {team.name}
          </h3>

          {/* Combo Badge */}
          {team.isCombo && (
            <span className="flex items-center gap-1 text-sm bg-gradient-combo px-3 py-1.5 rounded-full animate-pulse-glow border-2 border-combo-border">
              <Zap className="w-4 h-4 text-background" />
              <span className="text-background font-black">x2</span>
            </span>
          )}

          {/* Last Gain */}
          {team.lastGain > 0 && (
            <span 
              className="text-lg font-black animate-float-up"
              style={{ color: colorMap[team.color] }}
            >
              +{team.lastGain}
            </span>
          )}
        </div>

        {/* Score */}
        <span className={cn(
          "text-4xl font-black tabular-nums",
          rank === 1 && "text-winner-gold-glow"
        )}>
          {Math.floor(team.points)}
        </span>
      </div>

      {/* Race Track */}
      <div className="relative">
        {/* Track Background */}
        <div className={cn(
          "relative h-24 bg-card rounded-xl border-2 overflow-visible transition-all",
          isCloseToWinning && "border-winner-gold shadow-glow-winner animate-pulse",
          isClashing && "animate-clash-flash"
        )}
          style={isClashing ? { borderColor: colorMap[team.color] } : {}}
        >
          {/* Track Lines */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1 bg-border/30" style={{ 
              backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--border)) 0px, hsl(var(--border)) 20px, transparent 20px, transparent 40px)'
            }} />
          </div>

          {/* Finish Line */}
          <div className="absolute right-0 inset-y-0 w-2 bg-gradient-to-b from-transparent via-foreground to-transparent opacity-20" />
          <Flag className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground animate-pulse" />

          {/* Character/Racer */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out",
              isOvertaking && "animate-shake",
              team.isCombo && "animate-bounce"
            )}
            style={{ 
              left: `calc(${percentage}% - 32px)`,
            }}
          >
            {/* Character Container */}
            <div className={cn(
              "relative w-16 h-16 rounded-full flex items-center justify-center text-4xl border-4 transition-all",
              isCloseToWinning && "animate-pulse-glow scale-110"
            )}
              style={{
                background: `linear-gradient(135deg, ${colorMap[team.color]}, ${colorMap[team.color]}dd)`,
                borderColor: colorMap[team.color],
                boxShadow: `0 0 20px ${colorMap[team.color]}80, 0 0 40px ${colorMap[team.color]}40`
              }}
            >
              {getCharacterEmoji()}
              
              {/* Streak Fire Effect */}
              {team.streak >= 3 && (
                <Flame 
                  className="absolute -top-2 -right-2 w-6 h-6 animate-fire-flicker drop-shadow-[0_0_8px_rgba(255,120,0,0.8)]" 
                  style={{ color: colorMap[team.color] }}
                />
              )}

              {/* Speed Lines when comboing */}
              {team.isCombo && (
                <div className="absolute -left-8 top-1/2 -translate-y-1/2">
                  <div className="flex gap-1">
                    <div className="w-6 h-1 rounded-full opacity-60 animate-pulse" style={{ background: colorMap[team.color] }} />
                    <div className="w-4 h-1 rounded-full opacity-40 animate-pulse" style={{ background: colorMap[team.color], animationDelay: '0.1s' }} />
                    <div className="w-2 h-1 rounded-full opacity-20 animate-pulse" style={{ background: colorMap[team.color], animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overtake Message */}
          {showTrashTalk && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 -top-16 text-3xl font-black whitespace-nowrap animate-float-up pointer-events-none z-50"
              style={{
                textShadow: `0 0 20px ${colorMap[team.color]}, 0 0 40px ${colorMap[team.color]}`,
                color: colorMap[team.color],
              }}
            >
              {trashTalkMessages[Math.floor(Math.random() * trashTalkMessages.length)]}
            </div>
          )}

          {/* Last Place Motivation */}
          {isLastPlace && !isWinner && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Frown className="w-5 h-5" />
              <span className="font-bold">Keep pushing!</span>
            </div>
          )}

          {/* Close to Winning Hype */}
          {isCloseToWinning && !isWinner && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-2 animate-momentum-pulse">
              <TrendingUp className="w-6 h-6 text-winner-gold" />
              <span className="text-lg font-black text-winner-gold-glow">ALMOST THERE!</span>
            </div>
          )}
        </div>

        {/* Streak Indicator (outside track) */}
        {team.streak >= 3 && (
          <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <Zap 
              className="w-6 h-6 animate-momentum-pulse" 
              style={{ color: colorMap[team.color] }}
            />
            <div 
              className="text-sm font-black px-2 py-1 rounded-full animate-pulse"
              style={{ 
                background: colorMap[team.color],
                boxShadow: `0 0 12px ${colorMap[team.color]}`
              }}
            >
              {team.streak}x
            </div>
          </div>
        )}
      </div>

      {/* Percentage Display */}
      <div className="text-center mt-2">
        <span className="text-sm text-muted-foreground font-bold">
          {Math.floor(percentage)}%
        </span>
      </div>
    </div>
  );
};
