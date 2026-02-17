"use client";

import { Bot, FileText, Activity } from "lucide-react";

export const AgentActivityPanel = () => {
    const logs = [
        { time: "10:42:01", msg: "Analyzing pool depth...", type: "info" },
        { time: "10:42:05", msg: "Strategy: Arc-Arbitrage", type: "info" },
        { time: "10:42:12", msg: "Opportunity found: +1.2%", type: "success" },
        { time: "10:42:15", msg: "Preparing execution proposal...", type: "warning" },
    ];

    return (
        <div className="absolute top-8 left-8 w-80 pointer-events-auto z-40">
            <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="bg-white/5 p-2 rounded-lg">
                        <Bot className="w-5 h-5 text-lazarus-cyan" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white font-mono tracking-wide">AGENT #402</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-gray-400 font-mono">ACTIVE - MONITORING</span>
                        </div>
                    </div>
                </div>

                {/* Proposal Card (Mini) */}
                <div className="bg-white/5 rounded-lg p-3 border-l-2 border-l-lazarus-amber">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-lazarus-amber font-mono font-bold uppercase tracking-wider">
                            Proposal Pending
                        </span>
                        <FileText className="w-3 h-3 text-gray-500" />
                    </div>
                    <div className="text-xs text-white font-mono mb-1">
                        Swap 1,000 SOL &rarr; USDC
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                        Target: Jupiter Aggregator
                    </div>
                </div>

                {/* Logs */}
                <div className="space-y-2 font-mono text-[10px]">
                    <div className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        LIVE LOGS
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-2 opacity-70">
                            <span className="text-gray-600">{log.time}</span>
                            <span className={
                                log.type === "warning" ? "text-lazarus-amber" :
                                    log.type === "success" ? "text-green-400" : "text-gray-400"
                            }>
                                {log.msg}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
