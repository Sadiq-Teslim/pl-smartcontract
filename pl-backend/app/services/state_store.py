from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.core.config import settings


@dataclass
class IntentRecord:
    neural_state: dict
    fingerprint: str
    cid: str | None
    pin_status: str
    pin_error: str | None
    flow_tx_id: str | None = None
    flow_tx_status: str | None = None
    flow_tx_error: str | None = None

    def to_dict(self) -> dict:
        return {
            "neural_state": self.neural_state,
            "fingerprint": self.fingerprint,
            "cid": self.cid,
            "pin_status": self.pin_status,
            "pin_error": self.pin_error,
            "flow_tx_id": self.flow_tx_id,
            "flow_tx_status": self.flow_tx_status,
            "flow_tx_error": self.flow_tx_error,
        }


class IntentStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or settings.intent_storage_path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._cache: IntentRecord | None = None
        self._load_if_exists()

    def _load_if_exists(self) -> None:
        if not self.path.exists():
            return
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return
        self._cache = IntentRecord(
            neural_state=payload.get("neural_state", {}),
            fingerprint=payload.get("fingerprint", ""),
            cid=payload.get("cid"),
            pin_status=payload.get("pin_status", "unknown"),
            pin_error=payload.get("pin_error"),
            flow_tx_id=payload.get("flow_tx_id"),
            flow_tx_status=payload.get("flow_tx_status"),
            flow_tx_error=payload.get("flow_tx_error"),
        )

    def get_latest(self) -> IntentRecord | None:
        return self._cache

    def save(self, record: IntentRecord) -> None:
        self._cache = record
        self.path.write_text(json.dumps(record.to_dict(), indent=2), encoding="utf-8")
