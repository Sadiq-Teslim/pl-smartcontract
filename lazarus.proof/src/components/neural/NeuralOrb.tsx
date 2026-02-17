"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useNeuralStore } from '@/store/neural-store';
import * as THREE from 'three';

const OrbMesh = () => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const { currentFocus, isScanning, isAnchored } = useNeuralStore();

    // Color Targets (OKLCH converted to HEX for Three.js compatibility)
    // Cyan: #00F0FF, Crimson: #FF2E2E, Amber: #FFB800
    const colorTarget = useMemo(() => {
        if (isAnchored) return new THREE.Color("#00F0FF"); // Cyan (Success)
        if (isScanning) return new THREE.Color("#FFB800"); // Amber (Scanning)
        return new THREE.Color("#2a2a2a");                // Void (Idle)
    }, [isAnchored, isScanning]);

    useFrame((state) => {
        if (!meshRef.current) return;

        // 1. Organic Rotation
        const rotationSpeed = isScanning ? 2.0 : (isAnchored ? 0.5 : 0.2); // [IMPACT] Fast spin on scan
        meshRef.current.rotation.x += state.clock.getDelta() * rotationSpeed;
        meshRef.current.rotation.y += state.clock.getDelta() * (rotationSpeed * 0.5);

        // 2. Pulse based on Focus (Beta Waves)
        // Lerp scale based on focus intensity (0.0 - 1.0)
        // [IMPACT] Larger pulses
        const targetScale = isAnchored ? 2.5 : (1.5 + (currentFocus * 1.2));
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // 3. Color Transition
        const material = meshRef.current.material as any;
        material.color.lerp(colorTarget, 0.08); // Faster color shift

        // 4. Distortion - impact on "Scanning" vs "Anchored"
        // Scanning = High chaos (0.8), Anchored = Crystallized/Solid (0.0)
        const targetDistort = isScanning ? 1.0 : (isAnchored ? 0.0 : 0.4);
        material.distort = THREE.MathUtils.lerp(material.distort, targetDistort, 0.05);

        // [IMPACT] Roughness/Metalness shift for "Glassy" look on success
        material.roughness = isAnchored ? 0.0 : 0.2;
        material.metalness = isAnchored ? 1.0 : 0.8;
    });

    return (
        <Sphere ref={meshRef} args={[1, 128, 128]}> {/* Increased resolution for smoother distortion */}
            <MeshDistortMaterial
                color="#2a2a2a"
                attach="material"
                distort={0.4}
                speed={isScanning ? 5 : 2} // [IMPACT] Super fast jitter on scan
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
};

export const NeuralOrb = () => {
    // Only render Canvas if we are client-side (Next.js safety handled by parent usually, but safe here)
    return (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-60 mix-blend-screen">
            <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00F0FF" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF2E2E" />
                <OrbMesh />
            </Canvas>
        </div>
    );
};
