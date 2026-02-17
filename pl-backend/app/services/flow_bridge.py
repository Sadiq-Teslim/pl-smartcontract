"""Flow blockchain bridge using the REST API directly.

Sends UpdatePulse transactions and queries GetGuardStatus via
https://rest-testnet.onflow.org — no Flow CLI or gRPC needed.
"""
from __future__ import annotations

import base64
import hashlib
import json
from dataclasses import dataclass

import ecdsa
import requests
import rlp

from app.core.config import settings

FLOW_REST = settings.flow_access_node.rstrip("/")
GUARD_ADDRESS = settings.lazarus_guard_address
ORACLE_ADDRESS = settings.flow_oracle_address


@dataclass
class FlowTxResult:
    tx_id: str | None
    status: str
    error: str | None = None


@dataclass
class GuardStatus:
    is_valid: bool
    seconds_until_expiry: float
    last_verified_cid: str
    last_pulse_timestamp: float
    pulse_validity_window: float


# ── Cadence templates ──────────────────────────────────────────────────

UPDATE_PULSE_CDC = f"""\
import LazarusGuard from 0x{GUARD_ADDRESS}

transaction(cid: String) {{
    let admin: auth(LazarusGuard.NeuralOracle) &LazarusGuard.OracleAdmin

    prepare(signer: auth(BorrowValue) &Account) {{
        self.admin = signer.storage.borrow<auth(LazarusGuard.NeuralOracle) &LazarusGuard.OracleAdmin>(
            from: LazarusGuard.OracleAdminStoragePath
        ) ?? panic("Could not borrow OracleAdmin resource.")
    }}

    execute {{
        self.admin.updateIntent(cid: cid)
    }}
}}
"""

GET_GUARD_STATUS_CDC = f"""\
import LazarusGuard from 0x{GUARD_ADDRESS}

access(all) fun main(): {{String: AnyStruct}} {{
    return {{
        "isValid": LazarusGuard.isNeuralPulseValid(),
        "secondsUntilExpiry": LazarusGuard.secondsUntilExpiry(),
        "lastVerifiedCID": LazarusGuard.lastVerifiedCID,
        "lastPulseTimestamp": LazarusGuard.lastPulseTimestamp,
        "pulseValidityWindow": LazarusGuard.PULSE_VALIDITY_WINDOW
    }}
}}
"""


# ── Script execution (read-only) ──────────────────────────────────────

def get_guard_status() -> GuardStatus:
    """Execute GetGuardStatus script via REST API."""
    defaults = GuardStatus(
        is_valid=False,
        seconds_until_expiry=0.0,
        last_verified_cid="",
        last_pulse_timestamp=0.0,
        pulse_validity_window=300.0,
    )

    try:
        b64_script = base64.b64encode(GET_GUARD_STATUS_CDC.encode()).decode()
        resp = requests.post(
            f"{FLOW_REST}/v1/scripts",
            json={"script": b64_script},
            timeout=15,
        )
        if resp.status_code != 200:
            return defaults

        # Response is a base64-encoded JSON-Cadence value
        raw = resp.json()
        if isinstance(raw, str):
            decoded = base64.b64decode(raw).decode()
        else:
            decoded = json.dumps(raw)

        data = json.loads(decoded)
        return _parse_cadence_dict(data)
    except Exception as exc:
        print(f"[FLOW] Guard status query failed: {exc}")
        return defaults


def _parse_cadence_dict(data: dict) -> GuardStatus:
    """Parse JSON-Cadence Dictionary into GuardStatus."""
    values = {}
    for entry in data.get("value", []):
        key = entry["key"]["value"]
        val = entry["value"]
        if val["type"] == "Bool":
            values[key] = val["value"]
        elif val["type"] == "UFix64":
            values[key] = float(val["value"])
        elif val["type"] == "String":
            values[key] = val["value"]

    return GuardStatus(
        is_valid=bool(values.get("isValid", False)),
        seconds_until_expiry=float(values.get("secondsUntilExpiry", 0)),
        last_verified_cid=str(values.get("lastVerifiedCID", "")),
        last_pulse_timestamp=float(values.get("lastPulseTimestamp", 0)),
        pulse_validity_window=float(values.get("pulseValidityWindow", 300)),
    )


# ── Transaction sending ───────────────────────────────────────────────

