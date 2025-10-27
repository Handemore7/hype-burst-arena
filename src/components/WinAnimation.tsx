import { useEffect, useState, useRef } from "react";
import { Team } from "@/types/game";
import { Crown, Sparkles, Trophy } from "lucide-react";
import { ParticleEffect } from "./ParticleEffect";
import Matter from "matter-js";
import { Button } from "./ui/button";

interface WinAnimationProps {
  teams: Team[];
  winningTeam: Team;
  onContinue: () => void;
}

export const WinAnimation = ({ teams, winningTeam, onContinue }: WinAnimationProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [trophyPos, setTrophyPos] = useState({ x: 0, y: 0 });
  const [podiumPositions, setPodiumPositions] = useState<Array<{ x: number; y: number; angle: number }>>([]);
  const [continueButtonPos, setContinueButtonPos] = useState({ x: 0, y: 0, angle: 0 });
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine>();
  const renderRef = useRef<Matter.Render>();
  const mouseConstraintRef = useRef<Matter.MouseConstraint>();
  const trophyBodyRef = useRef<Matter.Body>();
  const podiumBodiesRef = useRef<Matter.Body[]>([]);
  const continueButtonBodyRef = useRef<Matter.Body>();
  const animationFrameRef = useRef<number>();

  const colorMap = {
    cyan: "hsl(var(--team-cyan))",
    purple: "hsl(var(--team-purple))",
    amber: "hsl(var(--team-amber))",
  };

  // Sort teams by rank (winner first)
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.id === winningTeam.id) return -1;
    if (b.id === winningTeam.id) return 1;
    return b.points - a.points;
  });

  useEffect(() => {
    if (!sceneRef.current) return;

    // Trigger particles and text
    setShowParticles(true);
    const textTimer = setTimeout(() => setShowText(true), 300);

    // Create Matter.js engine (hidden, just for physics)
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });
    engineRef.current = engine;

    // Create boundaries (invisible walls)
    const wallOptions = { isStatic: true };
    const walls = [
      Matter.Bodies.rectangle(window.innerWidth / 2, -25, window.innerWidth, 50, wallOptions), // top
      Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth, 50, wallOptions), // bottom
      Matter.Bodies.rectangle(-25, window.innerHeight / 2, 50, window.innerHeight, wallOptions), // left
      Matter.Bodies.rectangle(window.innerWidth + 25, window.innerHeight / 2, 50, window.innerHeight, wallOptions), // right
    ];

    // Create physical bodies for UI elements
    const bodies: Matter.Body[] = [];

    // Trophy (draggable)
    const trophy = Matter.Bodies.circle(window.innerWidth / 2, 200, 60, {
      restitution: 0.6,
      friction: 0.1,
      density: 0.02,
    });
    trophyBodyRef.current = trophy;
    bodies.push(trophy);
    setTrophyPos({ x: trophy.position.x, y: trophy.position.y });

    // Team podium boxes
    const podiumY = window.innerHeight / 2 + 100;
    const podiumSpacing = 280;
    const startX = window.innerWidth / 2 - podiumSpacing;

    const podiumBodies: Matter.Body[] = [];
    sortedTeams.forEach((team, index) => {
      const height = index === 0 ? 120 : index === 1 ? 90 : 70;
      const x = startX + index * podiumSpacing;
      const y = podiumY + (120 - height) / 2;

      const podium = Matter.Bodies.rectangle(x, y, 200, height, {
        restitution: 0.3,
        friction: 0.5,
        density: 0.01,
      });
      bodies.push(podium);
      podiumBodies.push(podium);
    });
    podiumBodiesRef.current = podiumBodies;

    // Continue button (stays on screen with constraints)
    const continueButton = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 100,
      180,
      50,
      {
        restitution: 0.6,
        friction: 0.3,
        density: 0.005,
      }
    );
    bodies.push(continueButton);
    continueButtonBodyRef.current = continueButton;

    // Add all bodies to world
    Matter.World.add(engine.world, [...walls, ...bodies]);

    // Mouse control - create invisible canvas for physics
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'auto';
    canvas.style.zIndex = '100';
    canvas.style.opacity = '0';
    sceneRef.current.appendChild(canvas);

    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
      },
    });
    mouseConstraintRef.current = mouseConstraint;

    // Only allow dragging the trophy
    Matter.Events.on(mouseConstraint, "startdrag", (event: any) => {
      if (event.body === trophy) {
        setIsDragging(true);
      }
    });

    Matter.Events.on(mouseConstraint, "enddrag", () => {
      setIsDragging(false);
    });

    Matter.World.add(engine.world, mouseConstraint);

    // Keep continue button within bounds
    Matter.Events.on(engine, "beforeUpdate", () => {
      const btnPos = continueButton.position;
      const margin = 100;

      if (btnPos.x < margin) {
        Matter.Body.setPosition(continueButton, { x: margin, y: btnPos.y });
      }
      if (btnPos.x > window.innerWidth - margin) {
        Matter.Body.setPosition(continueButton, { x: window.innerWidth - margin, y: btnPos.y });
      }
      if (btnPos.y < margin) {
        Matter.Body.setPosition(continueButton, { x: btnPos.x, y: margin });
      }
      if (btnPos.y > window.innerHeight - margin) {
        Matter.Body.setPosition(continueButton, { x: btnPos.x, y: window.innerHeight - margin });
      }
    });

    // Run the engine
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Animation loop to sync visual elements with physics bodies
    const updatePositions = () => {
      if (trophyBodyRef.current) {
        setTrophyPos({
          x: trophyBodyRef.current.position.x,
          y: trophyBodyRef.current.position.y,
        });
      }

      if (podiumBodiesRef.current.length > 0) {
        setPodiumPositions(
          podiumBodiesRef.current.map(body => ({
            x: body.position.x,
            y: body.position.y,
            angle: body.angle,
          }))
        );
      }

      if (continueButtonBodyRef.current) {
        setContinueButtonPos({
          x: continueButtonBodyRef.current.position.x,
          y: continueButtonBodyRef.current.position.y,
          angle: continueButtonBodyRef.current.angle,
        });
      }

      animationFrameRef.current = requestAnimationFrame(updatePositions);
    };
    updatePositions();

    return () => {
      clearTimeout(textTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      Matter.Engine.clear(engine);
      Matter.Runner.stop(runner);
    };
  }, [teams, winningTeam]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-hidden">
      <ParticleEffect trigger={showParticles} color={colorMap[winningTeam.color]} />

      {/* Physics Container */}
      <div ref={sceneRef} className="absolute inset-0" />

      {showText && (
        <>
          {/* Winner Title - Behind Trophy */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-winner-gold" />
              <h1 className="text-6xl font-black bg-gradient-winner bg-clip-text text-transparent">
                {winningTeam.name} WINS!
              </h1>
              <Sparkles className="w-8 h-8 text-winner-gold" />
            </div>
            <p className="text-xl text-muted-foreground animate-pulse">Victory achieved! 🎉</p>
          </div>

          {/* Podium Display - synced with physics */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {sortedTeams.map((team, index) => {
              const heights = { 0: 120, 1: 90, 2: 70 };
              const positions = ["1st", "2nd", "3rd"];
              const pos = podiumPositions[index];

              if (!pos) return null;

              return (
                <div
                  key={team.id}
                  className="absolute"
                  style={{
                    left: pos.x - 100,
                    top: pos.y - heights[index as 0 | 1 | 2] / 2,
                    width: 200,
                    transform: `rotate(${pos.angle}rad)`,
                    transition: 'none',
                  }}
                >
                  {/* Team Info Above Podium */}
                  <div className="absolute -top-24 left-0 w-full text-center space-y-1">
                    {index === 0 && <Crown className="w-8 h-8 text-winner-gold mx-auto animate-crown-bounce" />}
                    <h3 className="text-xl font-bold">{team.name}</h3>
                    <p className="text-3xl font-black text-winner-gold-glow">{Math.floor(team.points)}</p>
                  </div>

                  {/* Podium Block */}
                  <div
                    className="w-full rounded-t-lg flex items-center justify-center text-2xl font-black"
                    style={{
                      height: heights[index as 0 | 1 | 2],
                      background: colorMap[team.color],
                      boxShadow: `0 0 30px ${colorMap[team.color]}`,
                    }}
                  >
                    {positions[index]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trophy - Above Everything */}
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: trophyPos.x - 60,
              top: trophyPos.y - 60,
              width: 120,
              height: 120,
              transition: isDragging ? 'none' : 'all 0.05s ease-out',
            }}
          >
            <Trophy className="w-full h-full text-winner-gold animate-pulse-glow drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
            {!isDragging && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-winner-gold-glow whitespace-nowrap animate-pulse">
                ✨ Click & Drag me! ✨
              </div>
            )}
          </div>

          {/* Continue Button - synced with physics */}
          <div
            className="absolute z-30"
            style={{
              left: continueButtonPos.x - 90,
              top: continueButtonPos.y - 25,
              width: 180,
              transform: `rotate(${continueButtonPos.angle}rad)`,
              transition: 'none',
            }}
          >
            <Button
              onClick={onContinue}
              size="lg"
              className="w-full h-12 text-lg font-black bg-gradient-winner border-2 border-winner-gold shadow-glow-winner hover:scale-105 transition-transform pointer-events-auto"
            >
              Continue
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
