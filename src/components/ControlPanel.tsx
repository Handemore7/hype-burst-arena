import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamId } from "@/types/game";
import {
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Bug,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  playerTeam: TeamId | null;
  isPlaying: boolean;
  targetPoints: number;
  onJoinTeam: (teamId: TeamId) => void;
  onAddPoint: () => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSimulateWin: (teamId: TeamId) => void;
  onTargetPointsChange: (points: number) => void;
}

export const ControlPanel = ({
  playerTeam,
  isPlaying,
  targetPoints,
  onJoinTeam,
  onAddPoint,
  onTogglePlay,
  onRestart,
  onSimulateWin,
  onTargetPointsChange,
}: ControlPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  const teamColors = {
    1: "border-team-cyan shadow-glow-cyan",
    2: "border-team-purple shadow-glow-purple",
    3: "border-team-amber shadow-glow-amber",
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Toggle Button */}
      <div className="flex justify-center mb-2">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="secondary"
          size="sm"
          className="rounded-full shadow-lg"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Control Panel */}
      <div
        className={cn(
          "bg-card border-t-2 border-border transition-transform duration-300 shadow-2xl",
          isExpanded ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="container mx-auto p-6 space-y-4">
          {/* Player Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Join a Team</h3>
            <div className="flex gap-3">
              <Button
                onClick={() => onJoinTeam(1)}
                variant={playerTeam === 1 ? "default" : "outline"}
                className={cn(
                  "flex-1 h-12 font-bold transition-all",
                  playerTeam === 1 && "bg-gradient-cyan border-2 border-team-cyan"
                )}
              >
                Team Cyan
              </Button>
              <Button
                onClick={() => onJoinTeam(2)}
                variant={playerTeam === 2 ? "default" : "outline"}
                className={cn(
                  "flex-1 h-12 font-bold transition-all",
                  playerTeam === 2 && "bg-gradient-purple border-2 border-team-purple"
                )}
              >
                Team Purple
              </Button>
              <Button
                onClick={() => onJoinTeam(3)}
                variant={playerTeam === 3 ? "default" : "outline"}
                className={cn(
                  "flex-1 h-12 font-bold transition-all",
                  playerTeam === 3 && "bg-gradient-amber border-2 border-team-amber"
                )}
              >
                Team Amber
              </Button>
            </div>

            {/* Player Action Button */}
            {playerTeam && (
              <Button
                onClick={onAddPoint}
                size="lg"
                className={cn(
                  "w-full h-16 text-xl font-black border-4 transition-all hover:scale-105",
                  teamColors[playerTeam]
                )}
              >
                <Zap className="w-6 h-6 mr-2" />
                Add Point to Your Team!
              </Button>
            )}
          </div>

          {/* Controls Section */}
          <div className="flex gap-3">
            <Button
              onClick={onTogglePlay}
              variant="secondary"
              className="flex-1 h-12 font-bold"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button
              onClick={onRestart}
              variant="secondary"
              className="flex-1 h-12 font-bold"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Restart
            </Button>
            <Button
              onClick={() => setShowDebug(!showDebug)}
              variant="outline"
              className="h-12"
            >
              <Bug className="w-5 h-5" />
            </Button>
          </div>

          {/* Debug Section */}
          {showDebug && (
            <div className="bg-secondary p-4 rounded-lg space-y-3 border border-border">
              <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Debug Controls
              </h4>
              
              {/* Target Points Control */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Target Points: {targetPoints}
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={targetPoints}
                  onChange={(e) => onTargetPointsChange(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => onSimulateWin(1)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Win Team 1
                </Button>
                <Button
                  onClick={() => onSimulateWin(2)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Win Team 2
                </Button>
                <Button
                  onClick={() => onSimulateWin(3)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Win Team 3
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
