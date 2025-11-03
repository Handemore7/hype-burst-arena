import { useEffect, useState } from "react";
import { Team } from "@/types/game";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { Character3D } from "./Character3D";
import { Button } from "./ui/button";
import * as THREE from "three";

interface WinAnimationProps {
  teams: Team[];
  winningTeam: Team;
  onContinue: () => void;
}

// Mock messages for teams (simulating chat)
const winnerMessages = [
  "Let's gooooo! 🎉",
  "We're unstoppable!",
  "EZ Clap! 😎",
  "GG no re!",
  "Champions forever! 👑",
  "Too easy, too good!",
  "Victory tastes sweet!",
  "YESSSS! WE DID IT!",
  "Flawless victory! 🏆",
  "Who's next? 😤",
  "Built different! 💪",
  "That's how it's done!",
  "Peak performance! 🔥",
  "Unbeatable! 🎯",
];

const secondPlaceMessages = [
  "Not bad, not bad...",
  "We'll get 'em next time",
  "Congrats to the winners 👏",
  "Close one!",
  "Almost had it!",
  "GG, well played",
  "Second is still solid!",
  "Respectable performance",
  "We put up a fight!",
  "Could've been worse",
  "Decent showing today",
  "We tried our best",
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
  "I'm done... 😔",
  "How did this happen?",
  "Uninstalling... 💔",
  "We need practice...",
  "Absolutely destroyed 😭",
  "My eyes hurt from crying",
];

