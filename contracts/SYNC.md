# Sync contract — web ↔ OS/phone kernel

## Goal
Minimize glitch + CPU overload while keeping **skew ≤ ±0.2s** (200ms) between web-host UI clock and OS/PC or phone kernel audio clock.

## Mechanisms
1. **Ping** — bidirectional RTT sample every 250–500ms; EWMA latency
2. **Master clock** — AudioContext / OS audio device time is master on OS; web follows with delay compensation
3. **Combine** — UI schedules on compensated timeline; kernel executes; drop/merge frames if CPU > soft limit
4. **CPU governor** — if load high, reduce viz FFT size / channel meters before dropping audio

## Acceptance
- Simultaneous play of ≥10 channels on OS without audible glitch under nominal load
- Measured skew p95 ≤ 200ms in lab harness
