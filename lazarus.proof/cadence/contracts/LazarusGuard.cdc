// LazarusGuard.cdc
// "The Guardrail" - A Bio-Digital Circuit Breaker for Flow Blockchain

pub contract LazarusGuard {

    // ==========================================
    // STATE
    // ==========================================

    // The Circuit Breaker State
    // If true, the circuit is OPEN (Transaction Blocked)
    // If false, the circuit is CLOSED (Transaction Allowed)
    pub var isBreakerActive: Bool

    // Valid CIDs that have been proven by Biology
    pub var verifiedCIDs: {String: UFix64} // CID -> Timestamp

    // ==========================================
    // EVENTS
    // ==========================================
    pub event CircuitBreakerTriggered(threshold: UFix64, amount: UFix64)
    pub event NeuralProofVerified(cid: String, timestamp: UFix64)

    // ==========================================
    // RESOURCES
    // ==========================================

    // The "Key" created by the User's Brain
    pub resource NeuralProof {
        pub let cid: String
        pub let timestamp: UFix64

        init(cid: String) {
            self.cid = cid
            self.timestamp = getCurrentBlock().timestamp
        }
    }

    // ==========================================
    // FUNCTIONS
    // ==========================================

    // Called by the "AI Agent" (or Transaction Script)
    // Returns TRUE if the transaction is allowed to proceed
    pub fun requestPassage(amount: UFix64, proof: @NeuralProof?): Bool {
        
        // 1. Check Threshold (Hardcoded $500 for demo, usually dynamic)
        let threshold = 500.0

        if (amount <= threshold) {
            // "Auto-Approve" / Circuit Closed
            destroy proof
            return true
        }

        // 2. High Value - Circuit is OPEN (Visual: Amber Orb)
        if (proof == nil) {
            emit CircuitBreakerTriggered(threshold: threshold, amount: amount)
            return false // BLOCK TRANSACTION
        }

        // 3. Verify the Proof (Visual: Cyan Orb)
        let unwrappedProof <- proof!
        
        // Verify Liveness (Proof must be < 60 seconds old)
        let isLive = (getCurrentBlock().timestamp - unwrappedProof.timestamp) < 60.0

        if (isLive) {
            self.verifiedCIDs[unwrappedProof.cid] = unwrappedProof.timestamp
            emit NeuralProofVerified(cid: unwrappedProof.cid, timestamp: unwrappedProof.timestamp)
            destroy unwrappedProof
            return true // ALLOW TRANSACTION
        } else {
            destroy unwrappedProof
            return false // EXPIRED PROOF
        }
    }

    init() {
        self.isBreakerActive = true
        self.verifiedCIDs = {}
    }
}
