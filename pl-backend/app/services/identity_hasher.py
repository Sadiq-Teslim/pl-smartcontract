from __future__ import annotations

import hashlib
import numpy as np


def neural_fingerprint(raw_signal: np.ndarray) -> str:
    if raw_signal.dtype != np.float32:
        raw_signal = raw_signal.astype(np.float32)
    payload = raw_signal.tobytes()
    return hashlib.sha256(payload).hexdigest()
