"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface MicroTerminalProps {
    active: boolean;
}

export const MicroTerminal = ({ active }: MicroTerminalProps) => {
    const [lines, setLines] = useState<string[]>([]);

    // Log sequence matching "The Engineering Blueprint"
    const logs = [
        "Initializing_Bio_Ingest [WebHID]...",
        "Stage_1: DSP_Bandpass_Filter [1-50Hz]...",
        "Stage_1: FFT_Feature_Extraction [Alpha/Beta]...",
        `> SAMPLE_PEAK: ${(Math.random() * (28 - 14) + 14).toFixed(2)}Hz [Focus_Band]`,
        "> DEVICE_ID: BCI-HEADSET-X9 [Secure]",
        "Stage_1: SHA-256(Peak + Time + DeviceID)...",
        `> NEURAL_HASH: ${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}... [Privacy_Preserved]`,
        "Stage_2: Connecting_to_Lighthouse_Node...",
        `> BINDING_TX_ID: TX-${Math.floor(Math.random() * 1000000).toString(16).toUpperCase()} [Immutable]`,
        "Stage_2: Pinning_Evidence_to_Filecoin...",
        "Stage_2: CID_Received [bafy...]",
        "Stage_3: Querying_Smart_Contract [Flow]...",
        "Stage_3: Verified_Circuit_Breaker [Pass]",
        "Circuit_Closed: Transaction_Authorized."
    ];

    useEffect(() => {
        if (active) {
            setLines([]);
            let index = 0;
            const interval = setInterval(() => {
                if (index < logs.length) {
                    setLines(prev => [...prev, logs[index]]);
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 180); // Speed of logs

            return () => clearInterval(interval);
        } else {
            setLines([]);
        }
    }, [active]);

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 w-96 text-center pointer-events-none"
                >
                    <div className="flex flex-col items-center gap-1">
                        {lines.slice(-3).map((line, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1 - (lines.length - 1 - i) * 0.3, scale: 1 }}
                                className="text-[10px] font-mono text-lazarus-cyan/80 tracking-widest uppercase"
                            >
                                {line}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
