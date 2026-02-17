from __future__ import annotations

import time
from dataclasses import dataclass

import numpy as np


@dataclass
class NeuralState:
    timestamp: float
    sample_rate_hz: int
    duration_sec: int
    alpha: np.ndarray
    beta: np.ndarray
    raw: np.ndarray

    def to_serializable(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "sample_rate_hz": self.sample_rate_hz,
            "duration_sec": self.duration_sec,
            "alpha": self.alpha.tolist(),
            "beta": self.beta.tolist(),
            "raw": self.raw.tolist(),
        }


class NeuralPulseSimulator:
    def __init__(self, sample_rate_hz: int = 256, duration_sec: int = 3) -> None:
        self.sample_rate_hz = sample_rate_hz
        self.duration_sec = duration_sec

    def generate(self, intent_spike: bool = False) -> NeuralState:
        t = np.linspace(0, self.duration_sec, self.sample_rate_hz * self.duration_sec)

        alpha_wave = 0.6 * np.sin(2 * np.pi * 10 * t)
        beta_wave = 0.4 * np.sin(2 * np.pi * 20 * t)

        noise = 0.1 * np.random.randn(len(t))

        if intent_spike:
            spike_center = int(len(t) * 0.5)
            spike_width = int(len(t) * 0.05)
            spike = np.zeros_like(t)
            spike_start = max(spike_center - spike_width, 0)
            spike_end = min(spike_center + spike_width, len(t))
            spike[spike_start:spike_end] = 1.2
            beta_wave = beta_wave + spike

        raw = alpha_wave + beta_wave + noise

        return NeuralState(
            timestamp=time.time(),
            sample_rate_hz=self.sample_rate_hz,
            duration_sec=self.duration_sec,
            alpha=alpha_wave.astype(np.float32),
            beta=beta_wave.astype(np.float32),
            raw=raw.astype(np.float32),
        )
