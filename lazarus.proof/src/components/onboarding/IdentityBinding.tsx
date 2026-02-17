"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Lock, Shield, Cpu } from "lucide-react";
import { useEffect, useState } from "react";

interface IdentityBindingProps {
    onComplete: () => void;
}

export const IdentityBinding = ({ onComplete }: IdentityBindingProps) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setStep(1), 1500); // Creating DID
        const timer2 = setTimeout(() => setStep(2), 3500); // Local Env
        const timer3 = setTimeout(() => setStep(3), 5000); // Complete
        const timer4 = setTimeout(() => onComplete(), 6000); // Proceed

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto"
        >
            <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-dashed border-white/10 rounded-full"
                />

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4 text-lazarus-cyan"
                        >
                            <Fingerprint className="w-16 h-16 animate-pulse" />
                            <span className="font-mono text-xs tracking-widest">BINDING IDENTITY</span>
                        </motion.div>
                    )}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4 text-lazarus-amber"
                        >
                            <Shield className="w-16 h-16 animate-pulse" />
                            <span className="font-mono text-xs tracking-widest">CREATING DID: HUMAN_01</span>
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4 text-white"
                        >
                            <Lock className="w-16 h-16 animate-pulse" />
                            <span className="font-mono text-xs tracking-widest">SECURING LOCAL RUNTIME</span>
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            exit={{ scale: 1, opacity: 0 }}
                            className="flex flex-col items-center gap-4 text-lazarus-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                        >
                            <Cpu className="w-16 h-16" />
                            <span className="font-mono text-xs tracking-widest font-bold">SOVEREIGNTY ESTABLISHED</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="glass-panel p-4 w-full rounded-lg border-l-2 border-l-lazarus-cyan/50 font-mono text-[10px] space-y-2 text-gray-400">
                <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span className="text-white">{step < 3 ? "INITIALIZING..." : "READY"}</span>
                </div>
                <div className="flex justify-between">
                    <span>DID:</span>
                    <span className="text-white font-mono">{step > 0 ? "did:lazarus:human:8f2a..." : "..."}</span>
                </div>
                <div className="flex justify-between">
                    <span>SESSION:</span>
                    <span className="text-green-400">{step > 1 ? "ENCRYPTED (AES-256)" : "PENDING"}</span>
                </div>
            </div>
        </motion.div>
    );
};
