import { useState, useEffect, useCallback, useRef } from "react";
import { RaceTrack } from "@/components/RaceTrack";
import { WinAnimation } from "@/components/WinAnimation";
import { ControlPanel } from "@/components/ControlPanel";
import { GameState, Team, TeamId, TeamColor } from "@/types/game";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

// game timing constants - adjust these to change game speed and behavior
const TICK_INTERVAL = 500; // game updates every 0.5 seconds
const COMBO_DURATION = 5000; // combos last 5 seconds
const COMBO_CHANCE = 0.05; // 5% chance to activate combo each tick

// team name options - randomly selected for each game
const sillyNames = [
  ["Cyber Sharks", "Neon Ninjas", "Azure Avengers"],
  ["Void Vikings", "Mystic Mages", "Royal Rascals"],
  ["Solar Samurai", "Golden Goblins", "Flame Phoenixes"],
  ["Pixel Pirates", "Aqua Alpacas", "Tidal Toasters"],
  ["Cosmic Cats", "Purple Potatoes", "Grape Gremlins"],
  ["Honey Badgers", "Spicy Spaghetti", "Toasty Tacos"],
  ["Chaos Llamas", "Dancing Pickles", "Screaming Bananas"],
  ["Wobbly Wizards", "Confused Unicorns", "Flying Tacos"],
  ["Dizzy Dolphins", "Bouncing Potatoes", "Sleepy Ninjas"],
  ["Grumpy Cupcakes", "Hyper Penguins", "Sparkle Sloths"],
];

// available team colors - 5 colors for variety
const availableColors: TeamColor[] = ["red", "purple", "blue", "green", "yellow"];

// helper to get random team names from the pool
const getRandomNames = () => {
  const nameSet = sillyNames[Math.floor(Math.random() * sillyNames.length)];
  return nameSet;
};

