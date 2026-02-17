import time
import hashlib
import json
import random
import numpy as np
from datetime import datetime

# ==========================================
# STAGE 1: THE BRAIN (Edge Node)
# ==========================================

class NeuralIngest:
    def __init__(self, device_id="BCI-HEADSET-X9"):
        self.device_id = device_id
        # Bandpass Filter settings (1-50Hz)
        self.fs = 256  # Sampling rate
        self.lowcut = 1.0
        self.highcut = 50.0
        print(f"[INIT] Connecting to {self.device_id}...")
        print("[INIT] Configuring Bandpass Filter (1-50Hz)...")
        time.sleep(1)
        print("[READY] Neuro-Link Established. Awaiting Signal...")

    def acquire_signal(self):
        """
        Simulate acquiring raw EEG data from WebHID/Bluetooth.
        In production, this hooks into `pyEDFlib` or similar SDKs.
        """
        # Simulate 1 second of EEG data (256 samples)
        # Adding some "alpha" (10Hz) and "beta" (20Hz) waves
        t = np.linspace(0, 1.0, self.fs)
        
        # Alpha Wave (8-12Hz) - Relaxed
        alpha_power = random.uniform(0.5, 2.0)
        signal = alpha_power * np.sin(2 * np.pi * 10 * t)
        
        # Beta Wave (13-30Hz) - Focus
        # We simulate a "Focus Spike" occasionally
        is_focused = random.random() > 0.7
        beta_power = 3.0 if is_focused else 0.5
        signal += beta_power * np.sin(2 * np.pi * 22 * t)
        
        # Noise
        signal += np.random.normal(0, 0.5, size=t.shape)
        
        return signal, is_focused

    def process_signal(self, raw_signal):
        """
        Digital Signal Processing (DSP) Pipeline
        1. FFT (Fast Fourier Transform)
        2. Feature Extraction (Alpha/Beta Power)
        """
        # Perform FFT
        fft_vals = np.fft.rfft(raw_signal)
        fft_freq = np.fft.rfftfreq(len(raw_signal), 1.0/self.fs)
        
        # Extract Band Power
        alpha_idx = np.where((fft_freq >= 8) & (fft_freq <= 12))[0]
        beta_idx = np.where((fft_freq >= 13) & (fft_freq <= 30))[0]
        
        alpha_power = np.mean(np.abs(fft_vals[alpha_idx]))
        beta_power = np.mean(np.abs(fft_vals[beta_idx]))
        
        peak_freq = fft_freq[np.argmax(np.abs(fft_vals))]
        
        return {
            "alpha": float(alpha_power),
            "beta": float(beta_power),
            "peak_freq": float(peak_freq)
        }

    def create_neural_hash(self, features):
        """
        THE PRIVACY LAYER:
        NeuralHash = SHA-256(PeakFreq + Timestamp + DeviceID)
        Raw data is discarded.
        """
        timestamp = datetime.now().isoformat()
        
        # The Privacy Payload
        payload = f"{features['peak_freq']:.4f}|{timestamp}|{self.device_id}"
        
        # SHA-256 Hashing
        neural_hash = hashlib.sha256(payload.encode()).hexdigest()
        
        return neural_hash, timestamp

    def run(self):
        try:
            while True:
                # 1. Ingest
                raw_signal, is_focused = self.acquire_signal()
                
                # 2. Process (DSP)
                features = self.process_signal(raw_signal)
                
                # 3. Hash (Privacy)
                neural_hash, timestamp = self.create_neural_hash(features)
                
                print(f"\n[DSP] Alpha: {features['alpha']:.2f} | Beta: {features['beta']:.2f} | Peak: {features['peak_freq']:.1f}Hz")
                
                if is_focused:
                    print(f"--> [FOCUS DETECTED] Creating Secure Anchor...")
                    print(f"--> [HASH] {neural_hash}")
                    # In a real scenario, this POSTs to the Next.js API route
                    print(f"--> [PUSH] Uploading to Lighthouse/Filecoin...")
                    time.sleep(2) # Simulating network latency
                
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n[STOP] Ingest Halted.")

if __name__ == "__main__":
    node = NeuralIngest()
    node.run()
