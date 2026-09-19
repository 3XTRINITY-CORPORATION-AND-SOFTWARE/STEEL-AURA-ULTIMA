/**
 * SyncClock — Goliath/ether-kernel inspired monotonic tick + wall dual clock.
 * Ether kernel exposes `ticks` + uptime syscall (SYS.uptime = 14); we adapt that
 * as an in-process monotonic tick counter with performance.now() / Date.now().
 */

export type SyncClockSnapshot = {
  /** Monotonic milliseconds since clock construction (performance.now based). */
  monoMs: number;
  /** Wall clock ms epoch (Date.now). */
  wallMs: number;
  /** Integer tick count (Goliath-style uptime ticks). */
  ticks: number;
  /** Uptime ms alias of monoMs (ether uptime idea). */
  uptimeMs: number;
};

export type SyncClockOptions = {
  /** Tick period in ms. Default 1 (1 tick ≈ 1ms). */
  tickMs?: number;
};

/**
 * Dual clock: wall (Date.now) for SyncPingV1 stamps + monotonic (performance.now)
 * for RTT / interval measurement. Tick counter mirrors ether-kernel uptime ticks.
 */
export class SyncClock {
  readonly tickMs: number;
  private readonly originMono: number;
  private readonly originWall: number;
  private _ticks = 0;

  constructor(opts: SyncClockOptions = {}) {
    this.tickMs = opts.tickMs ?? 1;
    this.originMono = this.perfNow();
    this.originWall = Date.now();
  }

  private perfNow(): number {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }

  /** Monotonic now (ms since construct). Prefer for RTT. */
  now(): number {
    return this.perfNow() - this.originMono;
  }

  /** Wall ms epoch — declare as SyncPingV1 tClient / tKernel unit. */
  wallNow(): number {
    return Date.now();
  }

  /** Advance / read Goliath-style tick counter from monotonic uptime. */
  ticks(): number {
    this._ticks = Math.floor(this.now() / this.tickMs);
    return this._ticks;
  }

  /** Ether-style uptime in ms. */
  uptime(): number {
    return this.now();
  }

  snapshot(): SyncClockSnapshot {
    const monoMs = this.now();
    return {
      monoMs,
      wallMs: this.wallNow(),
      ticks: Math.floor(monoMs / this.tickMs),
      uptimeMs: monoMs,
    };
  }

  /** Wall origin at construct (for diagnostics). */
  get originWallMs(): number {
    return this.originWall;
  }
}
