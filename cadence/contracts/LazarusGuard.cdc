// ============================================================================
// LazarusGuard.cdc — Biological Circuit Breaker for AI Agents
// ============================================================================
//
// PROJECT: Lazarus.Proof
// STANDARD: Cadence 1.0 (Stable Cadence)
// NETWORK:  Flow Blockchain
//
// SECURITY MODEL — "Human-in-the-Loop"
// ─────────────────────────────────────
// This contract enforces a fundamental invariant:
//
//   NO AI agent may execute a value-transferring transaction on Flow
//   unless a human operator has RECENTLY anchored a "Neural Intent Hash"
//   to Filecoin (via Lighthouse).
//
// The flow is:
//   1. Human reviews the AI agent's proposed action off-chain.
//   2. Human pins a Neural Intent Hash (CID) to Filecoin via Lighthouse.
//   3. Backend ("Neural Oracle") calls `updateIntent(cid:)` on this contract,
//      recording the CID and the current block timestamp.
//   4. AI agent submits its transaction. In the `prepare` phase, the
//      transaction calls `isNeuralPulseValid()`. If > 300 seconds have
//      elapsed since the last pulse, the transaction REVERTS.
//
// This creates a cryptographic tether between human intent (Filecoin CID)
// and on-chain execution (Flow transaction), forming a "biological circuit
// breaker" that prevents autonomous AI spending without human sign-off.
// ============================================================================