def push_update_pulse(cid: str) -> FlowTxResult:
    """Build, sign, and send an UpdatePulse transaction via REST API."""
    if not settings.flow_private_key:
        return FlowTxResult(tx_id=None, status="skipped", error="Missing FLOW_PRIVATE_KEY")

    try:
        # 1. Get account info (sequence number + key index)
        acct = _get_account(ORACLE_ADDRESS)
        if not acct:
            return FlowTxResult(tx_id=None, status="error", error="Failed to fetch account info")

        seq_number = int(acct["keys"][0]["sequence_number"])
        key_index = int(acct["keys"][0]["index"])

        # 2. Get latest block reference
        block_id = _get_latest_block_id()
        if not block_id:
            return FlowTxResult(tx_id=None, status="error", error="Failed to fetch latest block")

        # 3. Build the transaction arguments (JSON-Cadence)
        arguments = [
            base64.b64encode(json.dumps({"type": "String", "value": cid}).encode()).decode()
        ]

        # 4. Build the transaction payload
        script_b64 = base64.b64encode(UPDATE_PULSE_CDC.encode()).decode()
        tx_body = {
            "script": script_b64,
            "arguments": arguments,
            "reference_block_id": block_id,
            "gas_limit": "1000",
            "payer": ORACLE_ADDRESS,
            "proposal_key": {
                "address": ORACLE_ADDRESS,
                "key_index": str(key_index),
                "sequence_number": str(seq_number),
            },
            "authorizers": [ORACLE_ADDRESS],
            "envelope_signatures": [],
            "payload_signatures": [],
        }

        # 5. Sign the transaction
        envelope_sig = _sign_transaction(tx_body, settings.flow_private_key)
        tx_body["envelope_signatures"] = [
            {
                "address": ORACLE_ADDRESS,
                "key_index": str(key_index),
                "signature": base64.b64encode(envelope_sig).decode(),
            }
        ]

        # 6. Send the transaction
        resp = requests.post(
            f"{FLOW_REST}/v1/transactions",
            json=tx_body,
            timeout=30,
        )

        if resp.status_code not in (200, 201):
            return FlowTxResult(
                tx_id=None,
                status="error",
                error=f"REST API {resp.status_code}: {resp.text[:500]}",
            )

        result = resp.json()
        tx_id = result.get("id")

        # 7. Wait for transaction to seal
        if tx_id:
            _wait_for_seal(tx_id)

        return FlowTxResult(tx_id=tx_id, status="sealed")

    except Exception as exc:
        return FlowTxResult(tx_id=None, status="error", error=str(exc))


def _get_account(address: str) -> dict | None:
    """Fetch account info from Flow REST API."""
    try:
        resp = requests.get(f"{FLOW_REST}/v1/accounts/{address}?expand=keys", timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return None


def _get_latest_block_id() -> str | None:
    """Get the latest sealed block ID."""
    try:
        resp = requests.get(f"{FLOW_REST}/v1/blocks?height=sealed", timeout=10)
        if resp.status_code == 200:
            blocks = resp.json()
            return blocks[0]["header"]["id"]
    except Exception:
        pass
    return None


def _wait_for_seal(tx_id: str, max_attempts: int = 30) -> None:
    """Poll transaction result until sealed or timeout."""
    import time
    for _ in range(max_attempts):
        try:
            resp = requests.get(f"{FLOW_REST}/v1/transaction_results/{tx_id}", timeout=10)
            if resp.status_code == 200:
                result = resp.json()
                if result.get("status") == "Sealed":
                    return
        except Exception:
            pass
        time.sleep(2)


# ── Transaction signing ───────────────────────────────────────────────

def _sign_transaction(tx_body: dict, private_key_hex: str) -> bytes:
    """Sign a Flow transaction envelope with ECDSA_P256 + SHA3-256.

    Flow signing process:
    1. RLP-encode the transaction envelope
    2. Hash with SHA3-256 using the "FLOW-V0.0-transaction" domain tag
    3. Sign with ECDSA_P256
    """
    envelope_message = _build_envelope_message(tx_body)

    # Domain tag: "FLOW-V0.0-transaction" padded to 32 bytes
    domain_tag = b"FLOW-V0.0-transaction" + b"\x00" * (32 - len("FLOW-V0.0-transaction"))

    # SHA3-256 hash of domain_tag + RLP-encoded envelope
    # (must match the hashing_algorithm registered on the account key)
    hasher = hashlib.sha3_256()
    hasher.update(domain_tag)
    hasher.update(envelope_message)
    message_hash = hasher.digest()

    # Sign with ECDSA_P256
    sk = ecdsa.SigningKey.from_string(
        bytes.fromhex(private_key_hex),
        curve=ecdsa.NIST256p,
    )
    signature = sk.sign_digest(message_hash, sigencode=ecdsa.util.sigencode_string)
    return signature


def _build_envelope_message(tx_body: dict) -> bytes:
    """RLP-encode the transaction envelope for signing.

    Flow transaction payload structure:
    [script, arguments, reference_block_id, gas_limit,
     proposal_address, proposal_key_index, proposal_seq_number,
     payer, authorizers]

    Envelope = [payload, payload_signatures]
    """
    script = base64.b64decode(tx_body["script"])
    arguments = [base64.b64decode(a) for a in tx_body["arguments"]]
    ref_block_id = bytes.fromhex(tx_body["reference_block_id"])
    gas_limit = int(tx_body["gas_limit"])
    proposal_address = bytes.fromhex(tx_body["proposal_key"]["address"])
    proposal_key_index = int(tx_body["proposal_key"]["key_index"])
    proposal_seq_number = int(tx_body["proposal_key"]["sequence_number"])
    payer = bytes.fromhex(tx_body["payer"])
    authorizers = [bytes.fromhex(a) for a in tx_body["authorizers"]]

    # Payload as a nested list — NOT pre-encoded RLP bytes.
    # Flow's Go SDK and FCL-JS both build the envelope as:
    #   RLP([ [payload_fields...], [payload_signatures...] ])
    # where the payload is a nested list, not a pre-encoded byte string.
    payload = [
        script,
        arguments,
        ref_block_id,
        gas_limit,
        proposal_address,
        proposal_key_index,
        proposal_seq_number,
        payer,
        authorizers,
    ]

    # Envelope = RLP([payload_fields, []])  (empty payload_signatures for single-signer)
    envelope = rlp.encode([payload, []])
    return envelope
