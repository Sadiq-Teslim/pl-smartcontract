import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { postIntent, getGuardStatus, type GuardStatusResponse } from '@/lib/api';

// Types for our Neural State
interface EEGSignal {
    alpha: number;
    beta: number;
    delta: number;
    theta: number;
    timestamp: number;
}

interface NeuralState {
    // Connection Status
    isConnected: boolean;
    signalQuality: number; // 0-100

    // Real-time Data
    currentFocus: number; // 0.0 - 1.0 (Derived from Beta/Alpha ratio)
    lastSignal: EEGSignal | null;

    // Interaction States
    isScanning: boolean;
    isAnchored: boolean;
    did: string | null;
    cid: string | null;

    // Flow Blockchain State
    flowTxId: string | null;
    flowTxStatus: string | null;
    guardStatus: GuardStatusResponse | null;

    // Security Settings
    thresholdAmount: number;
    paranoidMode: boolean;

    // Actions
    connect: () => void;
    disconnect: () => void;
    updateSignal: (signal: EEGSignal) => void;
    setScanning: (status: boolean) => void;
    setAnchored: (cid: string) => void;
    generateProof: (transactionId: string) => Promise<void>;
    refreshGuardStatus: () => Promise<void>;
    reset: () => void;
    setThreshold: (amount: number) => void;
    setParanoidMode: (enabled: boolean) => void;
}

export const useNeuralStore = create<NeuralState>()(
    devtools(
        (set) => ({
            isConnected: false,
            signalQuality: 0,
            currentFocus: 0,
            lastSignal: null,
            isScanning: false,
            isAnchored: false,
            did: null,
            cid: null,

            // Flow state
            flowTxId: null,
            flowTxStatus: null,
            guardStatus: null,

            // Defaults
            thresholdAmount: 500,
            paranoidMode: false,

            connect: () => set({ isConnected: true, signalQuality: 100 }),

            disconnect: () => set({
                isConnected: false,
                signalQuality: 0,
                currentFocus: 0
            }),

            updateSignal: (signal) => set((state) => {
                const rawFocus = (signal.beta / (signal.alpha + 0.1));
                const normalizedFocus = Math.min(Math.max(rawFocus / 2, 0), 1);
                return {
                    lastSignal: signal,
                    currentFocus: normalizedFocus
                };
            }),

            setScanning: (status) => set({ isScanning: status }),

            setAnchored: (cid) => set({
                isAnchored: true,
                cid,
                isScanning: false
            }),

            generateProof: async (_transactionId: string) => {
                set({ isScanning: true });

                try {
                    // Call backend: simulate EEG → hash → pin to Lighthouse → push to Flow
                    const result = await postIntent(true);

                    console.log("[BACKEND] Intent response:", result);

                    set({
                        isAnchored: true,
                        cid: result.cid,
                        flowTxId: result.flow_tx_id,
                        flowTxStatus: result.flow_tx_status,
                        isScanning: false,
                    });

                    if (result.cid) {
                        console.log("[ANCHOR] Proof Pinned to Filecoin:", result.cid);
                    }
                    if (result.flow_tx_id) {
                        console.log("[FLOW] Transaction sealed:", result.flow_tx_id);
                    }
                } catch (error) {
                    console.error("[BACKEND] Intent failed, falling back to local:", error);

                    // Fallback: local EEG sim + Lighthouse upload (original behavior)
                    const timestamp = Date.now();
                    const peakFreq = (Math.random() * (30 - 13) + 13).toFixed(4);
                    const deviceID = "BCI-HEADSET-X9";
                    const payload = `${peakFreq}|${timestamp}|${deviceID}`;

                    const msgBuffer = new TextEncoder().encode(payload);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const neuralHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                    const { uploadNeuralHash } = await import('@/lib/lighthouse');
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const cid = await uploadNeuralHash({
                        hash: neuralHash,
                        timestamp,
                        transactionId: _transactionId,
                        intent: "RELEASE_FUNDS",
                        contract: "LazarusGuard.cdc"
                    });

                    if (cid) {
                        set({ isAnchored: true, cid, isScanning: false });
                    } else {
                        set({ isScanning: false });
                    }
                }
            },

            refreshGuardStatus: async () => {
                try {
                    const status = await getGuardStatus();
                    set({ guardStatus: status });
                } catch (error) {
                    console.error("[GUARD] Failed to fetch status:", error);
                }
            },

            reset: () => set({
                isScanning: false,
                isAnchored: false,
                cid: null,
                flowTxId: null,
                flowTxStatus: null,
                guardStatus: null,
                currentFocus: 0
            }),

            setThreshold: (amount: number) => set({ thresholdAmount: amount }),
            setParanoidMode: (enabled: boolean) => set({ paranoidMode: enabled })
        }),
        { name: 'NeuralStore' }
    )
);
