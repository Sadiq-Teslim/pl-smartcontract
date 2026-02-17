export type CoreState = "LOCKED" | "PROPOSAL_RECEIVED" | "HOLDING" | "EXECUTED" | "RECEIPT" | "SYNCING";

export interface IntentReceipt {
    intentId: string;
    paramsHash: string;
    timestamp: number;
    nonce: string;
    status: "FINALIZED";
}
