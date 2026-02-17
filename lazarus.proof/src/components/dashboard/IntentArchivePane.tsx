"use client";

import { motion } from "framer-motion";
import { Archive, CheckCircle, ExternalLink } from "lucide-react";
import { MOCK_ARCHIVE } from "@/lib/data";

export const IntentArchivePane = () => {
    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-1/2 -translate-y-1/2 right-8 w-80 glass-panel rounded-xl p-4 flex flex-col gap-4 border-r-4 border-r-lazarus-cyan/50"
        >
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Archive className="w-5 h-5 text-lazarus-cyan" />
                <span className="font-mono text-sm font-bold text-white tracking-widest">
                    INTENT ARCHIVE
                </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {MOCK_ARCHIVE.map((item) => (
                    <div key={item.id} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-white">{item.action}</span>
                            <span className="text-[10px] text-gray-500">{item.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-[10px] text-lazarus-cyan font-mono bg-lazarus-cyan/10 px-1.5 py-0.5 rounded">
                                <CheckCircle className="w-3 h-3" />
                                {item.status}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono cursor-pointer hover:text-white">
                                {item.cid}
                                <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center text-[10px] text-gray-600 font-mono pt-2">
                SECURED BY FILECOIN
            </div>
        </motion.div>
    );
};
