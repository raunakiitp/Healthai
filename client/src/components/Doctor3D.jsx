import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Environment, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// ─── Color palette ────────────────────────────────────────────────────────────
const SKIN  = "#f5c5a3";
const COAT  = "#ffffff";
const SCRUB = "#2563eb";
const STETH = "#a0a0b0";
const HAIR  = "#2d1b0e";
const LENS  = "#93c5fd";

// ─── Reusable mesh helpers ─────────────────────────────────────────────────────
function Part({ geo, color, position = [0,0,0], rotation = [0,0,0], scale = 1, roughness = 0.6, metalness = 0 }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <primitive object={geo} attach="geometry" />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

// ─── Doctor body parts ────────────────────────────────────────────────────────
function DoctorMesh() {
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const headRef = useRef();

  // Pre-build geometries
  const geos = useMemo(() => ({
    // Torso (lab coat body)
    torso:     new THREE.CapsuleGeometry(0.38, 0.7, 8, 16),
    // Shoulders pads
    shoulder:  new THREE.SphereGeometry(0.18, 12, 12),
    // Arms
    upperArm:  new THREE.CapsuleGeometry(0.1, 0.38, 6, 12),
    lowerArm:  new THREE.CapsuleGeometry(0.09, 0.34, 6, 12),
    hand:      new THREE.SphereGeometry(0.11, 12, 12),
    // Head
    head:      new THREE.SphereGeometry(0.3, 24, 24),
    // Hair cap
    hairCap:   new THREE.SphereGeometry(0.305, 24, 24),
    // Neck
    neck:      new THREE.CylinderGeometry(0.12, 0.14, 0.18, 12),
    // Face detail — eyes
    eye:       new THREE.SphereGeometry(0.038, 12, 12),
    pupil:     new THREE.SphereGeometry(0.022, 8, 8),
    // Eyebrows
    brow:      new THREE.BoxGeometry(0.09, 0.018, 0.02),
    // Nose
    nose:      new THREE.SphereGeometry(0.03, 8, 8),
    // Mouth smile
    mouth:     new THREE.TorusGeometry(0.065, 0.012, 8, 16, Math.PI),
    // Ears
    ear:       new THREE.SphereGeometry(0.055, 10, 10),
    // Legs
    leg:       new THREE.CapsuleGeometry(0.13, 0.65, 6, 12),
    foot:      new THREE.SphereGeometry(0.13, 10, 10),
    // Coat lapels
    lapel:     new THREE.BoxGeometry(0.13, 0.45, 0.08),
    // Stethoscope tube
    stetTube:  new THREE.TorusGeometry(0.18, 0.018, 8, 32),
    stetHead:  new THREE.SphereGeometry(0.06, 12, 12),
    stetEar:   new THREE.SphereGeometry(0.032, 8, 8),
    // Pocket
    pocket:    new THREE.BoxGeometry(0.1, 0.09, 0.04),
    pen:       new THREE.CylinderGeometry(0.012, 0.012, 0.11, 8),
    // Glasses
    glassFrame:new THREE.TorusGeometry(0.068, 0.012, 8, 24),
    glassBridge:new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8),
  }), []);

  // Animate — gentle float + arm swing
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.18;
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.04;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = 0.35 + Math.sin(t * 0.8) * 0.06;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -(0.35 + Math.sin(t * 0.8 + Math.PI) * 0.06);
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.12;
      headRef.current.rotation.x = Math.sin(t * 0.3) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>

      {/* ── LEGS ── */}
      <Part geo={geos.leg} color={SCRUB} position={[-0.15, -1.1, 0]} />
      <Part geo={geos.leg} color={SCRUB} position={[0.15, -1.1, 0]} />
      <Part geo={geos.foot} color="#1e293b" position={[-0.15, -1.5, 0.05]} scale={[1, 0.6, 1.3]} />
      <Part geo={geos.foot} color="#1e293b" position={[0.15, -1.5, 0.05]} scale={[1, 0.6, 1.3]} />

      {/* ── TORSO — lab coat ── */}
      <Part geo={geos.torso} color={COAT} position={[0, -0.3, 0]} roughness={0.3} />

      {/* Scrub undershirt visible at collar */}
      <mesh position={[0, 0.0, 0.3]}>
        <cylinderGeometry args={[0.2, 0.25, 0.35, 16]} />
        <meshStandardMaterial color={SCRUB} roughness={0.7} />
      </mesh>

      {/* Coat lapels */}
      <Part geo={geos.lapel} color={COAT} position={[-0.18, -0.1, 0.34]} rotation={[0, 0, 0.25]} roughness={0.3} />
      <Part geo={geos.lapel} color={COAT} position={[0.18, -0.1, 0.34]} rotation={[0, 0, -0.25]} roughness={0.3} />

      {/* Coat pocket + pen */}
      <Part geo={geos.pocket} color={COAT} position={[0.27, -0.18, 0.37]} roughness={0.3} />
      <Part geo={geos.pen} color="#e11d48" position={[0.27, -0.1, 0.38]} />
      <Part geo={geos.pen} color="#2563eb" position={[0.30, -0.1, 0.38]} />

      {/* ── STETHOSCOPE ── */}
      <group position={[0, -0.15, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <Part geo={geos.stetTube} color={STETH} roughness={0.4} metalness={0.5} />
      </group>
      {/* chest piece */}
      <Part geo={geos.stetHead} color="#6b7280" position={[0, -0.58, 0.38]} roughness={0.2} metalness={0.8} />
      {/* earpieces */}
      <Part geo={geos.stetEar} color={STETH} position={[-0.2, 0.05, 0.2]} roughness={0.3} metalness={0.4} />
      <Part geo={geos.stetEar} color={STETH} position={[0.2, 0.05, 0.2]} roughness={0.3} metalness={0.4} />

      {/* ── SHOULDERS ── */}
      <Part geo={geos.shoulder} color={COAT} position={[-0.44, -0.01, 0]} roughness={0.3} />
      <Part geo={geos.shoulder} color={COAT} position={[0.44, -0.01, 0]} roughness={0.3} />

      {/* ── LEFT ARM ── */}
      <group ref={leftArmRef} position={[-0.55, -0.15, 0]} rotation={[0, 0, 0.35]}>
        <Part geo={geos.upperArm} color={COAT} position={[0, -0.28, 0]} roughness={0.3} />
        <Part geo={geos.lowerArm} color={SKIN} position={[0, -0.64, 0]} roughness={0.6} />
        <Part geo={geos.hand} color={SKIN} position={[0, -0.88, 0]} roughness={0.5} />
      </group>

      {/* ── RIGHT ARM ── */}
      <group ref={rightArmRef} position={[0.55, -0.15, 0]} rotation={[0, 0, -0.35]}>
        <Part geo={geos.upperArm} color={COAT} position={[0, -0.28, 0]} roughness={0.3} />
        <Part geo={geos.lowerArm} color={SKIN} position={[0, -0.64, 0]} roughness={0.6} />
        {/* Clipboard in right hand */}
        <mesh position={[0, -0.95, 0.12]}>
          <boxGeometry args={[0.22, 0.28, 0.02]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.88, 0.14]}>
          <boxGeometry args={[0.16, 0.2, 0.01]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Lines on clipboard */}
        {[-0.06, -0.02, 0.02, 0.06].map((y, i) => (
          <mesh key={i} position={[0, -0.88 + y, 0.15]}>
            <boxGeometry args={[0.1, 0.005, 0.005]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))}
      </group>

      {/* ── NECK ── */}
      <Part geo={geos.neck} color={SKIN} position={[0, 0.27, 0]} />

      {/* ── HEAD ── */}
      <group ref={headRef} position={[0, 0.66, 0]}>
        {/* Head base */}
        <mesh castShadow>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial color={SKIN} roughness={0.65} />
        </mesh>

        {/* Hair cap (top half sphere) */}
        <mesh position={[0, 0.055, 0]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.308, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial color={HAIR} roughness={0.8} />
        </mesh>
        {/* Side hair */}
        <mesh position={[-0.28, -0.02, 0]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
          <meshStandardMaterial color={HAIR} roughness={0.8} />
        </mesh>
        <mesh position={[0.28, -0.02, 0]} rotation={[0, 0, -0.3]}>
          <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
          <meshStandardMaterial color={HAIR} roughness={0.8} />
        </mesh>

        {/* ── EARS ── */}
        <Part geo={geos.ear} color={SKIN} position={[-0.3, 0, 0]} scale={[0.7, 1, 0.5]} />
        <Part geo={geos.ear} color={SKIN} position={[0.3, 0, 0]} scale={[0.7, 1, 0.5]} />

        {/* ── GLASSES ── */}
        <group position={[0, 0.04, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
          <Part geo={geos.glassFrame} color="#374151" position={[-0.1, 0, 0]} metalness={0.8} roughness={0.2} />
          <Part geo={geos.glassFrame} color="#374151" position={[0.1, 0, 0]} metalness={0.8} roughness={0.2} />
          {/* Bridge */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.1, 8]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Lens tint */}
          <mesh position={[-0.1, 0, 0.01]}>
            <circleGeometry args={[0.058, 16]} />
            <meshStandardMaterial color={LENS} transparent opacity={0.3} />
          </mesh>
          <mesh position={[0.1, 0, 0.01]}>
            <circleGeometry args={[0.058, 16]} />
            <meshStandardMaterial color={LENS} transparent opacity={0.3} />
          </mesh>
        </group>
        {/* Temple arms */}
        <mesh position={[-0.28, 0.04, 0.15]} rotation={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.18, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.7} />
        </mesh>
        <mesh position={[0.28, 0.04, 0.15]} rotation={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.18, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.7} />
        </mesh>

        {/* ── EYES (whites) ── */}
        <Part geo={geos.eye} color="white" position={[-0.1, 0.05, 0.26]} roughness={0.1} />
        <Part geo={geos.eye} color="white" position={[0.1, 0.05, 0.26]} roughness={0.1} />
        {/* Pupils / iris */}
        <Part geo={geos.pupil} color="#1e3a5f" position={[-0.1, 0.05, 0.293]} />
        <Part geo={geos.pupil} color="#1e3a5f" position={[0.1, 0.05, 0.293]} />
        {/* Eye shine */}
        <mesh position={[-0.088, 0.062, 0.305]}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshStandardMaterial color="white" roughness={0} emissive="white" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.112, 0.062, 0.305]}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshStandardMaterial color="white" roughness={0} emissive="white" emissiveIntensity={2} />
        </mesh>

        {/* ── EYEBROWS ── */}
        <mesh position={[-0.1, 0.14, 0.27]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.09, 0.018, 0.02]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>
        <mesh position={[0.1, 0.14, 0.27]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.09, 0.018, 0.02]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>

        {/* ── NOSE ── */}
        <Part geo={geos.nose} color={SKIN} position={[0, -0.015, 0.3]} scale={[1, 1.2, 1]} roughness={0.6} />

        {/* ── MOUTH / SMILE ── */}
        <mesh position={[0, -0.1, 0.27]} rotation={[Math.PI, 0, 0]}>
          <torusGeometry args={[0.065, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#c8705a" roughness={0.5} />
        </mesh>

        {/* ── HEAD MIRROR (forehead reflector) ── */}
        <mesh position={[0, 0.15, 0.28]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.15, 0.285]}>
          <ringGeometry args={[0.055, 0.06, 20]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.1} />
        </mesh>
      </group>

      {/* ── HOLOGRAPHIC AURA RING ── */}
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.015, 8, 64]} />
        <meshStandardMaterial
          color="#3b96f2"
          emissive="#3b96f2"
          emissiveIntensity={1.2}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.008, 8, 64]} />
        <meshStandardMaterial
          color="#14b8a6"
          emissive="#14b8a6"
          emissiveIntensity={0.8}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

// ─── Floating medical particles ───────────────────────────────────────────────
function MedParticles() {
  return (
    <Sparkles
      count={50}
      scale={[4, 5, 4]}
      size={1.8}
      speed={0.5}
      color="#3b96f2"
      opacity={0.6}
    />
  );
}

// ─── Ground / platform glow ───────────────────────────────────────────────────
function Platform() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * 1.2) * 0.2;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, -1.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.1, 64]} />
      <meshStandardMaterial
        color="#0369a1"
        emissive="#3b96f2"
        emissiveIntensity={0.5}
        transparent
        opacity={0.5}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export default function Doctor3D({ className = "" }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 0.5, 3.8], fov: 42 }}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#ffffff"
        />
        <pointLight position={[-3, 2, 2]} intensity={0.8} color="#3b96f2" />
        <pointLight position={[3, -1, 2]} intensity={0.5} color="#14b8a6" />
        <pointLight position={[0, 4, 0]} intensity={0.4} color="#ffffff" />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Doctor floats gently */}
        <Float
          speed={1.8}
          rotationIntensity={0.25}
          floatIntensity={0.5}
          floatingRange={[-0.08, 0.08]}
        >
          <DoctorMesh />
        </Float>

        <MedParticles />
        <Platform />

        {/* Orbit controls — gentle auto-rotation, limited range */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
