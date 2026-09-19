/** PingClock — EWMA RTT sampler (250–500ms cadence). */
export type PingSample = { sentAt: number; rttMs: number };
export type PingClockOptions = { alpha?: number; intervalMs?: number };

export class PingClock {
  readonly alpha: number;
  readonly intervalMs: number;
  private ewmaMs: number | null = null;
  private lastSample: PingSample | null = null;
  private sampleCount = 0;
  private _skewMs = 0;

  constructor(opts: PingClockOptions = {}) {
    this.alpha = opts.alpha ?? 0.2;
    this.intervalMs = opts.intervalMs ?? 350;
  }

  recordRtt(rttMs: number, sentAt: number = Date.now()): PingSample {
    if (!Number.isFinite(rttMs) || rttMs < 0) throw new Error(`invalid rttMs=${rttMs}`);
    const sample: PingSample = { sentAt, rttMs };
    this.lastSample = sample;
    this.sampleCount += 1;
    this.ewmaMs = this.ewmaMs === null ? rttMs : this.alpha * rttMs + (1 - this.alpha) * this.ewmaMs;
    return sample;
  }

  completeRoundTrip(sentAt: number, receivedAt: number = Date.now()): PingSample {
    return this.recordRtt(Math.max(0, receivedAt - sentAt), sentAt);
  }

  get ewmaRttMs(): number | null { return this.ewmaMs; }
  get last(): PingSample | null { return this.lastSample; }
  get count(): number { return this.sampleCount; }

  compensationSeconds(): number {
    return this.ewmaMs === null ? 0 : this.ewmaMs / 2000;
  }

  setSkewMs(skewMs: number): void { this._skewMs = skewMs; }
  measuredSkewMs(): number { return this._skewMs; }

  reset(): void {
    this.ewmaMs = null;
    this.lastSample = null;
    this.sampleCount = 0;
    this._skewMs = 0;
  }
}
