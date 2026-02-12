# Lazarus.Proof — Backend Integration Guide

> Your backend is the **Neural Oracle**: the only system authorized to refresh
> the on-chain circuit breaker. Without your pulse, the AI agent cannot move
> a single token on Flow.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Your Two Responsibilities](#your-two-responsibilities)
3. [Setup](#setup)
4. [Contract Addresses by Network](#contract-addresses-by-network)
5. [Integration Code](#integration-code)
   - [1. Configure FCL](#1-configure-fcl)
   - [2. Build the Transaction Signer](#2-build-the-transaction-signer)
   - [3. Pin Intent to Filecoin (Lighthouse)](#3-pin-intent-to-filecoin-lighthouse)
   - [4. Push CID to Flow (UpdatePulse)](#4-push-cid-to-flow-updatepulse)
   - [5. Query Guard Status (Read-Only)](#5-query-guard-status-read-only)
   - [6. Full Endpoint: Approve Intent](#6-full-endpoint-approve-intent)
6. [API Surface for the AI Agent](#api-surface-for-the-ai-agent)
7. [Error Handling](#error-handling)
8. [Testnet Deployment](#testnet-deployment)
9. [Security Checklist](#security-checklist)

---

## Architecture Overview

```
 ┌──────────────────────────────────────────────────────────────────┐
 │                        HUMAN OPERATOR                           │
 │            Reviews AI agent's proposed action                   │
 │                    Clicks "Approve"                             │
 └──────────────────────┬───────────────────────────────────────────┘
                        │
                        ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │                     YOUR BACKEND                                │
 │                  (Neural Oracle)                                 │
 │                                                                  │
 │  Step 1: Pin Neural Intent Hash to Filecoin via Lighthouse      │
 │          → returns CID (e.g., "bafybei...")                     │
 │                                                                  │
 │  Step 2: Send UpdatePulse transaction to Flow with that CID     │
 │          → refreshes the 300-second validity window             │
 └──────────┬──────────────────────────────────┬────────────────────┘
            │                                  │
            ▼                                  ▼
 ┌────────────────────┐           ┌─────────────────────────────────┐
 │     Filecoin       │           │          Flow Blockchain         │
 │   (Lighthouse)     │           │                                  │
 │                    │           │  LazarusGuard contract stores:   │
 │  Stores the full   │           │   - lastVerifiedCID              │
 │  intent payload    │           │   - lastPulseTimestamp           │
 │  permanently       │           │                                  │
 └────────────────────┘           │  isNeuralPulseValid() → true    │
                                  │  (for next 300 seconds)          │
                                  └──────────────┬──────────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────────┐
                                  │          AI AGENT               │
                                  │                                  │
                                  │  Submits AgentTransfer.cdc      │
                                  │  Contract checks the guard →    │
                                  │    ✅ Pulse valid: transfer OK   │
                                  │    ❌ Pulse expired: REVERT      │
                                  └─────────────────────────────────┘
```

**The 300-second window is the core security primitive.** After a human approves
an action, the AI agent has exactly 5 minutes to execute. After that, the
circuit breaker trips and all agent transactions revert until the next approval.

---

## Your Two Responsibilities

| # | Action | Tool | Output |
|---|--------|------|--------|
| 1 | Pin the Neural Intent Hash to Filecoin | Lighthouse SDK | A CID string |
| 2 | Push that CID to the Flow contract | Flow Client Library (FCL) | A sealed transaction |

That's it. Everything else (the guard check, the revert logic, the audit trail)
is handled by the on-chain contract.

---

## Setup

### Install dependencies

```bash
npm install @onflow/fcl @lighthouse-web3/sdk elliptic sha3 dotenv
npm install -D @types/elliptic
```

| Package | Purpose |
|---------|---------|
| `@onflow/fcl` | Flow Client Library — signs and sends transactions |
| `@lighthouse-web3/sdk` | Pins data to Filecoin via Lighthouse |
| `elliptic` + `sha3` | Signs Flow transactions with the Oracle's private key |
| `dotenv` | Loads `.env` for local development |

### Environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

```env
# Flow — TESTNET (live)
FLOW_ORACLE_ADDRESS=32258b0c4e249730
FLOW_PRIVATE_KEY=425d819476d196cb73a37a854872ec6e81324e2447be77ca4062d17370c5b2d0
FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
LAZARUS_GUARD_ADDRESS=32258b0c4e249730

# Lighthouse
LIGHTHOUSE_API_KEY=<your key from files.lighthouse.storage>

# Server
PORT=3001
NODE_ENV=development
```



---

## Contract Addresses by Network

| Network | LazarusGuard | FlowToken | FungibleToken |
|---------|-------------|-----------|---------------|
| Emulator | `0xf8d6e0586b0a20c7` | `0x0ae53cb6e3f42a79` | `0xee82856bf20e2aa6` |
| Testnet | **`0x32258b0c4e249730`** | `0x7e60df042a9c0868` | `0x9a0766d93b6608b7` |
| Mainnet | TBD | `0x1654653399040a61` | `0xf233dcee88fe0abe` |

---

## Integration Code

All code below is TypeScript. Adapt to your stack as needed.

### 1. Configure FCL

```typescript
// src/config/flow.ts
import * as fcl from "@onflow/fcl";

const NETWORK = process.env.NODE_ENV === "production" ? "mainnet" : "emulator";

fcl.config({
  "accessNode.api": process.env.FLOW_ACCESS_NODE!,
  "flow.network": NETWORK,
});

export { fcl };
```

### 2. Build the Transaction Signer

The Oracle account's private key signs every `UpdatePulse` transaction.
This authorization function tells FCL how to sign.

```typescript
// src/config/signer.ts
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import * as fcl from "@onflow/fcl";

const ec = new EC("p256");

const PRIVATE_KEY = process.env.FLOW_PRIVATE_KEY!;
const ORACLE_ADDRESS = process.env.FLOW_ORACLE_ADDRESS!;

function sign(message: string): string {
  const key = ec.keyFromPrivate(Buffer.from(PRIVATE_KEY, "hex"));
  const sha = new SHA3(256);
  sha.update(Buffer.from(message, "hex"));
  const sig = key.sign(sha.digest());
  const n = 32;
  const r = sig.r.toArrayLike(Buffer, "be", n);
  const s = sig.s.toArrayLike(Buffer, "be", n);
  return Buffer.concat([r, s]).toString("hex");
}

export function oracleAuthorization(account: any) {
  return {
    ...account,
    tempId: `${ORACLE_ADDRESS}-0`,
    addr: fcl.sansPrefix(ORACLE_ADDRESS),
    keyId: 0,
    signingFunction: (signable: { message: string }) => ({
      addr: fcl.withPrefix(ORACLE_ADDRESS),
      keyId: 0,
      signature: sign(signable.message),
    }),
  };
}
```

### 3. Pin Intent to Filecoin (Lighthouse)

```typescript
// src/services/lighthouse.ts
import lighthouse from "@lighthouse-web3/sdk";

export interface NeuralIntent {
  agentId: string;
  action: string;       // e.g., "transfer"
  params: object;       // e.g., { amount: "10.0", recipient: "0x..." }
  approvedBy: string;   // human operator identifier
  timestamp: number;    // Date.now()
  nonce: string;        // crypto.randomUUID()
}

export async function pinNeuralIntent(intent: NeuralIntent): Promise<string> {
  const payload = JSON.stringify(intent);

  const response = await lighthouse.uploadText(
    payload,
    process.env.LIGHTHOUSE_API_KEY!
  );

  // response.data.Hash is the IPFS/Filecoin CID
  const cid: string = response.data.Hash;

  console.log(`[Lighthouse] Pinned intent → CID: ${cid}`);
  return cid;
}
```

### 4. Push CID to Flow (UpdatePulse)

```typescript
// src/services/flow.ts
import { fcl } from "../config/flow";
import { oracleAuthorization } from "../config/signer";

const GUARD_ADDRESS = process.env.LAZARUS_GUARD_ADDRESS!;

// The Cadence transaction — inline so you don't need to read .cdc files at runtime.
// This is identical to cadence/transactions/UpdatePulse.cdc.
const UPDATE_PULSE_CDC = `
import LazarusGuard from 0x${GUARD_ADDRESS}

transaction(cid: String) {
    let admin: auth(LazarusGuard.NeuralOracle) &LazarusGuard.OracleAdmin

    prepare(signer: auth(BorrowValue) &Account) {
        self.admin = signer.storage.borrow<auth(LazarusGuard.NeuralOracle) &LazarusGuard.OracleAdmin>(
            from: LazarusGuard.OracleAdminStoragePath
        ) ?? panic("Not the Neural Oracle.")
    }

    execute {
        self.admin.updateIntent(cid: cid)
    }

    post {
        LazarusGuard.lastVerifiedCID == cid:
            "CID was not persisted."
        LazarusGuard.isNeuralPulseValid():
            "Pulse is not valid after update."
    }
}
`;

export async function pushPulseToFlow(cid: string): Promise<string> {
  const txId = await fcl.mutate({
    cadence: UPDATE_PULSE_CDC,
    args: (arg: any, t: any) => [arg(cid, t.String)],
    authorizations: [oracleAuthorization],
    proposer: oracleAuthorization,
    payer: oracleAuthorization,
    limit: 100,
  });

  console.log(`[Flow] UpdatePulse tx submitted: ${txId}`);

  // Wait for the transaction to be sealed (finalized on-chain)
  const sealed = await fcl.tx(txId).onceSealed();
  console.log(`[Flow] UpdatePulse tx sealed in block ${sealed.blockId}`);

  return txId;
}
```

### 5. Query Guard Status (Read-Only)

Use this to check the guard state before the AI agent attempts a transaction.
This is a **script** (read-only, no gas cost).

```typescript
// src/services/guard-status.ts
import { fcl } from "../config/flow";

const GUARD_ADDRESS = process.env.LAZARUS_GUARD_ADDRESS!;

const GET_GUARD_STATUS_CDC = `
import LazarusGuard from 0x${GUARD_ADDRESS}

access(all) fun main(): {String: AnyStruct} {
    return {
        "isValid": LazarusGuard.isNeuralPulseValid(),
        "secondsUntilExpiry": LazarusGuard.secondsUntilExpiry(),
        "lastVerifiedCID": LazarusGuard.lastVerifiedCID,
        "lastPulseTimestamp": LazarusGuard.lastPulseTimestamp,
        "pulseValidityWindow": LazarusGuard.PULSE_VALIDITY_WINDOW
    }
}
`;

export interface GuardStatus {
  isValid: boolean;
  secondsUntilExpiry: number;
  lastVerifiedCID: string;
  lastPulseTimestamp: number;
  pulseValidityWindow: number;
}

export async function getGuardStatus(): Promise<GuardStatus> {
  const result = await fcl.query({ cadence: GET_GUARD_STATUS_CDC });
  return {
    isValid: result.isValid,
    secondsUntilExpiry: parseFloat(result.secondsUntilExpiry),
    lastVerifiedCID: result.lastVerifiedCID,
    lastPulseTimestamp: parseFloat(result.lastPulseTimestamp),
    pulseValidityWindow: parseFloat(result.pulseValidityWindow),
  };
}
```

### 6. Full Endpoint: Approve Intent

This is the endpoint your frontend/human-approval-UI calls.

```typescript
// src/routes/approve.ts (Express example — adapt to your framework)
import { pinNeuralIntent, NeuralIntent } from "../services/lighthouse";
import { pushPulseToFlow } from "../services/flow";
import { getGuardStatus } from "../services/guard-status";
import crypto from "crypto";

// POST /api/approve-intent
export async function approveIntent(req: Request, res: Response) {
  const { agentId, action, params, approvedBy } = req.body;

  // 1. Build the intent payload
  const intent: NeuralIntent = {
    agentId,
    action,
    params,
    approvedBy,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
  };

  // 2. Pin to Filecoin via Lighthouse → get CID
  const cid = await pinNeuralIntent(intent);

  // 3. Push CID to Flow → refresh the 300s window
  const txId = await pushPulseToFlow(cid);

  // 4. Read back the guard status to confirm
  const status = await getGuardStatus();

  // 5. Return everything the caller needs
  return res.json({
    success: true,
    cid,
    flowTxId: txId,
    guardStatus: status,
    message: `Neural pulse active. AI agent has ${Math.floor(status.secondsUntilExpiry)}s to execute.`,
  });
}
```

**That's the entire integration.** One POST endpoint, three steps.

---

## API Surface for the AI Agent

The AI agent does NOT call your backend to transfer tokens. It signs its
own Flow transaction using `AgentTransfer.cdc`. But it needs to know:

| What | How |
|------|-----|
| "Can I transact right now?" | `GET /api/guard-status` → calls `getGuardStatus()` |
| "Execute my transfer" | Agent sends `AgentTransfer.cdc` directly to Flow with its own key |
| "My transaction reverted" | Pulse expired — agent should request a new human approval |

You should expose a simple status endpoint:

```typescript
// GET /api/guard-status
export async function guardStatusEndpoint(req: Request, res: Response) {
  const status = await getGuardStatus();
  return res.json(status);
}
```

The AI agent polls this before submitting transactions. If `isValid` is
`false`, it knows to request approval instead of wasting gas.

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `"Not the Neural Oracle."` | Wrong account signing UpdatePulse | Check `FLOW_PRIVATE_KEY` matches the deployer account |
| `"CID must not be empty."` | Empty string passed to updateIntent | Validate CID before sending |
| `"Neural pulse expired."` | AI agent transacted after 300s window | Call `/api/approve-intent` again |
| Lighthouse upload fails | Bad API key or network issue | Check `LIGHTHOUSE_API_KEY`, retry with backoff |
| FCL `mutate` hangs | Emulator not running or wrong access node | Check `FLOW_ACCESS_NODE` is reachable |

---

## Testnet Deployment

When you're ready to move off the emulator:

```bash
# 1. Generate a fresh key pair for testnet
flow keys generate

# 2. Create a testnet account at https://testnet-faucet.onflow.org
#    Paste the PUBLIC key from step 1.
#    Save the address you receive (e.g., 0x1234abcd5678ef90).

# 3. Add the testnet account to flow.json
flow config add account \
  --name testnet-deployer \
  --network testnet \
  --address <YOUR_TESTNET_ADDRESS> \
  --key <YOUR_PRIVATE_KEY>

# 4. Add the deployment target to flow.json
flow config add deployment \
  --network testnet \
  --account testnet-deployer \
  --contract LazarusGuard

# 5. Deploy
flow project deploy --network=testnet

# 6. Update your .env (already done — these are the live values)
FLOW_ORACLE_ADDRESS=32258b0c4e249730
FLOW_PRIVATE_KEY=<ask the contract deployer for the private key>
FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
LAZARUS_GUARD_ADDRESS=32258b0c4e249730
```

---

## Security Checklist

- [ ] `.env` is in `.gitignore` and never committed
- [ ] `emulator-account.pkey` is in `.gitignore` and never committed
- [ ] Testnet/mainnet private keys are stored in a secret manager (not files)
- [ ] The `FLOW_PRIVATE_KEY` belongs to the same account that deployed LazarusGuard
- [ ] Lighthouse API key is stored in `.env`, not hardcoded
- [ ] The `/api/approve-intent` endpoint has authentication (only authorized humans)
- [ ] Rate limiting is applied to prevent pulse-spam
- [ ] The AI agent's Flow account is separate from the Oracle account

---

## Quick Reference: File Map

```
pl-genesis/
├── .env.example                               ← Copy to .env, fill in values
├── .gitignore                                 ← Excludes .pkey, .env, flowdb/
├── flow.json                                  ← Flow project config (all deps wired)
├── emulator-account.pkey                      ← Emulator-only key (gitignored)
│
├── cadence/
│   ├── contracts/
│   │   └── LazarusGuard.cdc                  ← The smart contract (deployed)
│   ├── transactions/
│   │   ├── UpdatePulse.cdc                   ← YOU call this (via FCL)
│   │   └── AgentTransfer.cdc                 ← AI AGENT calls this (via FCL)
│   └── scripts/
│       └── GetGuardStatus.cdc                ← Read-only guard status query
│
└── imports/                                   ← Auto-generated dependency sources
    └── ...
```

---

## Questions?

If something doesn't work, check in this order:

1. Is the emulator running? (`flow emulator start --service-priv-key <key>`)
2. Is the contract deployed? (`flow project deploy --network=emulator`)
3. Does `flow scripts execute cadence/scripts/GetGuardStatus.cdc` return data?
4. Does your `.env` have the correct `FLOW_PRIVATE_KEY` for the deployer account?
