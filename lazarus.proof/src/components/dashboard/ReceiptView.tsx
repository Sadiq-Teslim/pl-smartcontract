"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FileCode, Share2, ShieldCheck } from "lucide-react";
import { useNeuralStore } from "@/store/neural-store";

interface ReceiptViewProps {
    onClose: () => void;
}

export const ReceiptView = ({ onClose }: ReceiptViewProps) => {
    const { cid, flowTxId, guardStatus, refreshGuardStatus } = useNeuralStore();

    // Poll guard status while receipt is visible
    useEffect(() => {
        refreshGuardStatus();
        const interval = setInterval(refreshGuardStatus, 10000);
        return () => clearInterval(interval);
    }, [refreshGuardStatus]);

    const livenessLabel = guardStatus
        ? guardStatus.is_valid
            ? `PASS (${Math.floor(guardStatus.seconds_until_expiry)}s remaining)`
            : "EXPIRED"
        : "CHECKING...";

    const circuitLabel = guardStatus
        ? guardStatus.is_valid
            ? "VERIFIED (Flow)"
            : "OPEN (Expired)"
        : "QUERYING...";

    const flowscanUrl = flowTxId
        ? `https://testnet.flowscan.io/transaction/${flowTxId}`
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="w-full max-w-sm glass-card p-6 rounded-xl border border-white/10 flex flex-col gap-6 shadow-2xl relative pointer-events-auto"
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="bg-lazarus-cyan/10 p-3 rounded-full mb-2">
                        <ShieldCheck className="w-8 h-8 text-lazarus-cyan" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight font-mono">INTENT ANCHORED</h2>
                    <p className="text-xs text-gray-400 font-mono">Immutable Receipt of Human Will</p>
                </div>

                <div className="bg-black/40 rounded-lg p-4 font-mono text-xs space-y-3 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 opacity-20">
                        <FileCode className="w-12 h-12" />
                    </div>

                    <div>
                        <span className="text-gray-500 block mb-1">INTENT ANCHOR (CID)</span>
                        <span className="text-lazarus-cyan break-all font-mono text-[10px]">{cid || "PENDING_PROOF_GENERATION..."}</span>
                    </div>

                    <div className="border-t border-white/5 pt-2">
                        <span className="text-gray-500 block mb-1">FLOW TRANSACTION</span>
                        {flowTxId ? (
                            <a
                                href={flowscanUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lazarus-cyan break-all font-mono text-[10px] bg-white/5 px-2 py-1 rounded inline-block hover:bg-white/10 transition-colors"
                            >
                                TX: {flowTxId.slice(0, 16)}...
                            </a>
                        ) : (
                            <span className="text-white/40 font-mono text-[10px] bg-white/5 px-2 py-1 rounded inline-block">
                                TX: awaiting backend...
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <div>
                            <span className="text-gray-500 block mb-1">LIVENESS CHECK</span>
                            <span className={`font-bold ${guardStatus?.is_valid ? "text-green-400" : "text-lazarus-amber"}`}>
                                {livenessLabel}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-gray-500 block mb-1">CIRCUIT BREAKER</span>
                            <span className={`font-bold ${guardStatus?.is_valid ? "text-lazarus-cyan" : "text-lazarus-crimson"}`}>
                                {circuitLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors font-mono text-sm tracking-wider"
                    >
                        CLOSE RECEIPT
                    </button>
                    <button className="px-4 border border-white/10 rounded-lg hover:bg-white/5 text-white transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
