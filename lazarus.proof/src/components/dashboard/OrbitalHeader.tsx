"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Wallet } from "lucide-react";
import { Waveform } from "../neural/Waveform";
import { motion } from "framer-motion";
import { CoreState } from "@/lib/types";
import { authenticate, unauthenticate, subscribeToUser } from "@/lib/flow";

interface OrbitalHeaderProps {
    state: CoreState;
}

export const OrbitalHeader = ({ state }: OrbitalHeaderProps) => {
    const isActive = state !== "LOCKED";

    const [walletAddr, setWalletAddr] = useState<string | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToUser((user) => {
            setWalletAddr(user.addr);
            setLoggedIn(!!user.loggedIn);
        });
        return () => unsubscribe();
    }, []);

    const handleWalletClick = async () => {
        if (loggedIn) {
            unauthenticate();
        } else {
            await authenticate();
        }
    };

    const displayAddr = walletAddr
        ? `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`
        : "Connect Wallet";

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 glass-panel rounded-full px-6 py-3 flex items-center justify-between pointer-events-auto"
        >
            <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-lazarus-cyan" />
                <span className="font-mono font-bold tracking-widest text-sm text-white">
                    LAZARUS <span className="text-lazarus-cyan">{"//"}</span> PROOF
                </span>
            </div>

            <div className="flex items-center gap-4">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${isActive ? "text-lazarus-cyan animate-pulse" : "text-gray-400"}`}>
                    {state === "PROPOSAL_RECEIVED" ? "CIRCUIT BREAKER: AWAITING_BIO_PROOF" :
                        state === "HOLDING" ? "CIRCUIT BREAKER: VERIFYING..." :
                            state === "EXECUTED" || state === "RECEIPT" ? "CIRCUIT BREAKER: CLOSED" :
                                "NEURAL LINK: STANDBY"}
                </span>
                <Waveform />
            </div>

            <button
                onClick={handleWalletClick}
                className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
                <Wallet className={`w-4 h-4 ${loggedIn ? "text-green-400" : "text-lazarus-amber"}`} />
                <span className={`font-mono text-xs ${loggedIn ? "text-green-400" : "text-lazarus-amber"}`}>
                    {displayAddr}
                </span>
            </button>
        </motion.header>
    );
};
