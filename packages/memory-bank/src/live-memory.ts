/** LiveMemory ring — playhead, mix levels, FFT frames, sync pings. IndexedDB-friendly via PersistHooks. */
export type MixLevelSample = { channelId: number; gain: number; peak: number };
export type AuraFftFrame = { hopIndex: number; bins: Float32Array | number[]; atMs: number };
export type SyncPingSample = { rttMs: number; atMs: number };
export type LiveMemorySnapshot = {
  playheadMs: number; mixLevels: MixLevelSample[]; fftFrames: AuraFftFrame[];
  pingSamples: SyncPingSample[]; updatedAt: number;
};
export type PersistHooks<T> = {
  load?: () => Promise<T | null> | T | null;
  save?: (value: T) => Promise<void> | void;
};
export type LiveMemoryOptions = { capacity?: number; persist?: PersistHooks<LiveMemorySnapshot> };

export class LiveMemoryRing {
  readonly capacity: number;
  private playheadMs = 0;
  private mixLevels: MixLevelSample[] = [];
  private fftFrames: AuraFftFrame[] = [];
  private pingSamples: SyncPingSample[] = [];
  private readonly persist?: PersistHooks<LiveMemorySnapshot>;

  constructor(opts: LiveMemoryOptions = {}) {
    this.capacity = opts.capacity ?? 256;
    this.persist = opts.persist;
  }

  setPlayhead(ms: number): void { this.playheadMs = Math.max(0, ms); }
  getPlayhead(): number { return this.playheadMs; }
  pushMixLevels(levels: MixLevelSample[]): void { this.mixLevels = levels.slice(); }

  pushFftFrame(frame: AuraFftFrame): void {
    this.fftFrames.push(frame);
    if (this.fftFrames.length > this.capacity) this.fftFrames.splice(0, this.fftFrames.length - this.capacity);
  }

  pushPing(sample: SyncPingSample): void {
    this.pingSamples.push(sample);
    if (this.pingSamples.length > this.capacity) this.pingSamples.splice(0, this.pingSamples.length - this.capacity);
  }

  latestFft(): AuraFftFrame | null { return this.fftFrames[this.fftFrames.length - 1] ?? null; }

  snapshot(): LiveMemorySnapshot {
    return {
      playheadMs: this.playheadMs,
      mixLevels: this.mixLevels.map((l) => ({ ...l })),
      fftFrames: this.fftFrames.map((f) => ({
        ...f, bins: Array.isArray(f.bins) ? f.bins.slice() : Array.from(f.bins),
      })),
      pingSamples: this.pingSamples.slice(),
      updatedAt: Date.now(),
    };
  }

  hydrate(snap: LiveMemorySnapshot): void {
    this.playheadMs = snap.playheadMs;
    this.mixLevels = snap.mixLevels.slice();
    this.fftFrames = snap.fftFrames.slice(-this.capacity);
    this.pingSamples = snap.pingSamples.slice(-this.capacity);
  }

  async persistNow(): Promise<void> {
    if (!this.persist?.save) return;
    await this.persist.save(this.snapshot());
  }

  async restore(): Promise<boolean> {
    if (!this.persist?.load) return false;
    const snap = await this.persist.load();
    if (!snap) return false;
    this.hydrate(snap);
    return true;
  }
}
