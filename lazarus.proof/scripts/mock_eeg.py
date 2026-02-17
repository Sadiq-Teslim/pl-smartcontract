import time
import hashlib
import random
import json
from datetime import datetime

def generate_eeg_signal():
    """But we can't really read brainwaves, so we math."""
    # Simulate Alpha, Beta, Delta, Theta waves
    alpha = random.uniform(8, 12)
    beta = random.uniform(12, 30)
    delta = random.uniform(0.5, 4)
    theta = random.uniform(4, 8)
    
    # "Focus" metric
    focus_score = (beta * 2 + alpha) / (delta + theta)
    return {
        "timestamp": datetime.now().isoformat(),
        "signals": {
            "alpha": alpha,
            "beta": beta,
            "delta": delta,
            "theta": theta
        },
        "focus_score": focus_score
    }

def main():
    print("Initializing BCI Bridge...")
    time.sleep(1)
    print("Neuro-Link Established. Listening for INTENT...")
    
    try:
        while True:
            signal = generate_eeg_signal()
            
            # Threshold for "Active Intent"
            if signal["focus_score"] > 3.5:
                # Generate Neural Hash
                payload = json.dumps(signal, sort_keys=True).encode()
                neural_hash = hashlib.sha256(payload).hexdigest()
                
                print(f"\n[DETECTED] Intent Spike: {signal['focus_score']:.2f}")
                print(f"[HASH] {neural_hash}")
                print(f"[ACTION] Anchoring to Filecoin...")
                
                # In a real app, this would trigger the Lighthouse upload
                time.sleep(2) 
            
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n[DISCONNECT] Neural Link Terminated.")

if __name__ == "__main__":
    main()