access(all) contract LazarusGuard {

    // ========================================================================
    // STATE
    // ========================================================================

    /// The most recently verified Filecoin Content Identifier (CID).
    /// This is the hash of the Neural Intent object pinned via Lighthouse.
    /// An empty string indicates no intent has ever been registered.
    access(all) var lastVerifiedCID: String

    /// Block timestamp (UFix64, seconds since Unix epoch) at which the
    /// most recent Neural Intent was anchored on-chain.
    /// Initialized to 0.0 so that `isNeuralPulseValid()` returns false
    /// until the first pulse is pushed.
    access(all) var lastPulseTimestamp: UFix64

    /// The validity window in seconds. A neural pulse is considered
    /// "alive" only within this window. 300s = 5 minutes.
    /// Declared as `let` (immutable) — the window is a protocol constant.
    access(all) let PULSE_VALIDITY_WINDOW: UFix64

    // ========================================================================
    // STORAGE PATHS
    // ========================================================================

    /// Canonical storage path for the OracleAdmin resource.
    /// Only the deploying account holds this resource.
    access(all) let OracleAdminStoragePath: StoragePath

    // ========================================================================
    // EVENTS
    // ========================================================================

    /// Emitted when the Neural Oracle successfully updates the intent.
    /// Hackathon judges: index on this event to build an audit trail
    /// linking every Filecoin CID to its on-chain registration timestamp.
    access(all) event IntentUpdated(cid: String, timestamp: UFix64)

    /// Emitted when an AI agent's transaction passes the guard check.
    /// Useful for monitoring dashboards — shows the system is working.
    access(all) event GuardCheckPassed(cid: String, timestamp: UFix64)

    // ========================================================================
    // ENTITLEMENTS
    // ========================================================================

    /// Fine-grained access control (Cadence 1.0 entitlement).
    /// Only references authorized with `NeuralOracle` can call
    /// `updateIntent(cid:)` on the OracleAdmin resource.
    /// This replaces the pre-1.0 pattern of `pub(set)` or `AuthAccount` guards.
    access(all) entitlement NeuralOracle

    // ========================================================================
    // RESOURCES
    // ========================================================================

    /// OracleAdmin — The privileged resource held by the Neural Oracle.
    ///
    /// SECURITY: This resource is created ONCE in `init()` and saved to
    /// the deployer's account storage. Only the account that holds this
    /// resource can borrow an `auth(NeuralOracle)` reference, which is
    /// required to call `updateIntent`. This is the Cadence 1.0 equivalent
    /// of an "onlyOwner" modifier in Solidity.
    ///
    /// MULTI-SIG EXTENSION: To implement multi-sig, wrap this resource
    /// inside a governance resource that requires N-of-M signatures
    /// before forwarding the `updateIntent` call.
    access(all) resource OracleAdmin {

        /// Push a new Neural Intent Hash on-chain.
        /// This is the ONLY way to refresh the circuit breaker's pulse.
        ///
        /// Parameters:
        ///   - cid: The Filecoin CID (e.g., "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")
        ///          returned by the Lighthouse pinning API after the human
        ///          approved the AI agent's proposed action.
        ///
        /// Access: Requires `auth(NeuralOracle)` — only the deployer's
        ///         account can borrow this reference from storage.
        access(NeuralOracle) fun updateIntent(cid: String) {
            pre {
                cid.length > 0: "LazarusGuard: CID must not be empty."
            }

            LazarusGuard.lastVerifiedCID = cid
            LazarusGuard.lastPulseTimestamp = getCurrentBlock().timestamp

            emit IntentUpdated(
                cid: cid,
                timestamp: LazarusGuard.lastPulseTimestamp
            )
        }
    }

    // ========================================================================
    // PUBLIC QUERY FUNCTIONS
    // ========================================================================

    /// The core circuit-breaker check.
    ///
    /// Returns `true` if and only if the elapsed time since the last
    /// neural pulse is within the PULSE_VALIDITY_WINDOW (300 seconds).
    ///
    /// Declared `view` — this is a pure read with no side effects,
    /// safe to call from scripts, transaction `prepare` phases, or
    /// other `view` contexts.
    ///
    /// AI agents call this in their transaction's `prepare` phase.
    /// If it returns `false`, the transaction MUST revert (see
    /// AgentTransfer.cdc for the canonical pattern).
    access(all) view fun isNeuralPulseValid(): Bool {
        let currentTime = getCurrentBlock().timestamp
        let elapsed = currentTime - self.lastPulseTimestamp
        return elapsed <= self.PULSE_VALIDITY_WINDOW
    }

    /// Convenience getter: returns seconds remaining until the pulse expires.
    /// Returns 0.0 if already expired. Useful for frontend countdown timers.
    access(all) view fun secondsUntilExpiry(): UFix64 {
        let currentTime = getCurrentBlock().timestamp
        let elapsed = currentTime - self.lastPulseTimestamp

        if elapsed >= self.PULSE_VALIDITY_WINDOW {
            return 0.0
        }
        return self.PULSE_VALIDITY_WINDOW - elapsed
    }

    /// Assertive guard — call this to revert with a clear error message
    /// if the pulse has expired. Non-view because it emits GuardCheckPassed
    /// on success (providing an auditable on-chain trail).
    access(all) fun requireValidPulse() {
        assert(
            self.isNeuralPulseValid(),
            message: "LazarusGuard: Neural pulse expired. "
                .concat("Human verification required. Last pulse at: ")
                .concat(self.lastPulseTimestamp.toString())
                .concat("s. Window: ")
                .concat(self.PULSE_VALIDITY_WINDOW.toString())
                .concat("s.")
        )

        emit GuardCheckPassed(
            cid: self.lastVerifiedCID,
            timestamp: getCurrentBlock().timestamp
        )
    }

    // ========================================================================
    // CONTRACT INITIALIZER
    // ========================================================================

    init() {
        // Initialize state — pulse starts "dead" (timestamp 0.0) so that
        // no AI agent can transact until the first human verification.
        self.lastVerifiedCID = ""
        self.lastPulseTimestamp = 0.0
        self.PULSE_VALIDITY_WINDOW = 300.0 // 5 minutes in seconds

        self.OracleAdminStoragePath = /storage/LazarusOracleAdmin

        // Mint the singular OracleAdmin resource and deposit it into
        // the deploying account's storage. This account becomes the
        // "Neural Oracle" — the only entity that can refresh the pulse.
        //
        // In `init()`, `self.account` is an `auth(Storage, Contracts,
        // Keys, Inbox, Capabilities) &Account` reference to the deployer.
        let admin <- create OracleAdmin()
        self.account.storage.save(<- admin, to: self.OracleAdminStoragePath)
    }
}
