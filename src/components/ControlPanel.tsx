import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Team, TeamId } from "@/types/game";
import { Play, Pause, RotateCcw, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  playerTeam: TeamId | null;
  isPlaying: boolean;
  targetPoints: number;
  teams: Team[];
  onJoinTeam: (teamId: TeamId) => void;
  onAddPoint: () => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSimulateWin: (teamId: TeamId) => void;
  onTargetPointsChange: (points: number) => void;
}

// debug control panel for testing - hidden by default
export const ControlPanel = ({
  isPlaying,
  teams,
  onTogglePlay,
  onRestart,
  onSimulateWin,
}: ControlPanelProps) => {
  const [showDebug, setShowDebug] = useState(false);

  // team color mapping for styled buttons
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
    <div className="fixed bottom-4 left-4 z-40 ">
      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-2 bg-card/95 backdrop-blur-sm border-2 border-border rounded-lg p-4 space-y-3 shadow-2xl w-64">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug Controls
          </h4>
          
          {/* Play/Pause */}
          <Button
            onClick={onTogglePlay}
            variant="secondary"
            className="w-full h-10 font-bold"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>

          {/* Restart */}
          <Button
            onClick={onRestart}
            variant="secondary"
            className="w-full h-10 font-bold"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>

          {/* Win Team Buttons */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Simulate Win:</p>
            <div className="grid grid-cols-3 gap-2">
              {teams.map((team) => (
                <Button
                  key={team.id}
                  onClick={() => onSimulateWin(team.id)}
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold border-2"
                  style={{
                    borderColor: colorMap[team.color],
                    color: colorMap[team.color],
                  }}
                >
                  Team {team.id}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Debug Button */}
      <Button
        onClick={() => setShowDebug(!showDebug)}
        variant="secondary"
        size="sm"
        className="rounded-full shadow-lg h-10 w-10 p-0"
      >
        <Bug className="w-5 h-5" />
      </Button>
    </div>
  );
};
