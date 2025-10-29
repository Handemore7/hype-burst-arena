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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine>();
  const renderRef = useRef<Matter.Render>();
  const mouseConstraintRef = useRef<Matter.MouseConstraint>();
  const trophyBodyRef = useRef<Matter.Body>();
  const podiumBodiesRef = useRef<Matter.Body[]>([]);
  const continueButtonBodyRef = useRef<Matter.Body>();
  const animationFrameRef = useRef<number>();
  const touchedBodiesRef = useRef<Set<Matter.Body>>(new Set());
  const bodyConstraintsRef = useRef<Map<Matter.Body, Matter.Constraint>>(new Map());

  const colorMap: Record<string, string> = {
    red: "hsl(var(--team-red))",
    purple: "hsl(var(--team-purple))",
    blue: "hsl(var(--team-blue))",
    green: "hsl(var(--team-green))",
    yellow: "hsl(var(--team-yellow))",
    cyan: "hsl(var(--team-cyan))",
    amber: "hsl(var(--team-amber))",
  };

  const colorGradientMap: Record<string, string> = {
    red: "linear-gradient(135deg, hsl(0 84% 60%), hsl(0 84% 70%))",
    purple: "linear-gradient(135deg, hsl(271 81% 56%), hsl(271 81% 66%))",
    blue: "linear-gradient(135deg, hsl(217 91% 60%), hsl(217 91% 70%))",
    green: "linear-gradient(135deg, hsl(142 71% 45%), hsl(142 71% 55%))",
    yellow: "linear-gradient(135deg, hsl(48 96% 53%), hsl(48 96% 63%))",
    cyan: "linear-gradient(135deg, hsl(199 89% 48%), hsl(199 89% 58%))",
    amber: "linear-gradient(135deg, hsl(43 96% 56%), hsl(43 96% 66%))",
  };

  // Sort teams by rank (winner first, then by points)
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.id === winningTeam.id) return -1;
    if (b.id === winningTeam.id) return 1;
    return b.points - a.points;
  });

  // Reorder for podium display: 2nd place (left), 1st place (center), 3rd place (right)
  const podiumOrder = [sortedTeams[1], sortedTeams[0], sortedTeams[2]];

  useEffect(() => {
    if (!sceneRef.current) return;

    // Trigger particles and text
    setShowParticles(true);
    const textTimer = setTimeout(() => setShowText(true), 300);

    // Create Matter.js engine with proper gravity
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 }, // Normal gravity scale
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

    // Team podium boxes - arranged as 2nd (left), 1st (center), 3rd (right)
    const podiumY = window.innerHeight / 2 + 100;
    const podiumSpacing = 280;
    const startX = window.innerWidth / 2 - podiumSpacing;

    // Trophy positioned above the winning team (center position)
    const trophyX = window.innerWidth / 2;
    const trophyY = podiumY - 180; // Above the team name

    // Trophy (draggable, not affected by gravity initially)
    const trophy = Matter.Bodies.circle(trophyX, trophyY, 60, {
      restitution: 0.6,
      friction: 0.1,
      density: 0.02,
      frictionAir: 0.05, // Add air resistance to slow it down when not dragged
      collisionFilter: {
        category: 0x0001, // Trophy category - only this can be dragged
        mask: 0xFFFF, // Can collide with everything
      }
    });
    trophyBodyRef.current = trophy;
    bodies.push(trophy);
    setTrophyPos({ x: trophy.position.x, y: trophy.position.y });

    const podiumBodies: Matter.Body[] = [];
    const podiumConstraints: Matter.Constraint[] = [];

    podiumOrder.forEach((team, visualIndex) => {
      // Heights based on actual rank: 1st=120, 2nd=90, 3rd=70
      const actualRank = sortedTeams.indexOf(team);
      const height = actualRank === 0 ? 120 : actualRank === 1 ? 90 : 70;
      const x = startX + visualIndex * podiumSpacing;
      const y = podiumY + (120 - height) / 2;

      const podium = Matter.Bodies.rectangle(x, y, 200, height, {
        restitution: 0.3,
        friction: 0.5,
        density: 0.01,
        collisionFilter: {
          category: 0x0002, // Different category - not draggable
          mask: 0xFFFF, // Can collide with everything
        }
        // NOT static - let it be dynamic from the start
      });
      bodies.push(podium);
      podiumBodies.push(podium);

      // Create a constraint to hold it in place
      const constraint = Matter.Constraint.create({
        bodyA: podium,
        pointB: { x: podium.position.x, y: podium.position.y },
        stiffness: 1,
        length: 0,
      });
      podiumConstraints.push(constraint);
      bodyConstraintsRef.current.set(podium, constraint);
    });
    podiumBodiesRef.current = podiumBodies;

    // Continue button (initially held by constraint)
    const continueButton = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 100,
      180,
      50,
      {
        restitution: 0.6,
        friction: 0.3,
        density: 0.005,
        collisionFilter: {
          category: 0x0002, // Different category - not draggable
          mask: 0xFFFF, // Can collide with everything
        }
        // NOT static
      }
    );
    bodies.push(continueButton);
    continueButtonBodyRef.current = continueButton;

    const buttonConstraint = Matter.Constraint.create({
      bodyA: continueButton,
      pointB: { x: continueButton.position.x, y: continueButton.position.y },
      stiffness: 1,
      length: 0,
    });
    bodyConstraintsRef.current.set(continueButton, buttonConstraint);

    // Add all bodies to world
    Matter.World.add(engine.world, [...walls, ...bodies]);

    // Add all constraints to world (to hold podiums and button in place)
    Matter.World.add(engine.world, [...podiumConstraints, buttonConstraint]);

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
    canvas.style.cursor = 'grab';
    sceneRef.current.appendChild(canvas);

    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      },
      collisionFilter: {
        mask: 0x0001, // Only interact with trophy (category 0x0001)
      }
    });
    mouseConstraintRef.current = mouseConstraint;

    // Create a constraint to hold the trophy in place initially
    const trophyAnchor = Matter.Constraint.create({
      bodyA: trophy,
      pointB: { x: trophy.position.x, y: trophy.position.y },
      stiffness: 1,
      length: 0,
    });
    Matter.World.add(engine.world, trophyAnchor);

    // Only allow dragging the trophy and remove anchor when dragged
    Matter.Events.on(mouseConstraint, "startdrag", (event: any) => {
      if (event.body === trophy) {
        setIsDragging(true);
        canvas.style.cursor = 'grabbing';
        // Remove the anchor constraint so trophy can move freely
        Matter.World.remove(engine.world, trophyAnchor);
      }
    });

    Matter.Events.on(mouseConstraint, "enddrag", () => {
      setIsDragging(false);
      canvas.style.cursor = 'grab';
    });

    Matter.World.add(engine.world, mouseConstraint);

    // Collision detection - release bodies when touched by trophy
    Matter.Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        // Check if trophy is colliding with a body
        if (bodyA === trophy || bodyB === trophy) {
          const otherBody = bodyA === trophy ? bodyB : bodyA;

          // Debug: Log collision
          const bodyType = podiumBodies.includes(otherBody) ? "Podium" :
            otherBody === continueButton ? "Button" : "Unknown";
          console.log(`Collision with ${bodyType}`, {
            hasConstraint: bodyConstraintsRef.current.has(otherBody),
            alreadyTouched: touchedBodiesRef.current.has(otherBody),
            isWall: walls.includes(otherBody),
            velocity: otherBody.velocity,
            trophyVelocity: trophy.velocity
          });

          // If the other body hasn't been touched yet and has a constraint, release it
          if (!touchedBodiesRef.current.has(otherBody) &&
            bodyConstraintsRef.current.has(otherBody) &&
            !walls.includes(otherBody)) {

            console.log(`✅ Releasing ${bodyType} - removing constraint`);

            // Remove the constraint holding it in place
            const constraint = bodyConstraintsRef.current.get(otherBody);
            if (constraint) {
              Matter.World.remove(engine.world, constraint);
              bodyConstraintsRef.current.delete(otherBody);
            }

            touchedBodiesRef.current.add(otherBody);

            // Give it an initial velocity based on trophy's velocity to create impact effect
            const velocityScale = 1.5;
            Matter.Body.setVelocity(otherBody, {
              x: trophy.velocity.x * velocityScale,
              y: trophy.velocity.y * velocityScale,
            });

            // Also apply an angular velocity for rotation
            Matter.Body.setAngularVelocity(otherBody, (Math.random() - 0.5) * 0.2);

            console.log(`After release:`, {
              velocity: otherBody.velocity,
              angularVelocity: otherBody.angularVelocity,
              mass: otherBody.mass,
            });
          }
        }
      });
    });

    // Keep continue button within bounds (only when released from constraint)
    Matter.Events.on(engine, "beforeUpdate", () => {
      if (!bodyConstraintsRef.current.has(continueButton)) {
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
      }
    });

    // Run the engine
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Debug: Periodic status check
    const debugInterval = setInterval(() => {
      const debugLines: string[] = [];
      debugLines.push(`Trophy: constrained=${bodyConstraintsRef.current.has(trophy)}, vel=(${trophy.velocity.x.toFixed(2)}, ${trophy.velocity.y.toFixed(2)})`);

      podiumBodies.forEach((body, idx) => {
        const hasConstraint = bodyConstraintsRef.current.has(body);
        debugLines.push(`Podium ${idx}: locked=${hasConstraint}, vel=(${body.velocity.x.toFixed(2)}, ${body.velocity.y.toFixed(2)}), pos=(${body.position.x.toFixed(0)}, ${body.position.y.toFixed(0)})`);
      });

      const btnHasConstraint = bodyConstraintsRef.current.has(continueButton);
      debugLines.push(`Button: locked=${btnHasConstraint}, vel=(${continueButton.velocity.x.toFixed(2)}, ${continueButton.velocity.y.toFixed(2)})`);
      debugLines.push(`Touched bodies: ${touchedBodiesRef.current.size}`);

      setDebugInfo(debugLines);
    }, 500);

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
      clearInterval(debugInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      Matter.Engine.clear(engine);
      Matter.Runner.stop(runner);
    };
  }, [teams, winningTeam]);

  // Keyboard shortcut for debug toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-hidden">
      <ParticleEffect trigger={showParticles} color={colorMap[winningTeam.color]} />

      {/* Debug Toggle Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="absolute top-4 right-4 z-[200] bg-black/80 text-yellow-400 px-3 py-2 rounded-lg font-mono text-xs hover:bg-black/90 transition-colors"
        title="Toggle Debug Mode (D)"
      >
        🐛 {showDebug ? 'Hide' : 'Show'} Debug
      </button>

      {/* Debug Overlay */}
      {showDebug && (
        <div className="absolute top-4 left-4 z-[200] bg-black/80 text-green-400 p-4 rounded-lg font-mono text-xs max-w-md">
          <div className="font-bold mb-2 text-yellow-400">🐛 DEBUG MODE (Press D to toggle)</div>
          {debugInfo.map((line, idx) => (
            <div key={idx} className="mb-1">{line}</div>
          ))}
        </div>
      )}

      {/* Physics Container */}
      <div ref={sceneRef} className="absolute inset-0" />

      {showText && (
        <>
          {/* Winner Title - Behind Trophy */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8" style={{ color: colorMap[winningTeam.color] }} />
              <h1
                className="text-6xl font-black"
                style={{
                  background: colorGradientMap[winningTeam.color],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {winningTeam.name} WINS!
              </h1>
              <Sparkles className="w-8 h-8" style={{ color: colorMap[winningTeam.color] }} />
            </div>
            <p className="text-xl text-muted-foreground animate-pulse">Victory achieved! 🎉</p>
          </div>

          {/* Podium Display - synced with physics */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {podiumOrder.map((team, visualIndex) => {
              const actualRank = sortedTeams.indexOf(team);
              const heights = { 0: 120, 1: 90, 2: 70 };
              const positions = ["1st", "2nd", "3rd"];
              const pos = podiumPositions[visualIndex];

              if (!pos) return null;

              return (
                <div
                  key={team.id}
                  className="absolute"
                  style={{
                    left: pos.x - 100,
                    top: pos.y - heights[actualRank as 0 | 1 | 2] / 2,
                    width: 200,
                    transform: `rotate(${pos.angle}rad)`,
                    transition: 'none',
                  }}
                >
          {/* Team Info Above Podium */}
                  <div className={`absolute -top-28 left-0 w-full text-center space-y-1 ${actualRank !== 0 ? 'animate-loser-shrink' : ''}`}>
                    {actualRank === 0 && <Crown className="w-10 h-10 text-winner-gold mx-auto animate-crown-bounce" />}
                    <h3 className={`text-xl font-bold ${actualRank === 0 ? 'text-2xl' : ''}`}>{team.name}</h3>
                    <p className={`text-3xl font-black ${actualRank === 0 ? 'text-4xl text-winner-gold-glow' : 'text-muted-foreground'}`}>
                      {Math.floor(team.points)}
                    </p>
                    {actualRank === 0 && team.streak > 0 && (
                      <p className="text-sm text-winner-gold">🔥 {team.streak}x Streak</p>
                    )}
                  </div>

                  {/* Podium Block */}
                  <div
                    className={`w-full rounded-t-lg flex items-center justify-center text-3xl font-black ${actualRank !== 0 ? 'animate-loser-shrink' : ''}`}
                    style={{
                      height: heights[actualRank as 0 | 1 | 2],
                      background: actualRank === 0 ? 'linear-gradient(135deg, hsl(var(--winner-gold)), hsl(var(--winner-gold-glow)))' : `linear-gradient(135deg, ${colorMap[team.color]}, hsl(var(--loser-gray)))`,
                      boxShadow: actualRank === 0 ? `0 0 60px ${colorMap[team.color]}` : `0 0 20px ${colorMap[team.color]}50`,
                    }}
                  >
                    {positions[actualRank]}
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
            className="absolute z-[150]"
            style={{
              left: continueButtonPos.x - 90,
              top: continueButtonPos.y - 25,
              width: 180,
              transform: `rotate(${continueButtonPos.angle}rad)`,
              transition: 'none',
              pointerEvents: 'auto',
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
