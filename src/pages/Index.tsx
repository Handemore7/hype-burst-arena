import { useState, useEffect, useCallback, useRef } from "react";
import { TeamBar } from "@/components/TeamBar";
import { WinAnimation } from "@/components/WinAnimation";
import { ControlPanel } from "@/components/ControlPanel";
import { GameState, Team, TeamId, TeamColor } from "@/types/game";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

const TICK_INTERVAL = 500; // 0.5 seconds
const COMBO_DURATION = 5000; // 5 seconds
const COMBO_CHANCE = 0.05; // 5% chance per tick

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

const availableColors: TeamColor[] = ["red", "purple", "blue", "green", "yellow"];

const getRandomNames = () => {
  const nameSet = sillyNames[Math.floor(Math.random() * sillyNames.length)];
  return nameSet;
};

const getRandomColors = (): TeamColor[] => {
  // Shuffle the colors array and pick first 3
  const shuffled = [...availableColors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

const createInitialTeams = (names: string[]): Team[] => {
  const colors = getRandomColors();
  return [
    { id: 1, name: names[0], points: 0, color: colors[0], isCombo: false, comboEndTime: null, streak: 0, lastGain: 0 },
    { id: 2, name: names[1], points: 0, color: colors[1], isCombo: false, comboEndTime: null, streak: 0, lastGain: 0 },
    { id: 3, name: names[2], points: 0, color: colors[2], isCombo: false, comboEndTime: null, streak: 0, lastGain: 0 },
  ];
};

const Index = () => {
  const [targetPoints, setTargetPoints] = useState(200);
  const [teamNames] = useState(getRandomNames());
  const [gameState, setGameState] = useState<GameState>({
    teams: createInitialTeams(teamNames),
    winner: null,
    isPlaying: true,
    playerTeam: null,
  });
  const [prevRankings, setPrevRankings] = useState<TeamId[]>([1, 2, 3]);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [clashTeams, setClashTeams] = useState<TeamId[]>([]);
  const tickIntervalRef = useRef<NodeJS.Timeout>();

  // Game tick logic
  const gameTick = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.winner) return prev;

      const now = Date.now();
      const updatedTeams = prev.teams.map((team) => {
        // Check if combo expired
        let isCombo = team.isCombo;
        let comboEndTime = team.comboEndTime;

        if (isCombo && comboEndTime && now >= comboEndTime) {
          isCombo = false;
          comboEndTime = null;
          toast.info(`${team.name} combo ended!`, { icon: "⚡" });
        }

        // Random combo activation
        if (!isCombo && Math.random() < COMBO_CHANCE) {
          isCombo = true;
          comboEndTime = now + COMBO_DURATION;
          toast.success(`${team.name} activated COMBO x2!`, {
            icon: "🔥",
            duration: 3000,
          });
        }

        // Calculate points to add
        const basePoints = Math.floor(Math.random() * 6) + 5; // 5-10 points
        const pointsToAdd = isCombo ? basePoints * 2 : basePoints;
        const newPoints = Math.min(team.points + pointsToAdd, targetPoints);

        // Update streak
        const newStreak = pointsToAdd >= 12 ? team.streak + 1 : Math.max(0, team.streak - 1);

        // Trigger screen shake on huge gains
        if (pointsToAdd >= 15 && !prev.winner) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 500);
        }

        return {
          ...team,
          points: newPoints,
          isCombo,
          comboEndTime,
          streak: newStreak,
          lastGain: pointsToAdd,
        };
      });

      // Track rankings for overtaking animation
      const newRankings = [...updatedTeams]
        .sort((a, b) => b.points - a.points)
        .map((t) => t.id);
      
      if (JSON.stringify(newRankings) !== JSON.stringify(prevRankings)) {
        setPrevRankings(newRankings);
      }

      // Detect clash moments (teams within 10 points)
      const sortedByPoints = [...updatedTeams].sort((a, b) => b.points - a.points);
      const clashingTeams: TeamId[] = [];
      for (let i = 0; i < sortedByPoints.length - 1; i++) {
        const diff = sortedByPoints[i].points - sortedByPoints[i + 1].points;
        if (diff < 10 && diff >= 0) {
          clashingTeams.push(sortedByPoints[i].id, sortedByPoints[i + 1].id);
        }
      }
      setClashTeams([...new Set(clashingTeams)]);

      // Check for winner
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

  // Setup game tick interval
  useEffect(() => {
    if (gameState.isPlaying && !gameState.winner) {
      tickIntervalRef.current = setInterval(gameTick, TICK_INTERVAL);
    } else {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    }

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.winner, gameTick]);

  // Join team handler
  const handleJoinTeam = (teamId: TeamId) => {
    setGameState((prev) => ({ ...prev, playerTeam: teamId }));
    const team = gameState.teams.find((t) => t.id === teamId);
    toast.success(`Joined ${team?.name}!`, { icon: "👥" });
  };

  // Add point handler
  const handleAddPoint = () => {
    if (!gameState.playerTeam) return;

    setGameState((prev) => {
      const updatedTeams = prev.teams.map((team) =>
        team.id === prev.playerTeam
          ? { ...team, points: Math.min(team.points + 1, targetPoints), lastGain: 1 }
          : team
      );

      // Check for winner
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

  // Toggle play/pause
  const handleTogglePlay = () => {
    setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    toast.info(gameState.isPlaying ? "Game Paused" : "Game Resumed", {
      icon: gameState.isPlaying ? "⏸️" : "▶️",
    });
  };

  // Restart game
  const handleRestart = () => {
    setGameState({
      teams: createInitialTeams(teamNames),
      winner: null,
      isPlaying: true,
      playerTeam: null,
    });
    setPrevRankings([1, 2, 3]);
    setShowWinAnimation(false);
    toast.success("Game Restarted!", { icon: "🔄" });
  };

  // Simulate win (debug)
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

  // Handle closing win animation
  const handleCloseWinAnimation = () => {
    setShowWinAnimation(false);
  };

  // Sort teams by points (descending)
  const sortedTeams = [...gameState.teams].sort((a, b) => b.points - a.points);
  const winningTeam = gameState.winner
    ? gameState.teams.find((t) => t.id === gameState.winner)
    : null;

  return (
    <div className={`min-h-screen pb-96 ${screenShake ? 'animate-screen-shake' : ''}`}>
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
      <main className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          {sortedTeams.map((team, index) => {
            const prevRank = prevRankings.indexOf(team.id) + 1;
            const currentRank = index + 1;
            const isOvertaking = prevRank > currentRank;
            const isClashing = clashTeams.includes(team.id);
            
            return (
              <TeamBar
                key={team.id}
                team={team}
                isWinner={team.id === gameState.winner}
                rank={currentRank}
                targetPoints={targetPoints}
                isOvertaking={isOvertaking}
                isClashing={isClashing}
              />
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
