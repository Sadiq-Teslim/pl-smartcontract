"use client";

import { useState, useRef, useEffect } from "react";
import { NeuralCore } from "@/components/neural/NeuralCore";
import { OrbitalHeader } from "@/components/dashboard/OrbitalHeader";
import { AgentActivityPanel } from "@/components/dashboard/AgentActivityPanel";
import { DetailsDrawer } from "@/components/dashboard/DetailsDrawer";
import { ReceiptView } from "@/components/dashboard/ReceiptView";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Shield, History, Cpu, ArrowRight } from "lucide-react";
import { CoreState } from "@/lib/types";

// [NEW] Bio-Immersive Imports
import { NeuralOrb } from "@/components/neural/NeuralOrb";
import { neuralStream } from "@/services/neural-stream";
import { SecurityVault } from "@/components/dashboard/SecurityVault";
import { HistoryPanel } from "@/components/dashboard/HistoryPanel";
import { MicroTerminal } from "@/components/dashboard/MicroTerminal";

import { useNeuralStore } from "@/store/neural-store";

export default function Home() {
  // [NEW] Onboarding State
  // 0: Welcome Screen
  // 1: Identity Binding (DID Creation)
  // 2: Dashboard (Active)
  const [onboardingStep, setOnboardingStep] = useState(0);

  const [coreState, setCoreState] = useState<CoreState>("LOCKED");
  const [holdProgress, setHoldProgress] = useState(0);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  // [FIX] Use specific selector to avoid re-renders on EEG updates
  const generateProof = useNeuralStore((state) => state.generateProof);

  // [NEW] Logic State
  const [autoApproveToast, setAutoApproveToast] = useState<string | null>(null);

  // [NEW] Activate Neural Stream on Mount
  useEffect(() => {
    const subscription = neuralStream.connect();
    return () => subscription.unsubscribe();
  }, []);

  // [NEW] Auto-Sequence: Sync -> Ready -> Vault
  useEffect(() => {
    if (onboardingStep === 2) {
      // 1. Handshake Phase: 10s Sync to fill the bar
      setCoreState("SYNCING");

      const syncTimer = setTimeout(() => {
        // 2. Ready/Success State (Blue Orb + "Synced & Secure")
        setCoreState("LOCKED");

        // 3. Hold "Success" for 2s, then Open Vault
        setTimeout(() => setIsVaultOpen(true), 2000);
      }, 15000);

      return () => clearTimeout(syncTimer);
    }
  }, [onboardingStep]);


  // [NEW] Post-Onboarding Trigger: Auto-Simulate $50k Challenge
  // Triggers when Vault closes for the first time
  useEffect(() => {
    // Check if we just finished the setup limit phase
    if (onboardingStep === 2 && coreState === "LOCKED" && !isVaultOpen) {
      // Use a ref or simple check to ensure this only runs once? 
      // For now, let's assume this specific state combo implies "Just Closed Vault"
      // We can add a "hasOnboarded" state if needed, but let's try a simple timeout.

      const challengeTimer = setTimeout(() => {
        // Only trigger if we haven't already (simple check to avoid loops in this demo)
        // A more robust way is to increment onboardingStep to 3 (Active)
        if (onboardingStep === 2) {
          setOnboardingStep(3); // Move to "Active" state to prevent re-trigger
          handleTransaction(50000, "Asset Rebalance");
        }
      }, 1500);

      return () => clearTimeout(challengeTimer);
    }
  }, [isVaultOpen, onboardingStep, coreState]);

  const handleTransaction = (amount: number, label: string) => {
    // Logic Check: The "Dummy-Proof" Guard
    const { thresholdAmount, paranoidMode } = useNeuralStore.getState();

    if (amount > thresholdAmount || paranoidMode) {
      // TRIGGER HARD LOCK
      setCoreState("PROPOSAL_RECEIVED");
    } else {
      // AUTO APPROVE
      setAutoApproveToast(`Running Auto-Pilot: ${label} ($${amount}) approved via Signing Key.`);
      setTimeout(() => setAutoApproveToast(null), 3000);
    }
  };

  const handleSimulateProposal = () => handleTransaction(50000, "Asset Rebalance");
  const handleSimulateSmall = () => handleTransaction(5, "Starbucks Coffee");

  const handleReject = () => {
    setCoreState("LOCKED");
  };

  const handleHoldStart = () => {
    if (coreState !== "PROPOSAL_RECEIVED" && coreState !== "HOLDING") return;

    setCoreState("HOLDING");
    let progress = 0;

    // 20ms interval for smooth 2 second progress
    holdInterval.current = setInterval(() => {
      progress += 1; // 1% every 20ms = 100% in 2000ms
      setHoldProgress(progress);

      if (progress >= 100) {
        handleAuthorizationComplete();
      }
    }, 20);
  };

  const handleHoldEnd = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }

    if (holdProgress < 100 && coreState === "HOLDING") {
      setCoreState("PROPOSAL_RECEIVED");
      setHoldProgress(0);
    }
  };

  const handleAuthorizationComplete = async () => {
    if (holdInterval.current) clearInterval(holdInterval.current);

    setCoreState("EXECUTED");
    setHoldProgress(100);

    // [NEW] Trigger the Bio-Settlement Flow (Stage 2)
    // [BLUEPRINT] Binding the Circuit Breaker to this specific TX ID
    // Backend handles everything: EEG sim → hash → Lighthouse pin → Flow UpdatePulse
    await generateProof("backend-initiated");

    // Transition to receipt
    setTimeout(() => {
      setCoreState("RECEIPT");
      setHoldProgress(0);
    }, 2000);
  };

  const handleReset = () => {
    setCoreState("LOCKED");
    // [NEW] Open History automatically to show the "Audit Trail"
    setIsHistoryOpen(true);
  };

  // --- RENDER: ONBOARDING ---
  if (onboardingStep === 0) {
    return (
      <main className="w-full h-screen bg-lazarus-void flex items-center justify-center relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lazarus-cyan/5 rounded-full blur-[100px]" />
        </div>

        {/* Import Welcome Screen directly here since we verified the component is compatible but need to import it */}
        <div className="z-10">
          <h1 className="text-4xl text-white font-bold mb-8 text-center tracking-tight">
            LAZARUS <span className="text-lazarus-cyan">{"//"}</span> PROOF
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOnboardingStep(1)}
            className="group relative px-8 py-4 bg-lazarus-cyan/10 hover:bg-lazarus-cyan/20 border border-lazarus-cyan/50 text-lazarus-cyan rounded-full transition-all mx-auto block"
          >
            <span className="font-mono font-bold tracking-widest text-sm">
              CONNECT NEURAL INTERFACE
            </span>
          </motion.button>
          <p className="mt-4 text-gray-500 text-xs font-mono text-center">
            Waiting for WebHID signal...
          </p>
        </div>
      </main>
    );
  }

  if (onboardingStep === 1) {
    // [IMPROVED] Device Connection Simulation
    return (
      <DeviceConnectionSequence onComplete={() => setOnboardingStep(2)} />
    );
  }

  // --- RENDER: DASHBOARD ---
  return (
    <main
      className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-lazarus-void selection:bg-lazarus-cyan/30"
      onMouseUp={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
    >
      {/* [NEW] Bio-Immersive 3D Background */}
      <NeuralOrb />

      {/* Legacy Ambient Fallback (Optional, kept for depth) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lazarus-cyan/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lazarus-amber/5 rounded-full blur-[100px]" />
      </div>

      {/* [IMPACT] Cinematic Spotlight Overlay */}
      <motion.div
        animate={{
          opacity: (coreState === "PROPOSAL_RECEIVED" || coreState === "HOLDING") ? 0.8 : 0,
          backdropFilter: (coreState === "PROPOSAL_RECEIVED" || coreState === "HOLDING") ? "blur(4px)" : "blur(0px)"
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-lazarus-void z-0 pointer-events-none"
      />

      {/* Header */}
      <OrbitalHeader state={coreState} />

      {/* [NEW] Control DOCK (Vault & History) */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <button
          onClick={() => setIsVaultOpen(true)}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
          title="Security Vault"
        >
          <Shield className="w-5 h-5 text-gray-400 group-hover:text-lazarus-cyan transition-colors" />
        </button>
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
          title="Neural Archive"
        >
          <History className="w-5 h-5 text-gray-400 group-hover:text-lazarus-cyan transition-colors" />
        </button>
      </div>

      {/* LEFT: Agent Channel */}
      <AgentActivityPanel />

      {/* CENTER: The Gate (Orb) */}
      <div className="z-10 relative scale-125 mb-12">
        <NeuralCore state={coreState} />

        {/* Hold Progress Ring */}
        {coreState === "HOLDING" && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(0, 240, 255, 0.3)"
              strokeWidth="1"
            />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
              strokeDasharray="289" // 2 * pi * 46
              strokeDashoffset={289 - (289 * holdProgress) / 100}
              className="transition-all duration-75 ease-linear"
            />
          </svg>
        )}
      </div>

      {/* RIGHT: Details Drawer (Only on Proposal) */}
      <AnimatePresence>
        {(coreState === "PROPOSAL_RECEIVED" || coreState === "HOLDING") && (
          <DetailsDrawer key="drawer" onReject={handleReject} />
        )}
      </AnimatePresence>

      {/* CENTER OVERLAY: CHALLENGING STATE (Amber) */}
      <AnimatePresence>
        {coreState === "PROPOSAL_RECEIVED" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2/3 left-1/2 -translate-x-1/2 text-center pointer-events-none w-full max-w-md px-4"
          >
            <div className="text-lazarus-amber font-bold font-mono text-lg tracking-widest animate-pulse mb-2">
              HIGH-VALUE TRADE DETECTED
            </div>
            <div className="text-white/60 font-mono text-xs">
              Concentration Pulse required for Authorization.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER OVERLAY: VERIFIED STATE (Cyan) */}
      <AnimatePresence>
        {coreState === "EXECUTED" && (
          <motion.div
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2/3 left-1/2 -translate-x-1/2 text-center pointer-events-none w-full"
          >
            <div className="text-white font-bold font-mono text-2xl tracking-[0.5em] drop-shadow-[0_0_30px_rgba(0,240,255,1)]">
              INTENT ANCHORED
            </div>
            <div className="text-lazarus-cyan font-mono text-xs mt-2">
              Transaction released to Flow.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER OVERLAY: Sync Instruction & Timeline */}
      <AnimatePresence>
        {coreState === "SYNCING" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2/3 left-1/2 -translate-x-1/2 text-center space-y-4 pointer-events-none w-64"
          >
            <div className="space-y-1 min-h-[40px]">
              <div className="text-white/80 font-mono text-sm tracking-widest animate-pulse">
                {(() => {
                  // Dynamic Instructions based on time
                  return (
                    <InstructionRotator />
                  )
                })()}
              </div>
            </div>

            {/* VISUAL TIMELINE */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white shadow-[0_0_10px_white]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State Overlay */}
      <AnimatePresence>
        {coreState === "LOCKED" && onboardingStep === 2 && !isVaultOpen && !isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2/3 left-1/2 -translate-x-1/2 text-center pointer-events-none w-full"
          >
            <div className="text-blue-400 font-mono text-lg tracking-widest font-bold drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] mb-2">
              SYSTEM READY
            </div>
            <div className="text-gray-400 font-mono text-xs">
              Device Connected. Neural Link Active.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER BOTTOM: Interaction Layer */}
      <MicroTerminal active={coreState === "HOLDING"} />
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
        <AnimatePresence>
          {(coreState === "PROPOSAL_RECEIVED" || coreState === "HOLDING") && (
            <motion.button
              key="hold-btn"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onMouseDown={handleHoldStart}
              className="group relative overflow-hidden bg-lazarus-cyan/10 hover:bg-lazarus-cyan/20 border border-lazarus-cyan text-lazarus-cyan px-12 py-4 rounded-full font-bold font-mono tracking-widest transition-all active:scale-95 select-none"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                {coreState === "HOLDING" ? "AUTHORIZING..." : "HOLD TO APPROVE (2s)"}
              </span>

              {/* Fill effect */}
              <div
                className="absolute inset-0 bg-lazarus-cyan/20"
                style={{ width: `${holdProgress}%` }}
              />
            </motion.button>
          )}
        </AnimatePresence>

        {coreState === "RECEIPT" && (
          <motion.button
            layoutId="receipt-close"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={handleReset}
            className="text-gray-500 font-mono text-xs hover:text-white transition-colors"
          >
            CLOSE RECEIPT & RETURN TO LOCK
          </motion.button>
        )}
      </div>

      {/* OVERRAYS: Vault, History, Receipt */}
      <AnimatePresence>
        {isVaultOpen && <SecurityVault key="vault" isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />}
        {isHistoryOpen && <HistoryPanel key="history" isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />}
        {coreState === "RECEIPT" && <ReceiptView key="receipt" onClose={handleReset} />}
      </AnimatePresence>

      {/* [NEW] Auto-Approve Toast */}
      <AnimatePresence>
        {autoApproveToast && (
          <motion.div
            key="toast"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-full font-mono text-xs flex items-center gap-2 backdrop-blur-md z-50"
          >
            <Shield className="w-4 h-4 fill-green-500/20" />
            {autoApproveToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev Controls */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <button
          onClick={handleSimulateSmall}
          disabled={coreState !== "LOCKED"}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-[10px] font-mono text-gray-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          [DEBUG] BUY COFFEE ($5)
        </button>
        <button
          onClick={handleSimulateProposal}
          disabled={coreState !== "LOCKED"}
          className="bg-lazarus-crimson/20 hover:bg-lazarus-crimson/40 border border-lazarus-crimson px-4 py-2 rounded-full text-[10px] font-mono text-lazarus-crimson disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          [DEBUG] ASSET REBALANCE ($50k)
        </button>
      </div>
    </main >
  );
}

// [NEW] Sub-component to handle the complex connection animation cleanly
const DeviceConnectionSequence = ({ onComplete }: { onComplete: () => void }) => {
  // States: "SCANNING" | "FOUND" | "PAIRING" | "CALIBRATING" | "CONNECTED"
  const [connectState, setConnectState] = useState("SCANNING");

  useEffect(() => {
    // Timeline
    const t1 = setTimeout(() => setConnectState("FOUND"), 2000);
    const t2 = setTimeout(() => setConnectState("PAIRING"), 3500);
    const t3 = setTimeout(() => setConnectState("CALIBRATING"), 5500);
    const t4 = setTimeout(() => setConnectState("CONNECTED"), 7500);
    // Removed t5 auto-advance to require manual authorization

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <main className="w-full h-screen bg-lazarus-void flex items-center justify-center relative overflow-hidden">
      {/* Background Atmosphere - Matched to Welcome Screen */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lazarus-cyan/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lazarus-amber/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md z-10">

        {/* Visualizer Circle */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Ring 1 - Pulse */}
          <div className={`absolute inset-0 border border-lazarus-cyan/30 rounded-full ${connectState === "SCANNING" ? "animate-ping" : "opacity-20"}`} />

          {/* Ring 2 - Spin */}
          {(connectState === "PAIRING" || connectState === "CALIBRATING") && (
            <div className="absolute inset-2 border-t-2 border-lazarus-cyan rounded-full animate-spin" />
          )}

          {/* Icon */}
          <div className="relative z-10 bg-black/50 p-6 rounded-full border border-white/10 backdrop-blur-md">
            {connectState === "CHECK" ? (
              <Shield className="w-12 h-12 text-green-400" />
            ) : (
              <Cpu className={`w-12 h-12 ${connectState === "CONNECTED" ? "text-green-400" : "text-lazarus-cyan"}`} />
            )}
          </div>
        </div>

        {/* Text Feedback */}
        <div className="text-center space-y-2 h-16">
          <h2 className="text-lg text-white font-mono tracking-widest font-bold">
            {connectState === "SCANNING" && "SCANNING BLUETOOTH..."}
            {connectState === "FOUND" && "DEVICE DETECTED"}
            {connectState === "PAIRING" && "ESTABLISHING HANDSHAKE"}
            {connectState === "CALIBRATING" && "CALIBRATING SENSORS"}
            {connectState === "CONNECTED" && "NEURAL LINK ACTIVE"}
          </h2>
          <p className="text-xs text-lazarus-cyan/60 font-mono">
            {connectState === "SCANNING" && "Looking for available BCI Headsets via WebHID..."}
            {connectState === "FOUND" && "Found: MUSE S (Signal: 98%) - [MAC: XX:XX:XX]"}
            {connectState === "PAIRING" && "Exchanging RSA-2048 Public Keys..."}
            {connectState === "CALIBRATING" && "Baseline: Alpha [10Hz] / Beta [22Hz]"}
            {connectState === "CONNECTED" && "Sovereign Control Protocol: ENABLED"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
          <motion.div
            className="h-full bg-lazarus-cyan shadow-[0_0_10px_#00F0FF]"
            initial={{ width: "0%" }}
            animate={{
              width: connectState === "SCANNING" ? "25%" :
                connectState === "FOUND" ? "50%" :
                  connectState === "PAIRING" ? "75%" :
                    connectState === "CALIBRATING" ? "90%" : "100%"
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* [NEW] Manual Authorization Step */}
        <AnimatePresence>
          {connectState === "CONNECTED" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <button
                onClick={onComplete}
                className="group relative px-8 py-3 bg-lazarus-cyan hover:bg-lazarus-cyan/90 text-black rounded-full transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
              >
                <span className="font-mono font-bold tracking-widest text-xs flex items-center gap-2">
                  AUTHORIZE NEURAL SYNC <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              <p className="mt-4 text-[10px] text-gray-500 font-mono max-w-xs mx-auto">
                By clicking, you authorize Lazarus to process real-time EEG data for the purpose of biometric intent verification.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}


// [NEW] Sub-component for Rotating Instructions
const InstructionRotator = () => {
  const [text, setText] = useState("ESTABLISHING BASELINE");
  const [subtext, setSubtext] = useState("Syncing Neural Rhythm...");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setText("BREATHE DEEPLY");
      setSubtext("Clear your mind...");
    }, 4000);

    const t2 = setTimeout(() => {
      setText("FOCUS ON THE ORB");
      setSubtext("Visualize the center...");
    }, 9000);

    const t3 = setTimeout(() => {
      setText("CALIBRATING SENSORS");
      setSubtext("Hold steady...");
    }, 13000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="block">{text}</span>
      <span className="text-lazarus-cyan/50 font-mono text-[10px] normal-case tracking-normal">{subtext}</span>
    </div>
  );
};
