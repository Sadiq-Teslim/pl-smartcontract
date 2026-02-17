"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Activity, DollarSign, X } from "lucide-react";
import { useNeuralStore } from "@/store/neural-store";

interface SecurityVaultProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SecurityVault = ({ isOpen, onClose }: SecurityVaultProps) => {
    const {
        thresholdAmount,
        setThreshold,
        paranoidMode,
        setParanoidMode
    } = useNeuralStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-lazarus-cyan/10 p-3 rounded-full border border-lazarus-cyan/20">
                            <Shield className="w-6 h-6 text-lazarus-cyan" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white font-mono tracking-wide">SECURITY VAULT</h2>
                            <p className="text-xs text-gray-400 font-mono">DEFINE YOUR BIO-LIMITS</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-8">

                    {/* Threshold Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-sm text-gray-400 font-mono flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                FINANCIAL THRESHOLD
                            </label>
                            <span className="text-2xl font-bold text-lazarus-cyan font-mono">${thresholdAmount.toLocaleString()}</span>
                        </div>

                        <div className="relative h-4 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={thresholdAmount}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            {/* Liquid Track */}
                            <div
                                className="absolute top-0 left-0 h-full bg-lazarus-cyan/50 blur-[2px] rounded-full transition-all duration-75"
                                style={{ width: `${(thresholdAmount / 10000) * 100}%` }}
                            />
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent to-lazarus-cyan rounded-full transition-all duration-75"
                                style={{ width: `${(thresholdAmount / 10000) * 100}%` }}
                            />

                            {/* Liquid Thumb */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(0,240,255,0.8)] z-10 pointer-events-none transition-all duration-75 border-2 border-lazarus-cyan"
                                style={{ left: `calc(${(thresholdAmount / 10000) * 100}% - 12px)` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono pt-2">
                            Any transaction above <span className="text-white">${thresholdAmount.toLocaleString()}</span> requires Active Bio-Pulse Authorization.
                        </p>
                    </div>

                    {/* Paranoid Mode */}
                    <div className="flex items-center justify-between p-4 bg-lazarus-crimson/5 border border-lazarus-crimson/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Activity className={`w-5 h-5 ${paranoidMode ? "text-lazarus-crimson animate-pulse" : "text-gray-500"}`} />
                            <div>
                                <h3 className={`text-sm font-bold font-mono ${paranoidMode ? "text-lazarus-crimson" : "text-gray-400"}`}>PARANOID MODE</h3>
                                <p className="text-[10px] text-gray-500">Require pulse for EVERY new wallet interaction.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setParanoidMode(!paranoidMode)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${paranoidMode ? "bg-lazarus-crimson" : "bg-gray-700"}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${paranoidMode ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-mono text-xs transition-colors"
                    >
                        SAVE CONFIGURATION
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
