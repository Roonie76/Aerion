import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function CameraController() {
  const { camera } = useThree();
  
  useEffect(() => {
    gsap.to(camera.position, {
      z: 3.5,
      scrollTrigger: {
        trigger: '.hero-3d-container',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }, [camera]);

  return null;
}

function Shuttlecock() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.4;
    meshRef.current.position.y = Math.sin(t) * 0.1;
  });

  return (
    <group ref={meshRef}>
      {/* Shuttlecock Base (Sphere) */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
      </mesh>
      
      {/* Shuttlecock Skirt (Cone) */}
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 1.2, 32, 1, true]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.8} 
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function Hero3D() {
  return (
    <section className="hero-3d-container" style={{ height: '70vh', width: '100%', position: 'relative' }}>
      <Canvas shadows dpr={[1, 2]}>
        <CameraController />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
            <Shuttlecock />
          </Float>
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <div className="hero-3d-overlay">
        <h1 className="hero-title animate-in">Precision <br /> <span>Elevated</span></h1>
        <p className="hero-subtitle animate-in">High-performance gear for the modern athlete.</p>
      </div>
    </section>
  );
}
