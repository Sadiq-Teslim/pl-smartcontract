// ============================================================================
// GetGuardStatus.cdc — Read-only query for the circuit breaker state
// ============================================================================
//
// Use this script from the backend or frontend to poll the guard status
// BEFORE the AI agent attempts a transaction. This avoids wasting gas on
// transactions that would revert.
//
// Returns a struct with all relevant state in a single call.
//
// Usage (Flow CLI):
//   flow scripts execute cadence/scripts/GetGuardStatus.cdc --network=emulator
//
// Usage (FCL in JS/TS):
//   const status = await fcl.query({ cadence: THIS_SCRIPT });
// ============================================================================

import LazarusGuard from "LazarusGuard"

access(all) fun main(): {String: AnyStruct} {
    return {
        "isValid": LazarusGuard.isNeuralPulseValid(),
        "secondsUntilExpiry": LazarusGuard.secondsUntilExpiry(),
        "lastVerifiedCID": LazarusGuard.lastVerifiedCID,
        "lastPulseTimestamp": LazarusGuard.lastPulseTimestamp,
        "pulseValidityWindow": LazarusGuard.PULSE_VALIDITY_WINDOW
    }
}