// helper to get 3 random unique colors for teams
const getRandomColors = (): TeamColor[] => {
  const shuffled = [...availableColors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

// create initial team setup with random names and colors
const createInitialTeams = (names: string[]): Team[] => {
  const colors = getRandomColors();
  return [
    { id: 1, name: names[0], points: 0, color: colors[0], isCombo: false, comboEndTime: null, streak: 0, lastGain: 0 },
    { id: 2, name: names[1], points: 0, color: colors[1], isCombo: false, comboEndTime: null, streak: 0, lastGain: 0 },
    { id: 3, name: names[2], points: 0, color: colors[2], isCombo: false, comboEndTime: null, streak: 0, lastGain: 0 },
  ];
};

const Index = () => {
  // game configuration
  const [targetPoints, setTargetPoints] = useState(600);
  const [teamNames] = useState(getRandomNames());
  
  // main game state
  const [gameState, setGameState] = useState<GameState>({
    teams: createInitialTeams(teamNames),
    winner: null,
    isPlaying: true,
    playerTeam: null,
  });
  
  // track previous rankings to detect overtakes
  const [prevRankings, setPrevRankings] = useState<TeamId[]>([1, 2, 3]);
  
  // UI state
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [clashTeams, setClashTeams] = useState<TeamId[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [hasStarted, setHasStarted] = useState(false);
  
  // ref to store interval for cleanup
  const tickIntervalRef = useRef<NodeJS.Timeout>();

  // main game loop - handles point generation and combo mechanics
  const gameTick = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.winner) return prev;

      const now = Date.now();
      const updatedTeams = prev.teams.map((team) => {
        // handle combo expiration
        let isCombo = team.isCombo;
        let comboEndTime = team.comboEndTime;

        if (isCombo && comboEndTime && now >= comboEndTime) {
          isCombo = false;
          comboEndTime = null;
          toast.info(`${team.name} combo ended!`, { icon: "⚡" });
        }

        // randomly activate combos for excitement
        if (!isCombo && Math.random() < COMBO_CHANCE) {
          isCombo = true;
          comboEndTime = now + COMBO_DURATION;
          toast.success(`${team.name} activated COMBO x2!`, {
            icon: "🔥",
            duration: 3000,
          });
        }

        // calculate points earned this tick
        const basePoints = Math.floor(Math.random() * 6) + 5; // 5-10 points per tick
        const pointsToAdd = isCombo ? basePoints * 2 : basePoints;
        const newPoints = Math.min(team.points + pointsToAdd, targetPoints);

        // track hot streaks for visual effects
        const newStreak = pointsToAdd >= 12 ? team.streak + 1 : Math.max(0, team.streak - 1);

        return {
          ...team,
          points: newPoints,
          isCombo,
          comboEndTime,
          streak: newStreak,
          lastGain: pointsToAdd,
        };
      });

      // detect ranking changes for overtaking animations
      const newRankings = [...updatedTeams]
        .sort((a, b) => b.points - a.points)
        .map((t) => t.id);
      
      if (JSON.stringify(newRankings) !== JSON.stringify(prevRankings)) {
        setPrevRankings(newRankings);
      }

      // find teams that are super close (within 10 points) for clash effects
      const sortedByPoints = [...updatedTeams].sort((a, b) => b.points - a.points);
      const clashingTeams: TeamId[] = [];
      for (let i = 0; i < sortedByPoints.length - 1; i++) {
        const diff = sortedByPoints[i].points - sortedByPoints[i + 1].points;
        if (diff < 10 && diff >= 0) {
          clashingTeams.push(sortedByPoints[i].id, sortedByPoints[i + 1].id);
        }
      }
      setClashTeams([...new Set(clashingTeams)]);

      // check if anyone won
      const winner = updatedTeams.find((team) => team.points >= targetPoints);
      if (winner) {
        setShowWinAnimation(true);
        toast.success(`🎉 ${winner.name} WINS! 🎉`, {
          icon: <Trophy className="w-6 h-6" />,
          duration: 5000,
        });
        return {
          ...prev,
          teams: updatedTeams,
          winner: winner.id,
          isPlaying: false,
        };
      }

      return {
        ...prev,
        teams: updatedTeams,
      };
    });
  }, [targetPoints, prevRankings]);

  // countdown timer before game starts
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!hasStarted) {
      setHasStarted(true);
    }
  }, [countdown, hasStarted]);

  // setup game tick interval when game is active
  useEffect(() => {
    if (gameState.isPlaying && !gameState.winner && hasStarted) {
      tickIntervalRef.current = setInterval(gameTick, TICK_INTERVAL);
    } else {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    }

    // cleanup interval on unmount
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.winner, gameTick, hasStarted]);

  // player interaction handlers (kept for future use)
  const handleJoinTeam = (teamId: TeamId) => {
    setGameState((prev) => ({ ...prev, playerTeam: teamId }));
    const team = gameState.teams.find((t) => t.id === teamId);
    toast.success(`Joined ${team?.name}!`, { icon: "👥" });
  };

  const handleAddPoint = () => {
    if (!gameState.playerTeam) return;

    setGameState((prev) => {
      const updatedTeams = prev.teams.map((team) =>
        team.id === prev.playerTeam
          ? { ...team, points: Math.min(team.points + 1, targetPoints), lastGain: 1 }
          : team
      );

      const winner = updatedTeams.find((team) => team.points >= targetPoints);
      if (winner) {
        setShowWinAnimation(true);
        toast.success(`🎉 ${winner.name} WINS! 🎉`, {
          icon: <Trophy className="w-6 h-6" />,
          duration: 5000,
        });
        return {
          ...prev,
          teams: updatedTeams,
          winner: winner.id,
          isPlaying: false,
        };
      }

      return {
        ...prev,
        teams: updatedTeams,
      };
    });

    toast.success("+1 Point!", { icon: "⚡", duration: 1000 });
  };

  // debug controls
  const handleTogglePlay = () => {
    setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    toast.info(gameState.isPlaying ? "Game Paused" : "Game Resumed", {
      icon: gameState.isPlaying ? "⏸️" : "▶️",
    });
  };

  const handleRestart = () => {
    setGameState({
      teams: createInitialTeams(teamNames),
      winner: null,
      isPlaying: true,
      playerTeam: null,
    });
    setPrevRankings([1, 2, 3]);
    setShowWinAnimation(false);
    setCountdown(3);
    setHasStarted(false);
    toast.success("Game Restarted!", { icon: "🔄" });
  };

  const handleSimulateWin = (teamId: TeamId) => {
    setGameState((prev) => {
      const updatedTeams = prev.teams.map((team) =>
        team.id === teamId ? { ...team, points: targetPoints } : team
      );

      setShowWinAnimation(true);
      return {
        ...prev,
        teams: updatedTeams,
        winner: teamId,
        isPlaying: false,
      };
    });
  };

  const handleCloseWinAnimation = () => {
    setShowWinAnimation(false);
  };

  // calculate sorted teams and winner
  const sortedTeams = [...gameState.teams].sort((a, b) => b.points - a.points);
  const winningTeam = gameState.winner
    ? gameState.teams.find((t) => t.id === gameState.winner)
    : null;

  return (
    <div className="min-h-screen pb-96">
      {/* Countdown Overlay */}
      {countdown > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
          <div className="text-center">
            <div className="text-[200px] font-black animate-scale-in text-winner-gold-glow drop-shadow-[0_0_40px_rgba(255,215,0,0.6)]">
              {countdown}
            </div>
            <p className="text-3xl font-bold text-muted-foreground mt-4">Get Ready!</p>
          </div>
        </div>
      )}
      {countdown === 0 && !hasStarted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
          <div className="text-center">
            <div className="text-[200px] font-black animate-scale-in text-winner-gold-glow drop-shadow-[0_0_60px_rgba(255,215,0,0.8)]">
              GO!
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black bg-gradient-winner bg-clip-text text-transparent">
              HYPE RACE
            </h1>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">First to</p>
              <p className="text-3xl font-black text-winner-gold">{targetPoints}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto px-6 py-4">
        <div className="relative" style={{ minHeight: `${gameState.teams.length * 170}px` }}>
          {gameState.teams.map((team) => {
            // Find current rank by sorting
            const currentRankIndex = sortedTeams.findIndex(t => t.id === team.id);
            const currentRank = currentRankIndex + 1;
            const prevRank = prevRankings.indexOf(team.id) + 1;
            const isOvertaking = prevRank > currentRank;
            const isClashing = clashTeams.includes(team.id);
            const isLastPlace = currentRank === sortedTeams.length;
            
            return (
              <div
                key={team.id}
                className="transition-all duration-700 ease-in-out absolute w-full"
                style={{
                  top: `${currentRankIndex * 170}px`,
                  zIndex: isOvertaking ? 10 : 1,
                }}
              >
                <RaceTrack
                  team={team}
                  isWinner={team.id === gameState.winner}
                  rank={currentRank}
                  targetPoints={targetPoints}
                  isOvertaking={isOvertaking}
                  isClashing={isClashing}
                  isLastPlace={isLastPlace}
                />
              </div>
            );
          })}
        </div>

        {/* Status Message */}
        {!gameState.isPlaying && !gameState.winner && (
          <div className="mt-12 text-center">
            <p className="text-2xl font-bold text-muted-foreground">Game Paused</p>
          </div>
        )}
      </main>

      {/* Win Animation */}
      {showWinAnimation && winningTeam && (
        <WinAnimation 
          teams={gameState.teams}
          winningTeam={winningTeam}
          onContinue={handleCloseWinAnimation}
        />
      )}

      {/* Control Panel */}
      <ControlPanel
        playerTeam={gameState.playerTeam}
        isPlaying={gameState.isPlaying}
        targetPoints={targetPoints}
        teams={gameState.teams}
        onJoinTeam={handleJoinTeam}
        onAddPoint={handleAddPoint}
        onTogglePlay={handleTogglePlay}
        onRestart={handleRestart}
        onSimulateWin={handleSimulateWin}
        onTargetPointsChange={setTargetPoints}
      />
    </div>
  );
};

export default Index;
