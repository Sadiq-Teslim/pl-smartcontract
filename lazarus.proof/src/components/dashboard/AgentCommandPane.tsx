"use client";

import { motion } from "framer-motion";
import { Cpu, Terminal } from "lucide-react";

export const AgentCommandPane = () => {
    return (
        <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute top-1/2 -translate-y-1/2 left-8 w-80 glass-panel rounded-xl p-4 flex flex-col gap-4 border-l-4 border-l-lazarus-cyan/50"
        >
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Cpu className="w-5 h-5 text-lazarus-cyan" />
                <span className="font-mono text-sm font-bold text-white tracking-widest">
                    AGENT COMMAND
                </span>
            </div>

            <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-green-400 space-y-2 min-h-[150px]">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    <span className="opacity-70">eliza-agent-v2 initialized...</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lazarus-cyan">{`>`}</span>
                    <span>Monitoring market conditions...</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lazarus-cyan">{`>`}</span>
                    <span>Yield opportunity detected (APY 12%)</span>
                </div>
                <div className="flex items-center gap-2 animate-pulse text-indigo-300">
                    <span className="text-lazarus-cyan">{`>`}</span>
                    <span>Formulating Proposal #402...</span>
                </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono border-t border-white/5 pt-2">
                <span>STATUS: ACTIVE</span>
                <span>LATENCY: 12ms</span>
            </div>
        </motion.div>
    );
};