// Trophy shape with stars
const TrophyStars = () => {
  const points: [number, number, number][] = [];
  
  // Trophy cup outline
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 15 + Math.sin(i * 0.5) * 2;
    points.push([
      Math.cos(angle) * radius,
      30 + Math.sin(i * 0.3) * 3,
      Math.sin(angle) * radius,
    ]);
  }
  
  // Trophy handles
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    points.push([-18 - t * 3, 28 - t * 2, 0]);
    points.push([18 + t * 3, 28 - t * 2, 0]);
  }
  
  return (
    <group>
      {points.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

export const WinAnimation = ({ teams, winningTeam, onContinue }: WinAnimationProps) => {
  const [showScene, setShowScene] = useState(false);
  const [messageIndices, setMessageIndices] = useState([0, 0, 0]);

  const colorMap: Record<string, string> = {
    red: "hsl(0 84% 60%)",
    purple: "hsl(271 81% 56%)",
    blue: "hsl(217 91% 60%)",
    green: "hsl(142 71% 45%)",
    yellow: "hsl(48 96% 53%)",
    cyan: "hsl(199 89% 48%)",
    amber: "hsl(43 96% 56%)",
  };

  // Saturated versions for podiums and titles - More vivid and bright
  const saturatedColorMap: Record<string, string> = {
    red: "hsl(5 100% 50%)",
    purple: "hsl(280 100% 50%)",
    blue: "hsl(220 100% 50%)",
    green: "hsl(120 100% 50%)",
    yellow: "hsl(30 100% 50%)",
    cyan: "hsl(220 100% 50%)",
    amber: "hsl(50 100% 50%)",
  };

  // Sort teams by rank (winner first, then by points)
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.id === winningTeam.id) return -1;
    if (b.id === winningTeam.id) return 1;
    return b.points - a.points;
  });

  // Get top 3 teams
  const topThree = sortedTeams.slice(0, 3);

  // Calculate victory type based on point difference
  const pointDifference = topThree[0].points - topThree[1].points;
  let victoryType = "Close Victory!";
  if (pointDifference >= 100) {
    victoryType = "Absolute Victory!";
  } else if (pointDifference >= 50) {
    victoryType = "Dominant Victory!";
  } else if (pointDifference >= 20) {
    victoryType = "Nice Victory!";
  }

  // Rotate messages every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndices([
        Math.floor(Math.random() * winnerMessages.length),
        Math.floor(Math.random() * secondPlaceMessages.length),
        Math.floor(Math.random() * thirdPlaceMessages.length),
      ]);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const messages = [
    winnerMessages[messageIndices[0]],
    secondPlaceMessages[messageIndices[1]],
    thirdPlaceMessages[messageIndices[2]],
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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-primary/20 via-background to-accent/20">
      {/* Title */}
      <div className="absolute w-full top-8 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h1 
          className="text-7xl pb-5 font-black animate-pulse drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]"
          style={{ 
            color: saturatedColorMap[winningTeam.color],
            textShadow: `0 0 40px ${saturatedColorMap[winningTeam.color]}, 0 0 80px ${saturatedColorMap[winningTeam.color]}`,
          }}
        >
          🏆 {winningTeam.name} WINS! 🏆
        </h1>
        <p 
          className="text-2xl mt-2 animate-fade-in font-bold"
          style={{ 
            color: saturatedColorMap[winningTeam.color],
            textShadow: `0 0 20px ${saturatedColorMap[winningTeam.color]}`,
          }}
        >
          {Math.floor(topThree[0].points)} Points - {victoryType}
        </p>
      </div>

      {/* 3D Scene */}
      {showScene && (
        <Canvas className="w-full h-full">
          <PerspectiveCamera makeDefault position={[0, 5, 12]} />
          
          {/* Enhanced Lighting - Much brighter! */}
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
          <pointLight position={[-10, 10, -10]} intensity={2.5} color="#ffffff" />
          <pointLight position={[0, 15, 5]} intensity={4} color="#FFD700" />
          <pointLight position={[5, 8, 5]} intensity={2} color="#FF69B4" />
          <pointLight position={[-5, 8, 5]} intensity={2} color="#00FFFF" />
          <spotLight
            position={[0, 20, 0]}
            angle={0.8}
            penumbra={0.5}
            intensity={5}
            castShadow
            color="#ffffff"
          />
          <spotLight
            position={[0, 10, 10]}
            angle={0.5}
            penumbra={1}
            intensity={3}
            color="#FFD700"
          />

          {/* Sky background sphere with stars */}
          <mesh>
            <sphereGeometry args={[100, 32, 32]} />
            <meshBasicMaterial color="#111140" side={THREE.BackSide} />
          </mesh>

          {/* Random stars scattered in the sky */}
          {[...Array(200)].map((_, i) => {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 80 + Math.random() * 15;
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            return (
              <mesh key={`star-${i}`} position={[x, y, z]}>
                <sphereGeometry args={[0.1 + Math.random() * 0.2, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            );
          })}

          {/* Trophy-shaped stars */}
          <TrophyStars />

          {/* Characters and podiums */}
          {displayOrder.map((item, index) => {
            if (!item.team) return null;
            
            const teamSaturatedColor = saturatedColorMap[item.team.color];
            
            // Convert HSL string to THREE.Color
            const parseSaturatedColor = (hslString: string) => {
              const match = hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
              if (match) {
                const [, h, s, l] = match;
                return new THREE.Color().setHSL(
                  parseInt(h) / 360,
                  parseInt(s) / 100,
                  parseInt(l) / 100
                );
              }
              return new THREE.Color(hslString);
            };
            
            const saturatedThreeColor = parseSaturatedColor(teamSaturatedColor);
            
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

                {/* Podium - Team colored with high saturation */}
                <mesh position={[item.position[0], item.height / 2 - 0.5, item.position[2]]}>
                  <boxGeometry args={[1.8, item.height, 1.8]} />
                  <meshStandardMaterial
                    color={saturatedThreeColor}
                    metalness={0.8}
                    roughness={0.2}
                    emissive={saturatedThreeColor}
                    emissiveIntensity={0.6}
                  />
                </mesh>

                {/* Points score - Large and centered */}
                <Text
                  position={[item.position[0], item.height / 2 + 0.2, item.position[2] + 0.91]}
                  fontSize={0.55}
                  color="#000000"
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="black"
                  outlineWidth={0.03}
                  outlineColor="#FFFFFF"
                >
                  {Math.floor(item.team.points)}
                </Text>

                {/* Team name - Centered below score */}
                <Text
                  position={[item.position[0], item.height / 2 - 0.35, item.position[2] + 0.91]}
                  fontSize={0.2}
                  color="#000000"
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                  maxWidth={1.6}
                  textAlign="center"
                  outlineWidth={0.015}
                  outlineColor="#FFFFFF"
                >
                  {item.team.name}
                </Text>
              </group>
            );
          })}

          {/* Ground - Brighter with gradient effect */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial 
              color="#2a2a4e" 
              metalness={0.6} 
              roughness={0.4}
              emissive="#1a1a3e"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Auto-rotating camera */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 2.5, 0]}
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
    </div>
  );
};
