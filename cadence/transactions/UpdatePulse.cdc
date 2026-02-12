// ============================================================================
// UpdatePulse.cdc — Neural Oracle Pulse Transaction
// ============================================================================
//
// PURPOSE:
//   Called by the backend ("Neural Oracle" / Dev 1's server) to push a
//   fresh Filecoin CID onto the Flow contract, refreshing the circuit
//   breaker's pulse and allowing AI agent transactions for the next
//   300 seconds (5 minutes).
//
// CALLER:
//   The Flow account that deployed LazarusGuard.cdc (the Neural Oracle).
//   This account holds the OracleAdmin resource in its storage.
//
// FLOW (pun intended):
//   1. Human reviews AI agent's proposed action.
//   2. Human pins Neural Intent Hash to Filecoin via Lighthouse SDK.
//   3. Backend receives the CID from Lighthouse.
//   4. Backend signs and submits THIS transaction with the CID.
//   5. Contract records the CID + block timestamp.
//   6. AI agent's next transaction will pass the guard check.
//
// SECURITY:
//   - Only the account holding the OracleAdmin resource can execute this.
//   - The `auth(LazarusGuard.NeuralOracle)` entitlement ensures that
//     even if another account somehow obtained an OracleAdmin reference,
//     it would need the specific entitlement to call `updateIntent`.
//   - The CID is recorded immutably on-chain via the IntentUpdated event,
//     creating a verifiable audit trail.
// ============================================================================

import LazarusGuard from "LazarusGuard"

transaction(cid: String) {

    /// Reference to the OracleAdmin resource, borrowed with the
    /// NeuralOracle entitlement so we can call `updateIntent`.
    let admin: auth(LazarusGuard.NeuralOracle) &LazarusGuard.OracleAdmin

    prepare(signer: auth(BorrowValue) &Account) {
        // Borrow the OracleAdmin from the signer's storage.
        // This will ONLY succeed for the account that deployed
        // LazarusGuard (the Neural Oracle operator).
        //
        // If any other account tries to run this transaction,
        // the borrow returns nil and we panic with a clear message.
        self.admin = signer.storage.borrow<auth(LazarusGuard.NeuralOracle) &LazarusGuard.OracleAdmin>(
            from: LazarusGuard.OracleAdminStoragePath
        ) ?? panic(
            "UpdatePulse: Could not borrow OracleAdmin resource. "
            .concat("Only the Neural Oracle account can execute this transaction.")
        )
    }

    execute {
        // Push the Filecoin CID on-chain, refreshing the pulse timestamp.
        // After this call, `LazarusGuard.isNeuralPulseValid()` will return
        // true for the next 300 seconds.
        self.admin.updateIntent(cid: cid)

        log("UpdatePulse: Neural pulse refreshed with CID: ".concat(cid))
    }

    post {
        // Post-condition: verify the contract state was actually updated.
        // This is a belt-and-suspenders check — if updateIntent succeeded,
        // this should always pass. But explicit post-conditions make the
        // contract's guarantees visible to auditors and hackathon judges.
        LazarusGuard.lastVerifiedCID == cid:
            "UpdatePulse: Post-condition failed — CID was not persisted."
        LazarusGuard.isNeuralPulseValid():
            "UpdatePulse: Post-condition failed — pulse is not valid after update."
    }
}
