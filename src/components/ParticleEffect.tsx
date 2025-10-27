import { useEffect, useState } from "react";
import { Particle } from "@/types/game";

interface ParticleEffectProps {
  trigger: boolean;
  color: string;
  onComplete?: () => void;
}

export const ParticleEffect = ({ trigger, color, onComplete }: ParticleEffectProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    // Generate particles
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x: 50, // Center
      y: 50, // Center
      color,
      tx: (Math.random() - 0.5) * 200,
      ty: (Math.random() - 0.5) * 200,
    }));

    setParticles(newParticles);

    // Clean up after animation
    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [trigger, color, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-4 h-4 rounded-full animate-particle-burst"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            boxShadow: `0 0 10px ${particle.color}`,
            "--tx": `${particle.tx}px`,
            "--ty": `${particle.ty}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
