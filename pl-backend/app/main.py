from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.services.filecoin_lighthouse import pin_neural_fingerprint
from app.services.flow_bridge import (
    push_update_pulse,
    get_guard_status as fetch_guard_status,
)
from app.services.identity_hasher import neural_fingerprint
from app.services.neural_simulator import NeuralPulseSimulator
from app.services.state_store import IntentRecord, IntentStore

app = FastAPI(title="Biological-to-Digital Bridge", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulator = NeuralPulseSimulator()
store = IntentStore()


class IntentRequest(BaseModel):
    intent_spike: bool = Field(default=True, description="Simulate intent spike")


class IntentResponse(BaseModel):
    neural_state: dict
    fingerprint: str
    cid: str | None
    pin_status: str
    pin_error: str | None
    flow_tx_id: str | None = None
    flow_tx_status: str | None = None
    flow_tx_error: str | None = None


class GuardStatusResponse(BaseModel):
    is_valid: bool
    seconds_until_expiry: float
    last_verified_cid: str
    last_pulse_timestamp: float
    pulse_validity_window: float


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/intent", response_model=IntentResponse)
def create_intent(payload: IntentRequest) -> IntentResponse:
    neural_state = simulator.generate(intent_spike=payload.intent_spike)
    fingerprint = neural_fingerprint(neural_state.raw)

    # Step 1: Pin to Filecoin via Lighthouse
    pin_result = pin_neural_fingerprint(fingerprint)

    # Step 2: Push CID on-chain via UpdatePulse (if pinning succeeded)
    flow_tx_id = None
    flow_tx_status = None
    flow_tx_error = None

    if pin_result.cid:
        flow_result = push_update_pulse(pin_result.cid)
        flow_tx_id = flow_result.tx_id
        flow_tx_status = flow_result.status
        flow_tx_error = flow_result.error

    record = IntentRecord(
        neural_state=neural_state.to_serializable(),
        fingerprint=fingerprint,
        cid=pin_result.cid,
        pin_status=pin_result.status,
        pin_error=pin_result.error,
        flow_tx_id=flow_tx_id,
        flow_tx_status=flow_tx_status,
        flow_tx_error=flow_tx_error,
    )
    store.save(record)

    return IntentResponse(**record.to_dict())


@app.get("/guard-status", response_model=GuardStatusResponse)
def guard_status() -> GuardStatusResponse:
    status = fetch_guard_status()
    return GuardStatusResponse(
        is_valid=status.is_valid,
        seconds_until_expiry=status.seconds_until_expiry,
        last_verified_cid=status.last_verified_cid,
        last_pulse_timestamp=status.last_pulse_timestamp,
        pulse_validity_window=status.pulse_validity_window,
    )


@app.get("/latest-intent", response_model=IntentResponse)
def latest_intent() -> IntentResponse:
    record = store.get_latest()
    if not record:
        raise HTTPException(status_code=404, detail="No intent recorded yet")
    return IntentResponse(**record.to_dict())
