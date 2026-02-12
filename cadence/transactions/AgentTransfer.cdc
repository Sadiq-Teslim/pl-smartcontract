// ============================================================================
// AgentTransfer.cdc — AI Agent Guarded $FLOW Transfer
// ============================================================================
//
// PURPOSE:
//   Template transaction for an AI agent to transfer $FLOW tokens.
//   This transaction WILL REVERT if the LazarusGuard circuit breaker
//   is open (i.e., the neural pulse has expired).
//
// THE "HUMAN-IN-THE-LOOP" ENFORCEMENT:
//   The `prepare` phase calls `LazarusGuard.requireValidPulse()` BEFORE
//   any value is moved. If the human operator hasn't pinned a Neural
//   Intent Hash to Filecoin within the last 300 seconds, the entire
//   transaction panics and no tokens are transferred.
//
//   This is the on-chain enforcement of the biological circuit breaker:
//   the AI agent literally CANNOT spend funds without recent human
//   authorization, no matter how sophisticated its reasoning.
//
// ACCOUNT ABSTRACTION NOTE:
//   In a full multi-sig setup, the AI agent would be a secondary signer
//   proposing the transaction, while the Neural Oracle's pulse acts as
//   the first "signature" (temporal proof-of-human-intent). This gives
//   us 2-of-2 multi-sig semantics without requiring both parties to
//   sign the same transaction object:
//     - Signature 1: Human pins CID to Filecoin (off-chain, temporal)
//     - Signature 2: AI agent signs the Flow transaction (on-chain)
//
// PARAMETERS:
//   - amount:    UFix64  — The amount of $FLOW to transfer.
//   - recipient: Address — The Flow address to receive the tokens.
// ============================================================================

import LazarusGuard from "LazarusGuard"
import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"

transaction(amount: UFix64, recipient: Address) {

    /// The withdrawn vault, ready to be deposited into the recipient.
    /// Stored as a resource field so it survives from `prepare` to `execute`.
    let sentVault: @{FungibleToken.Vault}

    /// Snapshot of the CID at the time of the guard check, for logging.
    let verifiedCID: String

    prepare(signer: auth(BorrowValue) &Account) {
        // ════════════════════════════════════════════════════════════════
        // STEP 1: CIRCUIT BREAKER CHECK (The Lazarus Guard)
        // ════════════════════════════════════════════════════════════════
        // This is the critical security gate. If the neural pulse has
        // expired (>300s since last human verification), the ENTIRE
        // transaction reverts here. No tokens are touched.
        //
        // `requireValidPulse()` does two things:
        //   1. Asserts that the pulse is within the validity window.
        //   2. Emits a `GuardCheckPassed` event for the audit trail.
        //
        // Why `requireValidPulse()` instead of a manual assert?
        //   - Centralizes the check logic in the contract.
        //   - Emits the audit event automatically.
        //   - Produces a descriptive error message with timestamps.
        LazarusGuard.requireValidPulse()

        // Snapshot the CID for logging in the execute phase.
        self.verifiedCID = LazarusGuard.lastVerifiedCID

        // ════════════════════════════════════════════════════════════════
        // STEP 2: WITHDRAW TOKENS
        // ════════════════════════════════════════════════════════════════
        // Only reached if the guard check passed (human recently verified).
        // Borrow the signer's FlowToken vault with Withdraw entitlement
        // and extract the requested amount.
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic(
            "AgentTransfer: Could not borrow FlowToken vault from signer's storage. "
            .concat("Ensure this account has a FlowToken vault at /storage/flowTokenVault.")
        )

        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        // ════════════════════════════════════════════════════════════════
        // STEP 3: DEPOSIT TOKENS TO RECIPIENT
        // ════════════════════════════════════════════════════════════════
        // Borrow the recipient's public FungibleToken.Receiver capability
        // and deposit the withdrawn vault.
        let receiverRef = getAccount(recipient)
            .capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            ?? panic(
                "AgentTransfer: Could not borrow FungibleToken.Receiver from recipient "
                .concat(recipient.toString())
                .concat(". Ensure the recipient has a FlowToken vault configured.")
            )

        receiverRef.deposit(from: <- self.sentVault)

        log(
            "AgentTransfer: Successfully transferred "
            .concat(amount.toString())
            .concat(" FLOW to ")
            .concat(recipient.toString())
            .concat(" | Verified CID: ")
            .concat(self.verifiedCID)
        )
    }

    post {
        // Post-condition: the guard should still be valid after execution.
        // This protects against edge cases where the pulse expires between
        // prepare and execute within the same block (extremely unlikely
        // but worth asserting for correctness).
        LazarusGuard.isNeuralPulseValid():
            "AgentTransfer: Neural pulse expired during transaction execution."
    }
}
