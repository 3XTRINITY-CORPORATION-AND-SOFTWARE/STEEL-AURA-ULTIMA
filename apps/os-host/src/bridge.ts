/**
 * Thin OS host sync bridge — start/stop ping loop + last SyncPingV1.
 */

import {
  SyncClock,
  createPingLoop,
  PING_INTERVAL_MS,
  type PingLoop,
  type PingResult,
  type SyncPingV1,
  type SyncMode,
} from "../../../packages/sync-kernel/src/index.ts";

export type HostSyncState = {
  lastPing: SyncPingV1 | null;
  lastResult: PingResult | null;
  mode: SyncMode;
  ticks: number;
  running: boolean;
};

export type HostSyncOptions = {
  intervalMs?: number;
  cpuLoad?: number;
  glitchScore?: number;
  onPing?: (result: PingResult, ticks: number) => void;
};

let clock: SyncClock | null = null;
let loop: PingLoop | null = null;
let state: HostSyncState = {
  lastPing: null,
  lastResult: null,
  mode: "aligned",
  ticks: 0,
  running: false,
};

export function getLastPing(): SyncPingV1 | null {
  return state.lastPing;
}

export function getHostSyncState(): HostSyncState {
  return { ...state };
}

export function startHostSync(opts: HostSyncOptions = {}): HostSyncState {
  if (loop) stopHostSync();

  clock = new SyncClock();
  state = {
    lastPing: null,
    lastResult: null,
    mode: "aligned",
    ticks: 0,
    running: true,
  };

  loop = createPingLoop(
    {
      onPing: (result) => {
        const ticks = clock?.ticks() ?? 0;
        state = {
          lastPing: result.ping,
          lastResult: result,
          mode: result.mode,
          ticks,
          running: true,
        };
        opts.onPing?.(result, ticks);
      },
    },
    {
      clock,
      intervalMs: opts.intervalMs ?? PING_INTERVAL_MS,
      cpuLoad: opts.cpuLoad ?? sampleCpuHint(),
      glitchScore: opts.glitchScore ?? 0,
    },
  );

  return getHostSyncState();
}

export function stopHostSync(): void {
  loop?.stop();
  loop = null;
  state = { ...state, running: false };
}

/** Lightweight load hint (0..1) — placeholder until real OS metering. */
function sampleCpuHint(): number {
  return 0.05;
}

export { PING_INTERVAL_MS, SyncClock };
