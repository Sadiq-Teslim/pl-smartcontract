"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { CoreState } from "@/lib/types";

interface NeuralCoreProps {
    state: CoreState;
}

export const NeuralCore = ({ state }: NeuralCoreProps) => {
    // Derived state for pulse speed
    const getPulseSpeed = () => {
        switch (state) {
            case "LOCKED": return 4; // Dormant
            case "PROPOSAL_RECEIVED": return 0.5; // Alert
            case "HOLDING": return 0.2; // Intense focus
            case "EXECUTED": return 0.1; // Flash
            case "RECEIPT": return 4; // Calm
            case "SYNCING": return 3; // Deep Breath (Slow)
            default: return 2;
        }
    };

    const pulseSpeed = getPulseSpeed();

    const getGlowColor = () => {
        switch (state) {
            case "LOCKED": return "rgba(0, 122, 255, 0.4)"; // Blue/Ready
            case "PROPOSAL_RECEIVED": return "rgba(255, 184, 0, 0.6)"; // Amber
            case "HOLDING": return "rgba(0, 240, 255, 0.8)"; // Cyan
            case "EXECUTED": return "rgba(255, 255, 255, 1)"; // White
            case "RECEIPT": return "rgba(0, 240, 255, 0.1)"; // Calm Cyan
            case "SYNCING": return "rgba(255, 255, 255, 0.3)"; // Soft White
            default: return "rgba(0, 0, 0, 0)";
        }
    };

    return (
        <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Outer Halo */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: pulseSpeed, repeat: Infinity, ease: "easeInOut" }}
                className={clsx(
                    "absolute w-full h-full rounded-full blur-3xl transition-colors duration-1000",
                    state === "LOCKED" && "bg-blue-500/20",
                    state === "PROPOSAL_RECEIVED" && "bg-lazarus-amber/30",
                    state === "HOLDING" && "bg-lazarus-cyan/40",
                    state === "EXECUTED" && "bg-white/60",
                    state === "RECEIPT" && "bg-lazarus-cyan/5",
                    state === "SYNCING" && "bg-white/10"
                )}
            />

            {/* Inner Core */}
            <motion.div
                animate={{
                    scale: state === "PROPOSAL_RECEIVED" ? [1, 1.05, 0.95, 1] :
                        state === "SYNCING" ? [1, 1.05, 1] : [1, 1.02, 1],
                    rotate: state === "PROPOSAL_RECEIVED" ? [0, 2, -2, 0] : 0
                }}
                transition={{ duration: pulseSpeed * 0.5, repeat: Infinity }}
                className={clsx(
                    "relative w-64 h-64 rounded-full glass-card flex items-center justify-center border-2 z-10 transition-all duration-700",
                    "after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-tr after:from-white/5 after:to-transparent",
                    state === "LOCKED" && "border-blue-500/50",
                    state === "PROPOSAL_RECEIVED" && "border-lazarus-amber/60 animate-pulse",
                    state === "HOLDING" && "border-lazarus-cyan/80",
                    state === "EXECUTED" && "border-white bg-white/20",
                    state === "RECEIPT" && "border-lazarus-cyan/20",
                    state === "SYNCING" && "border-white/30 bg-white/5"
                )}
                style={{
                    boxShadow: `0 0 60px ${getGlowColor()}`,
                }}
            >
                {/* Core Text / Icon */}
                <span className="font-mono text-xs tracking-[0.2em] text-white/50 transition-all duration-500">
                    {state === "LOCKED" && "SYSTEM READY"}
                    {state === "PROPOSAL_RECEIVED" && "HIGH-VALUE TRADE DETECTED"}
                    {state === "HOLDING" && "VERIFYING PULSE..."}
                    {state === "EXECUTED" && "INTENT ANCHORED"}
                    {state === "RECEIPT" && "RECEIPT GENERATED"}
                    {state === "SYNCING" && "CALIBRATING SYNC..."}
                </span>
            </motion.div>

            {/* Orbital Rings - Hide during clean states */}
            {state !== "EXECUTED" && (
                <>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className={clsx(
                            "absolute w-[80%] h-[80%] rounded-full border border-dashed transition-colors duration-1000",
                            state === "LOCKED" ? "border-blue-500/20" : "border-white/5"
                        )}
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[90%] h-[90%] rounded-full border border-dotted opacity-50 border-white/5"
                    />
                </>
            )}
        </div>
    );
};
