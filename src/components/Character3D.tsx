import { useRef, useMemo, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Billboard } from "@react-three/drei";

interface Character3DProps {
  position: [number, number, number];
  color: string;
  rank: number;
  teamName: string;
  message: string;
}

/*
  3D character component for victory podium
  - winner does backflips and victory poses
  - 2nd place stands calmly or claps
  - 3rd place kneels and cries
  click to toggle alternate poses
  includes rank badge worn like a medal on the neck
*/
export const Character3D = ({ position, color, rank, teamName, message }: Character3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const messageRef = useRef<THREE.Group>(null);

  // Animation state
  const animationTime = useRef(0);
  const [alternatePose, setAlternatePose] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setAlternatePose(!alternatePose);
  };

  // Create color from HSL string
  const threeColor = useMemo(() => {
    const match = color.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
    if (match) {
      const [, h, s, l] = match;
      return new THREE.Color().setHSL(
        parseInt(h) / 360,
        parseInt(s) / 100,
        parseInt(l) / 100
      );
    }
    return new THREE.Color(color);
  }, [color]);

  useFrame((state, delta) => {
    animationTime.current += delta;
    
    if (!groupRef.current) return;

    // Base Y offset to keep feet on podium (leg extends 0.6 units down from -0.3 position = 0.6 total)
    const baseYOffset = 0.6;

    if (rank === 1) {
      // Winner: Backflip animation and victory poses
      if (!alternatePose) {
        const cycle = animationTime.current % 5;
        
        if (cycle < 1.5) {
          // Enhanced backflip with better rotation
          const t = cycle / 1.5;
          groupRef.current.rotation.x = t * Math.PI * 2;
          groupRef.current.position.y = position[1] + baseYOffset + Math.sin(t * Math.PI) * 3;
          
          // Arms and legs follow the flip
          if (leftArmRef.current) leftArmRef.current.rotation.z = t * Math.PI * 2;
          if (rightArmRef.current) rightArmRef.current.rotation.z = -t * Math.PI * 2;
        } else {
          // Victory pose with arms up
          groupRef.current.rotation.x = 0;
          groupRef.current.position.y = position[1] + baseYOffset + Math.abs(Math.sin(animationTime.current * 4)) * 0.5;
          
          if (leftArmRef.current) {
            leftArmRef.current.rotation.z = Math.sin(animationTime.current * 3) * 0.3 + 2.5;
            leftArmRef.current.rotation.x = 0;
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z = -Math.sin(animationTime.current * 3) * 0.3 - 2.5;
            rightArmRef.current.rotation.x = 0;
          }
        }
      } else {
        // Alternate: Victorious standing pose with fist pump
        groupRef.current.rotation.x = 0;
        groupRef.current.position.y = position[1] + baseYOffset;
        
        const pumpCycle = Math.sin(animationTime.current * 5);
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = 0.5;
          leftArmRef.current.rotation.x = -1.5 + pumpCycle * 0.5;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.5;
          rightArmRef.current.rotation.x = -1.5 - pumpCycle * 0.5;
        }
      }
      
      // Happy head bobbing
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(animationTime.current * 2) * 0.3;
        headRef.current.position.y = 0.8 + Math.sin(animationTime.current * 3) * 0.1;
      }
    } else if (rank === 2) {
      // Second place: Clapping animation
      groupRef.current.rotation.x = 0;
      groupRef.current.position.y = position[1];
      
      if (!alternatePose) {
        // Standing still, serious
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = 0.3;
          leftArmRef.current.rotation.x = 0;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.3;
          rightArmRef.current.rotation.x = 0;
        }
      } else {
        // Alternate: Clapping in front
        const clapSpeed = 3;
        const clapAngle = Math.sin(animationTime.current * clapSpeed * 2) * 0.8;
        
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = 1.5 + clapAngle;
          leftArmRef.current.rotation.x = -0.5;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -1.5 - clapAngle;
          rightArmRef.current.rotation.x = -0.5;
        }
      }
      
      // Serious, minimal head movement
      if (headRef.current) {
        headRef.current.rotation.x = 0;
        headRef.current.rotation.y = Math.sin(animationTime.current) * 0.05;
      }
    } else {
      // Third place: On knees, crying
      if (!alternatePose) {
        // Kneeling, head down, crying - keep feet on podium even when kneeling
        groupRef.current.position.y = position[1] + baseYOffset - 0.6;
        groupRef.current.rotation.x = 0.4;
        
        // Arms covering face while crying (hands to eyes)
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = 1.4;
          leftArmRef.current.rotation.x = -2.0;
          leftArmRef.current.position.y = 0.5;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -1.4;
          rightArmRef.current.rotation.x = -2.0;
          rightArmRef.current.position.y = 0.5;
        }
        
        // Legs folded under
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = -1.5;
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -1.5;
        }
        
        // Head hanging down, shaking from crying
        if (headRef.current) {
          headRef.current.rotation.x = 0.6 + Math.sin(animationTime.current * 5) * 0.1;
          headRef.current.rotation.z = Math.sin(animationTime.current * 3) * 0.15;
        }
      } else {
        // Alternate: Standing, covering eyes in shame
        groupRef.current.position.y = position[1];
        groupRef.current.rotation.x = 0;
        
        // Arms covering face
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = 1.2;
          leftArmRef.current.rotation.x = -1.8;
          leftArmRef.current.position.y = 0.4;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -1.2;
          rightArmRef.current.rotation.x = -1.8;
          rightArmRef.current.position.y = 0.4;
        }
        
        // Legs normal standing
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = 0;
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = 0;
        }
        
        // Head shaking in disbelief
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(animationTime.current * 4) * 0.2;
          headRef.current.rotation.x = 0.3;
        }
      }
    }

  });

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={threeColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 0.85, 0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 0.85, 0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Mouth - changes based on rank */}
      <mesh position={[0, 0.7, 0.28]} rotation={[0, 0, rank === 3 ? 0 : rank === 2 ? Math.PI / 2 : Math.PI]}>
        <torusGeometry args={[0.08, 0.02, 16, 32, rank === 1 ? Math.PI : rank === 2 ? 0.1 : Math.PI]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color={threeColor} />
      </mesh>

      {/* Rank Badge on neck - like a medal */}
      <Billboard position={[0, 0.5, 0.25]}>
        <group>
          {/* Medal circle background */}
          <mesh position={[0, 0, 0]}>
            <circleGeometry args={[0.18, 32]} />
            <meshStandardMaterial 
              color={rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32"}
              metalness={0.9}
              roughness={0.1}
              emissive={rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32"}
              emissiveIntensity={0.6}
            />
          </mesh>
          
          {/* Badge emoji - larger */}
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.28}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </Text>
        </group>
      </Billboard>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.35, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color={threeColor} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.35, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color={threeColor} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.15, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshStandardMaterial color={threeColor} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.15, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshStandardMaterial color={threeColor} />
      </mesh>

      {/* Speech Bubble - always faces camera */}
      <Billboard position={[0, 2.2 + Math.sin(animationTime.current * 2) * 0.2, 0]}>
        <group>
          {/* Bubble background */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2, 0.8, 0.1]} />
            <meshStandardMaterial color="#ffffff" opacity={0.95} transparent />
          </mesh>
          
          {/* Bubble pointer */}
          <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.2, 0.2, 0.1]} />
            <meshStandardMaterial color="#ffffff" opacity={0.95} transparent />
          </mesh>
          
          {/* Message text */}
          <Text
            position={[0, 0.15, 0.06]}
            fontSize={0.15}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {message}
          </Text>
          
          {/* Team name */}
          <Text
            position={[0, -0.15, 0.06]}
            fontSize={0.12}
            color="#666666"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            - {teamName}
          </Text>
        </group>
      </Billboard>

      {/* Confetti particles for winner */}
      {rank === 1 && (
        <group>
          {[...Array(20)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin(animationTime.current * 2 + i) * 2,
                2 + Math.cos(animationTime.current * 3 + i) * 2,
                Math.cos(animationTime.current * 2 + i) * 2,
              ]}
            >
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshStandardMaterial color={i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF69B4" : "#00FFFF"} />
            </mesh>
          ))}
        </group>
      )}

      {/* Tears for third place - animated dripping */}
      {rank === 3 && (
        <group>
          {/* Left tear */}
          <mesh position={[-0.1, 0.75 - (animationTime.current % 2) * 0.3, 0.28]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#4FC3F7" transparent opacity={0.8} />
          </mesh>
          {/* Right tear */}
          <mesh position={[0.1, 0.75 - ((animationTime.current + 1) % 2) * 0.3, 0.28]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#4FC3F7" transparent opacity={0.8} />
          </mesh>
          {/* Additional tear drops */}
          <mesh position={[-0.1, 0.65, 0.28]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#4FC3F7" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.1, 0.65, 0.28]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#4FC3F7" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};
