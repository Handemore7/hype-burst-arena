import { useEffect, useState } from "react";
import { Team } from "@/types/game";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import { Character3D } from "./Character3D";
import { Button } from "./ui/button";
import * as THREE from "three";

interface WinAnimationProps {
  teams: Team[];
  winningTeam: Team;
  onContinue: () => void;
}

// Mock messages for teams
const winnerMessages = [
  "Let's gooooo! 🎉",
  "We're unstoppable!",
  "EZ Clap! 😎",
  "GG no re!",
  "Champions forever! 👑",
  "Too easy, too good!",
  "Victory tastes sweet!",
];

const secondPlaceMessages = [
  "Not bad, not bad...",
  "We'll get 'em next time",
  "Congrats to the winners 👏",
  "Close one!",
  "Almost had it!",
  "GG, well played",
  "Second is still solid!",
];

const thirdPlaceMessages = [
  "We tried our best... 😭",
  "This is embarrassing...",
  "I can't believe this...",
  "We're a meme now 💀",
  "Pain. Just pain.",
  "Next time... maybe... 😢",
  "I need a break...",
  "Why us?!",
];

export const WinAnimation = ({ teams, winningTeam, onContinue }: WinAnimationProps) => {
  const [showScene, setShowScene] = useState(false);

  const colorMap: Record<string, string> = {
    red: "hsl(0 84% 60%)",
    purple: "hsl(271 81% 56%)",
    blue: "hsl(217 91% 60%)",
    green: "hsl(142 71% 45%)",
    yellow: "hsl(48 96% 53%)",
    cyan: "hsl(199 89% 48%)",
    amber: "hsl(43 96% 56%)",
  };

  // Sort teams by rank (winner first, then by points)
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.id === winningTeam.id) return -1;
    if (b.id === winningTeam.id) return 1;
    return b.points - a.points;
  });

  // Get top 3 teams
  const topThree = sortedTeams.slice(0, 3);

  // Randomly select messages
  const messages = [
    winnerMessages[Math.floor(Math.random() * winnerMessages.length)],
    secondPlaceMessages[Math.floor(Math.random() * secondPlaceMessages.length)],
    thirdPlaceMessages[Math.floor(Math.random() * thirdPlaceMessages.length)],
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowScene(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Podium positions: left (2nd), center (1st), right (3rd)
  const positions: [number, number, number][] = [
    [-3, 1.5, 0],  // 2nd place
    [0, 2, 0],     // 1st place (center, higher)
    [3, 1, 0],     // 3rd place
  ];

  const podiumHeights = [1.5, 2.5, 1]; // Heights for 2nd, 1st, 3rd

  // Reorder for display: 2nd, 1st, 3rd
  const displayOrder = [
    { team: topThree[1], rank: 2, message: messages[1], position: positions[0], height: podiumHeights[0] },
    { team: topThree[0], rank: 1, message: messages[0], position: positions[1], height: podiumHeights[1] },
    { team: topThree[2], rank: 3, message: messages[2], position: positions[2], height: podiumHeights[2] },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-background via-background/95 to-primary/20">
      {/* Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-winner-gold via-winner-gold-glow to-winner-gold animate-pulse">
          🏆 {winningTeam.name} WINS! 🏆
        </h1>
        <p className="text-2xl text-muted-foreground mt-2 animate-fade-in">
          {Math.floor(topThree[0].points)} Points - Absolute Victory!
        </p>
      </div>

      {/* 3D Scene */}
      {showScene && (
        <Canvas className="w-full h-full">
          <PerspectiveCamera makeDefault position={[0, 3, 12]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <spotLight
            position={[0, 10, 0]}
            angle={0.6}
            penumbra={1}
            intensity={2}
            castShadow
          />

          {/* Starry background */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* Characters and podiums */}
          {displayOrder.map((item, index) => {
            if (!item.team) return null;
            
            return (
              <group key={item.team.id}>
                {/* Character */}
                <Character3D
                  position={item.position}
                  color={colorMap[item.team.color]}
                  rank={item.rank}
                  teamName={item.team.name}
                  message={item.message}
                />

                {/* Podium */}
                <mesh position={[item.position[0], item.height / 2 - 0.5, item.position[2]]}>
                  <boxGeometry args={[1.5, item.height, 1.5]} />
                  <meshStandardMaterial
                    color={item.rank === 1 ? "#FFD700" : item.rank === 2 ? "#C0C0C0" : "#CD7F32"}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>

                {/* Rank number on podium */}
                <mesh position={[item.position[0], item.height + 0.1, item.position[2] + 0.76]}>
                  <planeGeometry args={[0.8, 0.8]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[item.position[0], item.height + 0.1, item.position[2] + 0.77]}>
                  <planeGeometry args={[0.6, 0.6]} />
                  <meshStandardMaterial
                    color={item.rank === 1 ? "#FFD700" : item.rank === 2 ? "#C0C0C0" : "#CD7F32"}
                  />
                </mesh>

                {/* Points display */}
                <mesh position={[item.position[0], item.height + 0.1, item.position[2] - 0.76]} rotation={[0, Math.PI, 0]}>
                  <planeGeometry args={[1.2, 0.4]} />
                  <meshStandardMaterial color="#000000" opacity={0.7} transparent />
                </mesh>
              </group>
            );
          })}

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.8} />
          </mesh>

          {/* Optional: Allow user to rotate view slightly */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 6}
            maxAzimuthAngle={Math.PI / 6}
          />
        </Canvas>
      )}

      {/* Continue Button */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <Button
          onClick={onContinue}
          size="lg"
          className="text-xl font-black px-12 py-6 bg-gradient-winner border-2 border-winner-gold shadow-glow-winner hover:scale-110 transition-transform animate-pulse"
        >
          Continue to Next Round
        </Button>
      </div>

      {/* Podium labels */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl flex justify-between px-8 pointer-events-none">
        {displayOrder.map((item, index) => {
          if (!item.team) return <div key={index} />;
          
          return (
            <div
              key={item.team.id}
              className="text-center"
              style={{
                transform: index === 0 ? 'translateX(-50%)' : index === 2 ? 'translateX(50%)' : 'none'
              }}
            >
              <p className={`text-2xl font-black ${item.rank === 1 ? 'text-winner-gold-glow' : 'text-muted-foreground'}`}>
                {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'} {item.team.name}
              </p>
              <p className={`text-xl font-bold ${item.rank === 1 ? 'text-winner-gold' : 'text-muted-foreground'}`}>
                {Math.floor(item.team.points)} pts
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
