/**
 * SyncPingV1 — web-host UI ↔ OS/phone kernel sync sample.
 * @see contracts/SYNC.md, docs/contracts/sync-budget.v1.md, docs/NORTH-STAR.md §3
 */

/** Wall / audio-surface timestamps are milliseconds since Unix epoch (ms epoch). */
export type SyncPingV1 = {
  /** Client send stamp (ms epoch). */
  tClient: number;
  /** Kernel reply stamp (ms epoch). */
  tKernel: number;
  /**
   * Skew after RTT/2 one-way estimate:
   *   oneWayMs = rttMs / 2
   *   skewMs = tKernel - (tClient + oneWayMs)
   * Positive ⇒ kernel clock ahead of client-compensated timeline.
   */
  skewMs: number;
  /** 0..1 instantaneous / EWMA CPU load hint. */
  cpuLoad: number;
  /** 0..1 dropouts / underruns window score. */
  glitchScore: number;
};

/** UI alignment mode. On breach UI degrades; kernel remains audio SoT. */
export type SyncMode = "aligned" | "safe_viz";

export type SyncBudgetConfig = {
  /** Frame duration used to normalize skew. Default 1000 → ±200ms hard ceiling. */
  frameMs: number;
  /** Max |normalizedSkew| allowed. Spec: 0.2 */
  maxNormalizedSkew: number;
  /** Soft CPU load threshold for safe_viz (default 0.85). */
  cpuSoftLimit: number;
  /** Soft glitch score threshold for safe_viz (default 0.5). */
  glitchSoftLimit: number;
};

export const DEFAULT_FRAME_MS = 1000;
/** ~60fps frame helper — export for sub-frame budgets when AudioContext allows. */
export const FRAME_MS_60FPS = 1000 / 60;

export const DEFAULT_BUDGET: SyncBudgetConfig = {
  frameMs: DEFAULT_FRAME_MS,
  maxNormalizedSkew: 0.2,
  cpuSoftLimit: 0.85,
  glitchSoftLimit: 0.5,
};

export type BudgetCheck = {
  skewMs: number;
  normalizedSkew: number;
  withinBudget: boolean;
  mode: SyncMode;
};
