"use client";

import { motion } from "framer-motion";
import { XOctagon } from "lucide-react";

export const KillSwitch = ({ onAbort }: { onAbort: () => void }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAbort}
            className="fixed bottom-8 right-8 z-50 bg-lazarus-crimson/10 border border-lazarus-crimson/50 text-lazarus-crimson px-6 py-4 rounded-lg flex items-center gap-3 hover:bg-lazarus-crimson/20 transition-colors group"
            style={{
                boxShadow: "0 0 20px rgba(255, 46, 46, 0.1)",
            }}
        >
            <div className="relative">
                <XOctagon className="w-8 h-8 group-hover:drop-shadow-[0_0_8px_rgba(255,46,46,0.8)] transition-all" />
            </div>
            <div className="flex flex-col items-start">
                <span className="font-mono font-bold text-sm tracking-widest">KILL SWITCH</span>
                <span className="text-[10px] text-lazarus-crimson/70 font-mono">EMERGENCY ABORT</span>
            </div>
        </motion.button>
    );
};
