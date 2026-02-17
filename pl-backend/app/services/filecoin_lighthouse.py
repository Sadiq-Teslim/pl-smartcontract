from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import requests

from app.core.config import settings


@dataclass
class LighthouseResult:
    cid: str | None
    status: str
    error: str | None = None


def pin_neural_fingerprint(fingerprint: str) -> LighthouseResult:
    if not settings.lighthouse_api_key:
        return LighthouseResult(cid=None, status="skipped", error="Missing LIGHTHOUSE_API_KEY")

    payload = {"neural_fingerprint": fingerprint}

    tmp_path = Path("./data")
    tmp_path.mkdir(parents=True, exist_ok=True)
    file_path = tmp_path / "neural_fingerprint.json"
    file_path.write_text(json.dumps(payload), encoding="utf-8")

    headers = {"Authorization": f"Bearer {settings.lighthouse_api_key}"}

    with file_path.open("rb") as fh:
        files = {"file": (file_path.name, fh, "application/json")}
        try:
            response = requests.post(
                settings.lighthouse_endpoint,
                headers=headers,
                files=files,
                timeout=30,
            )
        except requests.RequestException as exc:
            return LighthouseResult(cid=None, status="error", error=str(exc))

    if response.status_code >= 400:
        return LighthouseResult(
            cid=None,
            status="error",
            error=f"{response.status_code}: {response.text}",
        )

    try:
        data = response.json()
    except ValueError:
        return LighthouseResult(cid=None, status="error", error="Invalid JSON response")

    cid = data.get("Hash") or data.get("cid") or data.get("Cid")
    if not cid:
        return LighthouseResult(cid=None, status="error", error="CID not found in response")

    return LighthouseResult(cid=cid, status="pinned")
