/**
 * Ping / RTT measurement — adapted from Goliath p2p PING_INTERVAL (~2s).
 * In-process / localhost loop for os-host; WebSocket transport later.
 */

import {
  DEFAULT_BUDGET,
  type BudgetCheck,
  type SyncBudgetConfig,
  type SyncMode,
  type SyncPingV1,
} from "./types.ts";
import { SyncClock } from "./clock.ts";
import { checkBudget, computeSkewMs } from "./budget.ts";
import { recommendMode } from "./governor.ts";

export {
  normalizeSkew,
  checkBudget,
  computeSkewMs,
  DEFAULT_FRAME_MS,
  FRAME_MS_60FPS,
} from "./budget.ts";

/** Goliath p2p uses 2000ms; os-host demo matches that cadence. */
export const PING_INTERVAL_MS = 2000;

export type MeasurePingOptions = {
  clock?: SyncClock;
  /** Injected kernel wall ms (tests / remote reply). Default = clock.wallNow(). */
  tKernel?: number;
  /** Artificial one-way delay ms before kernel stamps (simulates transit). */
  simulatedOneWayMs?: number;
  cpuLoad?: number;
  glitchScore?: number;
  budget?: Partial<SyncBudgetConfig>;
};

export type PingResult = {
  ping: SyncPingV1;
  rttMs: number;
  oneWayMs: number;
  check: BudgetCheck;
  mode: SyncMode;
};

/**
 * Measure one SyncPingV1 sample.
 * In-process: client stamps → optional delay → kernel stamps → client computes RTT.
 */
export function measurePing(opts: MeasurePingOptions = {}): PingResult {
  const clock = opts.clock ?? new SyncClock();
  const budget: SyncBudgetConfig = { ...DEFAULT_BUDGET, ...opts.budget };
  const cpuLoad = clamp01(opts.cpuLoad ?? 0);
  const glitchScore = clamp01(opts.glitchScore ?? 0);

  const tSendMono = clock.now();
  const tClient = clock.wallNow();

  const delay = opts.simulatedOneWayMs ?? 0;
  if (delay > 0) {
    const target = tSendMono + delay;
    while (clock.now() < target) {
      /* spin for tiny test delays only */
    }
  }

  const tKernel = opts.tKernel ?? clock.wallNow();
  const tRecvMono = clock.now();
  const rttMs = Math.max(0, tRecvMono - tSendMono);
  const oneWayMs = rttMs / 2;
  const skewMs = computeSkewMs(tClient, tKernel, rttMs);

  const ping: SyncPingV1 = {
    tClient,
    tKernel,
    skewMs,
    cpuLoad,
    glitchScore,
  };

  const check = checkBudget(skewMs, budget);
  const mode = recommendMode({
    skewMs,
    cpuLoad,
    glitchScore,
    budget,
  });

  return { ping, rttMs, oneWayMs, check: { ...check, mode }, mode };
}

export type PingLoopHandlers = {
  onPing: (result: PingResult) => void;
  onError?: (err: unknown) => void;
};

export type PingLoop = {
  stop: () => void;
  /** Force one immediate sample. */
  tick: () => PingResult;
};

export type CreatePingLoopOptions = MeasurePingOptions & {
  intervalMs?: number;
  /** Optional async kernel stamp provider (localhost / future WS). */
  fetchKernelStamp?: () => Promise<{ tKernel: number; cpuLoad?: number; glitchScore?: number }>;
};

/**
 * Goliath-style ping loop (default every PING_INTERVAL_MS = 2s).
 * In-process by default; pass fetchKernelStamp for localhost HTTP later.
 */
export function createPingLoop(
  handlers: PingLoopHandlers,
  opts: CreatePingLoopOptions = {},
): PingLoop {
  const intervalMs = opts.intervalMs ?? PING_INTERVAL_MS;
  const clock = opts.clock ?? new SyncClock();
  let timer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  const tickSync = (): PingResult => {
    const result = measurePing({ ...opts, clock });
    handlers.onPing(result);
    return result;
  };

  const tickAsync = async (): Promise<void> => {
    try {
      if (opts.fetchKernelStamp) {
        const tSendMono = clock.now();
        const tClient = clock.wallNow();
        const remote = await opts.fetchKernelStamp();
        const tRecvMono = clock.now();
        const rttMs = Math.max(0, tRecvMono - tSendMono);
        const skewMs = computeSkewMs(tClient, remote.tKernel, rttMs);
        const cpuLoad = clamp01(remote.cpuLoad ?? opts.cpuLoad ?? 0);
        const glitchScore = clamp01(remote.glitchScore ?? opts.glitchScore ?? 0);
        const budget: SyncBudgetConfig = { ...DEFAULT_BUDGET, ...opts.budget };
        const ping: SyncPingV1 = {
          tClient,
          tKernel: remote.tKernel,
          skewMs,
          cpuLoad,
          glitchScore,
        };
        const check = checkBudget(skewMs, budget);
        const mode = recommendMode({ skewMs, cpuLoad, glitchScore, budget });
        const result: PingResult = {
          ping,
          rttMs,
          oneWayMs: rttMs / 2,
          check: { ...check, mode },
          mode,
        };
        handlers.onPing(result);
      } else {
        tickSync();
      }
    } catch (err) {
      handlers.onError?.(err);
    }
  };

  timer = setInterval(() => {
    if (stopped) return;
    void tickAsync();
  }, intervalMs);

  void tickAsync();

  return {
    stop: () => {
      stopped = true;
      if (timer) clearInterval(timer);
      timer = null;
    },
    tick: tickSync,
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
