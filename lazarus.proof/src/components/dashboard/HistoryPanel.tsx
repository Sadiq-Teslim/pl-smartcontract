"use client";

import { motion } from "framer-motion";
import { History, ExternalLink, CheckCircle, ArrowUpRight } from "lucide-react";
import { useNeuralStore } from "@/store/neural-store";

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HistoryPanel = ({ isOpen, onClose }: HistoryPanelProps) => {
    const { cid, isAnchored } = useNeuralStore();

    if (!isOpen) return null;

    // Mock history data - in a real app this would come from the store/backend
    const transactions = [
        {
            id: "tx_001",
            type: "SWAP",
            details: "1,000 SOL → USDC",
            amount: "$142,500",
            time: "Just now",
            proof: cid, // Use real CID if available from current session
            status: "CONFIRMED"
        },
        {
            id: "tx_000",
            type: "BRIDGE",
            details: "10 ETH → ARB",
            amount: "$28,500",
            time: "2 hours ago",
            proof: "bafy...7x9z",
            status: "CONFIRMED"
        }
    ];

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-96 glass-panel border-l border-white/10 shadow-2xl z-40 p-6 pt-24"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-lazarus-cyan" />
                    <h2 className="text-lg font-bold text-white font-mono">NEURAL ARCHIVE</h2>
                </div>
                <button onClick={onClose} className="text-xs text-gray-400 hover:text-white font-mono">
                    CLOSE
                </button>
            </div>

            <div className="space-y-4">
                {transactions.map((tx, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-lazarus-cyan/30 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 font-mono">{tx.type}</span>
                            <span className="text-xs text-gray-500 font-mono">{tx.time}</span>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                            <span className="text-white font-bold text-sm">{tx.details}</span>
                            <span className="text-lazarus-cyan font-mono text-xs">{tx.amount}</span>
                        </div>

                        {tx.proof && (
                            <a
                                href={`https://filfox.info/en/message/${tx.proof}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between bg-black/20 p-2 rounded text-[10px] font-mono text-gray-400 group-hover:bg-black/40 transition-colors"
                            >
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-3 h-3 text-lazarus-cyan" />
                                    <span>NEURAL PROOF ANCHORED</span>
                                </div>
                                <ArrowUpRight className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                ))}
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-center">
                <p className="text-[10px] text-gray-600 font-mono border-t border-white/5 pt-4">
                    All actions cryptographically signed by <br />
                    <span className="text-gray-500">DID:key:z6MkhaX...</span>
                </p>
            </div>
        </motion.div>
    );
};
