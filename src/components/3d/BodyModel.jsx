import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const MUSCLE_COLORS = {
  chest: '#ef4444',
  back: '#3b82f6',
  shoulders: '#f59e0b',
  biceps: '#10b981',
  triceps: '#8b5cf6',
  legs: '#ec4899',
  core: '#f97316',
  glutes: '#06b6d4',
}

function HumanFigure({ activeGroups = [] }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4
    }
  })

  const color = (group) =>
    activeGroups.includes(group) ? MUSCLE_COLORS[group] || '#6b7280' : '#374151'

  const emissiveInt = (group) => activeGroups.includes(group) ? 0.35 : 0

  const mat = (group) => ({
    color: color(group),
    emissive: color(group),
    emissiveIntensity: emissiveInt(group),
  })

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Head */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.25, 12]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Chest */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[0.65, 0.7, 0.3]} />
        <meshStandardMaterial {...mat('chest')} />
      </mesh>

      {/* Core / Abs */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.55, 0.5, 0.28]} />
        <meshStandardMaterial {...mat('core')} />
      </mesh>

      {/* Left Shoulder */}
      <mesh position={[-0.45, 1.6, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial {...mat('shoulders')} />
      </mesh>

      {/* Right Shoulder */}
      <mesh position={[0.45, 1.6, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial {...mat('shoulders')} />
      </mesh>

      {/* Left Upper Arm (biceps) */}
      <mesh position={[-0.58, 1.2, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial {...mat('biceps')} />
      </mesh>

      {/* Right Upper Arm (biceps) */}
      <mesh position={[0.58, 1.2, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial {...mat('biceps')} />
      </mesh>

      {/* Left Forearm (triceps) */}
      <mesh position={[-0.62, 0.72, 0]}>
        <capsuleGeometry args={[0.08, 0.3, 8, 12]} />
        <meshStandardMaterial {...mat('triceps')} />
      </mesh>

      {/* Right Forearm (triceps) */}
      <mesh position={[0.62, 0.72, 0]}>
        <capsuleGeometry args={[0.08, 0.3, 8, 12]} />
        <meshStandardMaterial {...mat('triceps')} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, 1.35, -0.16]}>
        <boxGeometry args={[0.63, 0.68, 0.02]} />
        <meshStandardMaterial {...mat('back')} />
      </mesh>

      {/* Glutes */}
      <mesh position={[0, 0.3, -0.12]}>
        <boxGeometry args={[0.5, 0.3, 0.15]} />
        <meshStandardMaterial {...mat('glutes')} />
      </mesh>

      {/* Left Thigh */}
      <mesh position={[-0.18, -0.1, 0]}>
        <capsuleGeometry args={[0.13, 0.55, 8, 12]} />
        <meshStandardMaterial {...mat('legs')} />
      </mesh>

      {/* Right Thigh */}
      <mesh position={[0.18, -0.1, 0]}>
        <capsuleGeometry args={[0.13, 0.55, 8, 12]} />
        <meshStandardMaterial {...mat('legs')} />
      </mesh>

      {/* Left Calf */}
      <mesh position={[-0.18, -0.78, 0]}>
        <capsuleGeometry args={[0.09, 0.45, 8, 12]} />
        <meshStandardMaterial {...mat('legs')} />
      </mesh>

      {/* Right Calf */}
      <mesh position={[0.18, -0.78, 0]}>
        <capsuleGeometry args={[0.09, 0.45, 8, 12]} />
        <meshStandardMaterial {...mat('legs')} />
      </mesh>
    </group>
  )
}

export default function BodyModel({ activeGroups = [], height = 280 }) {
  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} intensity={1.2} />
        <directionalLight position={[-2, -1, -2]} intensity={0.4} />
        <HumanFigure activeGroups={activeGroups} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(Math.PI * 3) / 4}
        />
      </Canvas>
    </div>
  )
}
