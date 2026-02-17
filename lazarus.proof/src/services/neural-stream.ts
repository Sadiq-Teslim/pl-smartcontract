import { Observable, interval, map, share } from 'rxjs';
import { useNeuralStore } from '@/store/neural-store';

// Types
export interface RawEEG {
    alpha: number;
    beta: number;
    delta: number;
    theta: number;
    timestamp: number;
}

class NeuralStreamService {
    private stream$: Observable<RawEEG>;

    constructor() {
        // 60Hz Data Stream Simulation (16ms interval)
        this.stream$ = interval(16).pipe(
            map(() => this.generateSyntheticSignal()),
            share()
        );
    }

    private generateSyntheticSignal(): RawEEG {
        const time = Date.now() / 1000;

        // Perlin-like noise simulation using sine layering
        return {
            alpha: Math.abs(Math.sin(time * 2) * 10 + Math.random() * 5),     // Relaxed
            beta: Math.abs(Math.sin(time * 8) * 20 + Math.random() * 10),     // Active/Focus
            delta: Math.abs(Math.sin(time * 0.5) * 40 + Math.random() * 5),   // Deep Sleep
            theta: Math.abs(Math.sin(time * 4) * 15 + Math.random() * 5),     // Drowsy/Flow
            timestamp: Date.now()
        };
    }

    public connect() {
        console.log("[NEURAL] Stream Connected via WebWorker Bridge");
        const updateSignal = useNeuralStore.getState().updateSignal;

        // Subscribe and pump data into the store
        const subscription = this.stream$.subscribe(signal => {
            updateSignal(signal);
        });

        return subscription;
    }
}

export const neuralStream = new NeuralStreamService();
