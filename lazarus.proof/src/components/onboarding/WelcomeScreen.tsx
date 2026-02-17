"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface WelcomeScreenProps {
    onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-8"
            >
                <div className="w-24 h-24 rounded-full bg-lazarus-cyan/5 flex items-center justify-center border border-lazarus-cyan/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                    <ShieldCheck className="w-12 h-12 text-lazarus-cyan" />
                </div>
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4 text-white"
            >
                Your AI cannot act <br />
                <span className="text-lazarus-cyan">without you.</span>
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg text-gray-400 mb-12 font-light"
            >
                Lazarus.Proof binds autonomous agents to human intent.
            </motion.p>

            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                onClick={onStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-8 py-4 bg-lazarus-cyan/10 hover:bg-lazarus-cyan/20 border border-lazarus-cyan/50 text-lazarus-cyan rounded-lg overflow-hidden transition-all"
            >
                <span className="relative z-10 font-mono font-bold tracking-widest text-sm">
                    INITIALIZE SOVEREIGN CONTROL
                </span>
                <div className="absolute inset-0 bg-lazarus-cyan/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.button>
        </motion.div>
    );
};
