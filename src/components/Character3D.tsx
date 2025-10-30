import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface Character3DProps {
  position: [number, number, number];
  color: string;
  rank: number;
  teamName: string;
  message: string;
}

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

    if (rank === 1) {
      // Winner: Backflip animation and victory poses
      const cycle = animationTime.current % 4;
      
      if (cycle < 2) {
        // Backflip
        groupRef.current.rotation.x = (cycle / 2) * Math.PI * 2;
        groupRef.current.position.y = position[1] + Math.sin((cycle / 2) * Math.PI) * 2;
      } else {
        // Victory pose
        groupRef.current.rotation.x = 0;
        groupRef.current.position.y = position[1];
        
        // Arms up in victory
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = Math.sin(animationTime.current * 3) * 0.5 + 2.5;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.sin(animationTime.current * 3) * 0.5 - 2.5;
        }
        
        // Jumping
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(animationTime.current * 4)) * 0.5;
      }
      
      // Head bobbing
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(animationTime.current * 2) * 0.3;
        headRef.current.position.y = 0.8 + Math.sin(animationTime.current * 3) * 0.1;
      }
    } else if (rank === 2) {
      // Second place: Clapping animation
      groupRef.current.rotation.x = 0;
      groupRef.current.position.y = position[1];
      
      const clapSpeed = 2;
      const clapAngle = Math.sin(animationTime.current * clapSpeed * 2) * 0.8;
      
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 1.5 + clapAngle;
        leftArmRef.current.rotation.x = -0.5;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -1.5 - clapAngle;
        rightArmRef.current.rotation.x = -0.5;
      }
      
      // Slight head nod
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(animationTime.current * 2) * 0.1;
      }
    } else {
      // Third place: On knees, crying
      groupRef.current.rotation.x = 0;
      
      // Kneeling position
      groupRef.current.position.y = position[1] - 0.5;
      groupRef.current.rotation.x = 0.3;
      
      // Arms down in defeat
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 0.5;
        leftArmRef.current.position.y = -0.3;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -0.5;
        rightArmRef.current.position.y = -0.3;
      }
      
      // Head hanging down, shaking
      if (headRef.current) {
        headRef.current.rotation.x = 0.5 + Math.sin(animationTime.current * 5) * 0.1;
        headRef.current.rotation.z = Math.sin(animationTime.current * 3) * 0.1;
      }
      
      // Legs folded
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -1.2;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -1.2;
      }
    }

    // Message bubble floating
    if (messageRef.current) {
      messageRef.current.position.y = 2 + Math.sin(animationTime.current * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
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
      <mesh position={[0, 0.7, 0.28]} rotation={[0, 0, rank === 1 ? 0 : rank === 3 ? Math.PI : 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color={threeColor} />
      </mesh>

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

      {/* Speech Bubble */}
      <group ref={messageRef} position={[0, 2, 0]}>
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

      {/* Tears for third place */}
      {rank === 3 && (
        <group>
          <mesh position={[-0.1, 0.75, 0.28]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#4FC3F7" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.1, 0.75, 0.28]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#4FC3F7" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
};
