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
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine>();
  const renderRef = useRef<Matter.Render>();
  const mouseConstraintRef = useRef<Matter.MouseConstraint>();
  const trophyBodyRef = useRef<Matter.Body>();

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

    // Create Matter.js engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent",
      },
    });
    renderRef.current = render;

    // Create boundaries (invisible walls)
    const wallOptions = { isStatic: true, render: { visible: false } };
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
      render: {
        fillStyle: "transparent",
      },
    });
    trophyBodyRef.current = trophy;
    bodies.push(trophy);

    // Team podium boxes
    const podiumY = window.innerHeight / 2 + 100;
    const podiumSpacing = 280;
    const startX = window.innerWidth / 2 - podiumSpacing;

    sortedTeams.forEach((team, index) => {
      const height = index === 0 ? 120 : index === 1 ? 90 : 70;
      const x = startX + index * podiumSpacing;
      const y = podiumY + (120 - height) / 2;

      const podium = Matter.Bodies.rectangle(x, y, 200, height, {
        restitution: 0.3,
        friction: 0.5,
        render: {
          fillStyle: colorMap[team.color],
        },
      });
      bodies.push(podium);
    });

    // Continue button (stays on screen with constraints)
    const continueButton = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 100,
      180,
      50,
      {
        restitution: 0.6,
        friction: 0.3,
        density: 0.01,
        render: {
          fillStyle: "hsl(var(--winner-gold))",
        },
      }
    );
    bodies.push(continueButton);

    // Add all bodies to world
    Matter.World.add(engine.world, [...walls, ...bodies]);

    // Mouse control for dragging trophy
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    mouseConstraintRef.current = mouseConstraint;

    // Only allow dragging the trophy
    Matter.Events.on(mouseConstraint, "startdrag", (event: any) => {
      if (event.body === trophy) {
        setIsDragging(true);
      } else {
        // Cancel drag if not trophy
        Matter.Body.setStatic(event.body, true);
        setTimeout(() => Matter.Body.setStatic(event.body, false), 0);
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

    // Run the engine and renderer
    Matter.Runner.run(engine);
    Matter.Render.run(render);

    return () => {
      clearTimeout(textTimer);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, [teams, winningTeam]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-hidden">
      <ParticleEffect trigger={showParticles} color={colorMap[winningTeam.color]} />

      {/* Physics Canvas */}
      <div ref={sceneRef} className="absolute inset-0 pointer-events-auto" />

      {showText && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Trophy with easter egg hint */}
          <div
            className="absolute"
            style={{
              left: trophyBodyRef.current ? trophyBodyRef.current.position.x - 60 : window.innerWidth / 2 - 60,
              top: trophyBodyRef.current ? trophyBodyRef.current.position.y - 60 : 140,
              width: 120,
              height: 120,
              transition: "all 0.05s ease-out",
            }}
          >
            <Trophy className="w-full h-full text-winner-gold animate-pulse-glow" />
            {!isDragging && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-winner-gold-glow whitespace-nowrap animate-pulse">
                ✨ Click & Drag me! ✨
              </div>
            )}
          </div>

          {/* Podium Display */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 flex items-end gap-8">
            {sortedTeams.map((team, index) => {
              const heights = { 0: "h-32", 1: "h-24", 2: "h-20" };
              const positions = ["1st", "2nd", "3rd"];

              return (
                <div
                  key={team.id}
                  className="flex flex-col items-center gap-2"
                  style={{ width: 200 }}
                >
                  {/* Team Info */}
                  <div className="text-center space-y-1 mb-2">
                    {index === 0 && <Crown className="w-8 h-8 text-winner-gold mx-auto animate-crown-bounce" />}
                    <h3 className="text-xl font-bold">{team.name}</h3>
                    <p className="text-3xl font-black text-winner-gold-glow">{Math.floor(team.points)}</p>
                  </div>

                  {/* Podium Block (visual only, physics is hidden) */}
                  <div
                    className={`w-full ${heights[index as 0 | 1 | 2]} rounded-t-lg flex items-center justify-center text-2xl font-black transition-all duration-500`}
                    style={{
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

          {/* Winner Title */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-winner-gold" />
              <h1 className="text-6xl font-black bg-gradient-winner bg-clip-text text-transparent">
                {winningTeam.name} WINS!
              </h1>
              <Sparkles className="w-8 h-8 text-winner-gold" />
            </div>
            <p className="text-xl text-muted-foreground animate-pulse">Victory achieved! 🎉</p>
          </div>

          {/* Continue Button (visual overlay on physics button) */}
          <div
            className="absolute pointer-events-auto"
            style={{
              left: window.innerWidth / 2 - 90,
              top: window.innerHeight - 125,
              width: 180,
            }}
          >
            <Button
              onClick={onContinue}
              size="lg"
              className="w-full h-12 text-lg font-black bg-gradient-winner border-2 border-winner-gold shadow-glow-winner hover:scale-105 transition-transform"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
