"use client";

import { motion } from "framer-motion";
import { useNeuralStore } from "@/store/neural-store";
import { useEffect, useState } from "react";

export const Waveform = () => {
    const { lastSignal, isConnected } = useNeuralStore();
    // Local state to smooth out the visual updates if needed, 
    // but we can derive directly from store for raw speed.

    // Map the 4 brainwaves to bar heights
    const waves = [
        (lastSignal?.delta || 0) / 40, // Delta (Sleep) - usually high amplitude
        (lastSignal?.theta || 0) / 20, // Theta
        (lastSignal?.alpha || 0) / 15, // Alpha
        (lastSignal?.beta || 0) / 30,  // Beta (Focus)
    ];

    // Create a 12-bar visualizer by mirroring/interpolating the 4 waves
    // [Delta, Theta, Alpha, Beta, Alpha, Theta, Delta, Theta, Alpha, Beta, Alpha, Theta]
    const bars = [
        waves[0], waves[1], waves[2], waves[3],
        waves[2], waves[1], waves[0], waves[1],
        waves[2], waves[3], waves[2], waves[1]
    ];

    return (
        <div className="flex items-center justify-center gap-[2px] h-8 w-24 overflow-hidden">
            {bars.map((value, i) => (
                <motion.div
                    key={i}
                    className={`w-1 rounded-full ${isConnected ? "bg-lazarus-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]" : "bg-white/10"
                        }`}
                    animate={{
                        height: isConnected ? `${Math.min(Math.max(value * 100, 10), 100)}%` : "10%",
                        opacity: isConnected ? 1 : 0.3,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                    }}
                />
            ))}
        </div>
    );
};
