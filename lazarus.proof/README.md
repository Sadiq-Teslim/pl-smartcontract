# LAZARUS // PROOF
### The Sovereign Identity & Biometric Settlement Layer

> **"Human Presence is the New Private Key."**

`Lazarus.proof` is a high-fidelity Proof of Concept (PoC) for a **Biometric Intent Verification System**. It replaces traditional private key signing with a **"Neural Handshake,"** using real-time EEG data to authenticate high-value transactions on the Solana blockchain.

This repository contains the complete frontend simulation of the **"Real-World Flow,"** designed to demonstrate the seamless transition from a passive state to an active, authorized state using nothing but thought.

---

## ⚡ The "Real-World Flow" Demo

This application simulates a live "Sovereign Gate" experience, adhering to a strict 4-stage state machine:

### 1. The Handshake (Neural Sync)
*   **Visual:** White, Breathing Orb.
*   **Action:** User connects device -> Authorizes Stream -> 15s Calibration.
*   **Feedback:** "BREATHE DEEPLY" -> "FOCUS ON THE ORB" -> "CALIBRATING SENSORS".
*   **Outcome:** Neural Baseline Established.

### 2. The Ready State (Passive Protection)
*   **Visual:** Low-Energy Blue Orb (Resting State).
*   **Text:** "DEVICE CONNECTED. NEURAL LINK ACTIVE."
*   **Security:** Threshold set (e.g., $500). Transactions below this are auto-signed.
*   **Status:** System is locked and monitoring.

### 3. The Challenge (High-Value Intent)
*   **Visual:** Amber Pulse (Warning/Alert).
*   **Trigger:** Attempting a transaction *above* the threshold (simulated $50,000 "Asset Rebalance").
*   **Text:** "HIGH-VALUE TRADE DETECTED!"
*   **Instruction:** "FOCUS NOW TO AUTHORIZE."
*   **Requirement:** User must hold their focus (simulated by holding the button) to generate a "Concentration Spike."

### 4. The Verification (Bio-Proof)
*   **Visual:** Cyan Explosion (Success).
*   **Text:** "INTENT ANCHORED."
*   **Outcome:** Transaction released to the blockchain.
*   **Proof:** Digital Receipt generated with "Liveness Checks" and "Neural Hash."

---

## 🛠️ Technology Stack

Built for **Maximum Visual Fidelity** and **Zero-Latency Interactions**:

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Poly-Repo Architecture)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom "Lazarus" Design System)
*   **Animation:** [Framer Motion](https://www.framer.com/motion/) (Complex Orchestration, Layout Animations)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Global Neural Store)
*   **Icons:** [Lucide React](https://lucide.dev/) (Consistent Iconography)
*   **Biometrics (Simulated):** Custom `NeuralStream` service mocking WebHID/EEG data streams.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   npm / yarn / pnpm / bun

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lazarus-proof.git
    cd lazarus-proof
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    bun dev
    ```

4.  **Open the App:**
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx            # Main Demo Controller (The "Brain")
│   ├── layout.tsx          # Global Layout & Fonts
│   └── globals.css         # Tailwind & Custom Utilities
├── components/
│   ├── neural/             # The Orb & Visualization Logic
│   │   ├── NeuralCore.tsx  # Central State Visualizer
│   │   ├── NeuralOrb.tsx   # 3D/Canvas Rendering
│   │   └── Waveform.tsx    # FFT Data Visualization
│   ├── dashboard/          # UI Panels & Overlays
│   │   ├── OrbitalHeader.tsx
│   │   ├── SecurityVault.tsx
│   │   ├── HistoryPanel.tsx
│   │   └── ReceiptView.tsx
│   └── onboarding/         # Setup Flow
├── lib/
│   ├── flow.ts             # State Machine Logic
│   └── types.ts            # TypeScript Definitions
└── store/
    └── neural-store.ts     # Global State (Thresholds, User Data)
```

---

## 🔐 Security & Privacy (Concept)

*   **Zero-Knowledge Proofs:** Raw brainwave data *never* leaves the local device. Only the cryptographic proof of "Intent" is broadcasted.
*   **Sovereign Storage:** All sensitive biometric templates are stored in the user's encrypted local vault (simulated via LocalStorage/State).
*   **Circuit Breaker:** The "Bio-Seal" acts as a final, immutable check before any high-value transaction can be signed.

---

### Credit
*   **Concept & Design:** [Your Name / Team Name]
*   **Engineering:** "Antigravity" Agentic Assistant

> *Verify the human, not the identity.*
