"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Cpu, Lock } from "lucide-react";

interface RiskPanelProps {
    onReject: () => void;
}

export const RiskPanel = ({ onReject }: RiskPanelProps) => {
    return (
        <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-1/2 -translate-y-1/2 left-8 w-80 glass-panel rounded-xl p-4 flex flex-col gap-4 border-l-4 border-l-lazarus-amber border-r border-r-lazarus-amber/20 border-y border-y-lazarus-amber/20 shadow-[0_0_30px_rgba(255,184,0,0.1)]"
        >
            <div className="flex items-center gap-2 border-b border-lazarus-amber/20 pb-2">
                <ShieldAlert className="w-5 h-5 text-lazarus-amber animate-pulse" />
                <span className="font-mono text-sm font-bold text-white tracking-widest">
                    RISK DETECTED
                </span>
            </div>

            <div className="bg-lazarus-amber/5 rounded-lg p-3 space-y-3 font-mono text-xs border border-lazarus-amber/10">
                <div className="flex justify-between items-center text-lazarus-amber">
                    <span className="opacity-70">AGENT:</span>
                    <span className="font-bold">#402 (Trader)</span>
                </div>
                <div className="flex justify-between items-center text-white">
                    <span className="opacity-70 text-gray-400">ACTION:</span>
                    <span className="font-bold">SWAP</span>
                </div>
                <div className="flex justify-between items-center text-white">
                    <span className="opacity-70 text-gray-400">ASSET:</span>
                    <span>1,000 SOL</span>
                </div>
                <div className="flex justify-between items-center text-lazarus-crimson">
                    <span className="opacity-70">RISK:</span>
                    <span className="font-bold">HIGH_VALUE</span>
                </div>
            </div>

            <div className="p-3 bg-black/40 rounded border border-white/5 font-mono text-[10px] text-gray-400">
                <div className="flex items-start gap-2">
                    <Lock className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>
                        Contract checks failed due to value threshold violation. Human authorization required.
                    </span>
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    onClick={onReject}
                    className="flex-1 bg-lazarus-crimson/10 hover:bg-lazarus-crimson/20 border border-lazarus-crimson/50 text-lazarus-crimson py-2 rounded text-xs font-mono font-bold transition-colors"
                >
                    REJECT
                </button>
                <div className="flex-1 bg-lazarus-amber/10 border border-lazarus-amber/50 text-lazarus-amber py-2 rounded text-xs font-mono font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                    <Cpu className="w-3 h-3" />
                    <span>AI LOCKED</span>
                </div>
            </div>
        </motion.div>
    );
};
