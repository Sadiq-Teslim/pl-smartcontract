"use client";

import { motion } from "framer-motion";
import { Bot, ShieldAlert, BadgeCheck } from "lucide-react";
import { useState } from "react";

interface AgentConnectionProps {
    onComplete: () => void;
}

export const AgentConnection = ({ onComplete }: AgentConnectionProps) => {
    const [bound, setBound] = useState(false);

    const handleBind = () => {
        setBound(true);
        setTimeout(onComplete, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto p-4"
        >
            <h2 className="text-2xl text-white font-bold mb-8 text-center tracking-tight">Connected Agents</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agent Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`glass-card p-6 rounded-xl border transition-all duration-500 ${bound ? "border-lazarus-cyan shadow-[0_0_30px_rgba(0,240,255,0.1)]" : "border-white/10"}`}
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="bg-white/5 p-3 rounded-lg">
                            <Bot className={`w-8 h-8 ${bound ? "text-lazarus-cyan" : "text-gray-400"}`} />
                        </div>
                        {bound ? (
                            <div className="flex items-center gap-1 text-lazarus-cyan bg-lazarus-cyan/10 px-2 py-1 rounded text-xs font-mono">
                                <BadgeCheck className="w-3 h-3" />
                                <span>BOUND</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-lazarus-amber bg-lazarus-amber/10 px-2 py-1 rounded text-xs font-mono">
                                <ShieldAlert className="w-3 h-3" />
                                <span>UNBOUND</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">Agent #402 (Trader)</h3>
                    <p className="text-xs text-gray-400 font-mono mb-6">did:lazarus:agent:7x9p...</p>

                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Risk Scope</span>
                            <span className="text-white">High (DeFi)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Chain</span>
                            <span className="text-white">Solana</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Permissions</span>
                            <span className="text-white">Read-Only</span>
                        </div>
                    </div>

                    <button
                        onClick={handleBind}
                        disabled={bound}
                        className={`w-full py-3 rounded-lg font-mono font-bold text-sm tracking-widest transition-all ${bound
                            ? "bg-lazarus-cyan/10 text-lazarus-cyan cursor-default"
                            : "bg-white text-black hover:bg-gray-200"
                            }`}
                    >
                        {bound ? "AGENT SECURED" : "BIND AGENT"}
                    </button>
                </motion.div>

                {/* Placeholder for future agents */}
                <div className="border border-dashed border-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-gray-600">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Bot className="w-6 h-6 opacity-20" />
                    </div>
                    <span className="text-sm font-mono">NO OTHER AGENTS FOUND</span>
                </div>
            </div>
        </motion.div>
    );
};
