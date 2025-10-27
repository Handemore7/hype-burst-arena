import { useEffect, useState } from "react";
import { Team } from "@/types/game";
import { Crown, Sparkles, Trophy } from "lucide-react";
import { ParticleEffect } from "./ParticleEffect";

interface WinAnimationProps {
  winningTeam: Team | null;
  onComplete?: () => void;
}

export const WinAnimation = ({ winningTeam, onComplete }: WinAnimationProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (!winningTeam) return;

    // Trigger particles immediately
    setShowParticles(true);

    // Show text after a brief delay
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 300);

    // Complete animation after duration
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [winningTeam, onComplete]);

  if (!winningTeam) return null;

  const colorMap = {
    cyan: "hsl(var(--team-cyan))",
    purple: "hsl(var(--team-purple))",
    amber: "hsl(var(--team-amber))",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <ParticleEffect
        trigger={showParticles}
        color={colorMap[winningTeam.color]}
      />

      {showText && (
        <div className="relative z-10 text-center space-y-8 animate-winner-spotlight">
          {/* Winner Badge */}
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="w-32 h-32 text-winner-gold animate-pulse-glow" />
              <Crown className="absolute -top-4 -right-4 w-16 h-16 text-winner-gold-glow animate-crown-bounce" />
            </div>
          </div>

          {/* Team Name */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-winner-gold" />
              <h1 className="text-7xl font-black bg-gradient-winner bg-clip-text text-transparent">
                {winningTeam.name}
              </h1>
              <Sparkles className="w-8 h-8 text-winner-gold" />
            </div>
            <p className="text-4xl font-bold text-foreground/80">WINS!</p>
          </div>

          {/* Final Score */}
          <div className="bg-card border-2 border-winner-gold rounded-2xl px-12 py-6 shadow-glow-winner">
            <p className="text-2xl text-muted-foreground mb-2">Final Score</p>
            <p className="text-6xl font-black text-winner-gold-glow">
              {Math.floor(winningTeam.points)}
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground animate-pulse">
            Victory achieved! 🎉
          </p>
        </div>
      )}
    </div>
  );
};
