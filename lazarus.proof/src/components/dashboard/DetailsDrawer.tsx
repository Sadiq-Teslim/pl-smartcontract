"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Shield, ArrowRight } from "lucide-react";

interface DetailsDrawerProps {
    onReject: () => void;
}

export const DetailsDrawer = ({ onReject }: DetailsDrawerProps) => {
    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="absolute top-8 right-8 w-96 pointer-events-auto z-40"
        >
            <div className="glass-panel p-0 rounded-xl border border-lazarus-amber/30 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-lazarus-amber/10 p-4 border-b border-lazarus-amber/20 flex items-start gap-4">
                    <div className="bg-lazarus-amber/20 p-2 rounded-lg shrink-0">
                        <AlertTriangle className="w-6 h-6 text-lazarus-amber animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white font-mono tracking-tight leading-none mb-1">
                            IRREVERSIBLE ACTION
                        </h2>
                        <p className="text-xs text-lazarus-amber/80 font-mono leading-tight">
                            Human presence required to execute high-value transaction.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Action Details */}
                    <div className="space-y-4">
                        <div className="bg-lazarus-amber/10 border border-lazarus-amber/20 p-3 rounded-lg">
                            <h3 className="text-lazarus-amber font-bold font-mono text-sm mb-1">THRESHOLD EXCEEDED ($500)</h3>
                            <p className="text-xs text-gray-400 font-mono">
                                Action: Asset Rebalance. Focus required for authorization.
                            </p>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Operation</span>
                            <span className="text-sm text-white font-bold font-mono">TOKEN SWAP</span>
                        </div>

                        <div className="flex items-center justify-between gap-4 font-mono">
                            <div className="text-right">
                                <div className="text-2xl text-white font-bold">50,000 SOL</div>
                                <div className="text-[10px] text-gray-500">$7,117,500.00</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-600" />
                            <div className="text-left">
                                <div className="text-2xl text-lazarus-cyan font-bold">USDC</div>
                                <div className="text-[10px] text-gray-500">Est. 7,112,000.00</div>
                            </div>
                        </div>

                        <div className="bg-black/30 p-3 rounded border border-white/5 text-xs text-gray-400 font-mono break-all">
                            Target: Jupiter Aggregator v6
                            <br />
                            Via: One-Time Vault Proxy
                        </div>
                    </div>

                    {/* Logic Check */}
                    <div className="flex gap-3 items-center bg-green-500/5 p-3 rounded border border-green-500/10">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] text-green-400 font-mono">
                            Simulation Successful • No Slippage Warning
                        </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2">
                        <button
                            onClick={onReject}
                            className="w-full py-3 border border-white/10 hover:bg-white/5 text-gray-400 rounded-lg font-mono text-xs font-bold tracking-widest transition-colors mb-2"
                        >
                            REJECT PROPOSAL
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
