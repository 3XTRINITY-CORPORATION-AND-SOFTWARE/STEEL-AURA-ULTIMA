/**
 * MixEngine — ≥10 realtime channels, simultaneous play for OS host,
 * mute/solo/gain + master.
 *
 * SyncBudget: schedule against ±200ms from @steel-aura/sync-kernel;
 * OS host is master clock — web UI follows with PingClock compensation.
 */
import { SYNC_BUDGET_MS, withinBudget, compensationDelayMs, type SyncPing } from '@steel-aura/sync-kernel';

export const MIN_CHANNELS = 10;

export type ChannelState = {
  id: number; name: string; gain: number; mute: boolean; solo: boolean; playing: boolean; peak: number;
};

export type MixEngineOptions = {
  channelCount?: number; masterGain?: number; sync?: SyncPing | null; syncBudgetMs?: number;
};

export class MixEngine {
  readonly channelCount: number;
  private channels: ChannelState[];
  private masterGain: number;
  private transportPlaying = false;
  private sync: SyncPing | null;
  private readonly syncBudgetMs: number;

  constructor(opts: MixEngineOptions = {}) {
    this.channelCount = Math.max(MIN_CHANNELS, opts.channelCount ?? MIN_CHANNELS);
    this.masterGain = opts.masterGain ?? 1;
    this.sync = opts.sync ?? null;
    this.syncBudgetMs = opts.syncBudgetMs ?? SYNC_BUDGET_MS;
    this.channels = Array.from({ length: this.channelCount }, (_, i) => ({
      id: i, name: `Ch ${i + 1}`, gain: 0.8, mute: false, solo: false, playing: false, peak: 0,
    }));
  }

  getChannels(): readonly ChannelState[] { return this.channels; }

  getChannel(id: number): ChannelState {
    const ch = this.channels[id];
    if (!ch) throw new Error(`channel ${id} out of range`);
    return ch;
  }

  setGain(id: number, gain: number): void { this.getChannel(id).gain = clamp01(gain); }
  setMute(id: number, mute: boolean): void { this.getChannel(id).mute = mute; }
  setSolo(id: number, solo: boolean): void { this.getChannel(id).solo = solo; }
  setMasterGain(gain: number): void { this.masterGain = clamp01(gain); }
  getMasterGain(): number { return this.masterGain; }
  setSync(sync: SyncPing | null): void { this.sync = sync; }

  /** Simultaneous play flags for OS host. */
  playSimultaneous(channelIds?: number[]): { ok: boolean; reason?: string; compensationMs: number | null } {
    const skew = this.sync?.measuredSkewMs() ?? null;
    if (skew !== null && !withinBudget(skew, this.syncBudgetMs)) {
      return { ok: false, reason: `skew ${skew}ms outside ±${this.syncBudgetMs}ms`, compensationMs: null };
    }
    const comp = skew !== null ? compensationDelayMs(skew, this.syncBudgetMs) : 0;
    const ids = channelIds ?? this.channels.map((c) => c.id);
    for (const id of ids) this.getChannel(id).playing = true;
    this.transportPlaying = true;
    return { ok: true, compensationMs: comp };
  }

  stopAll(): void {
    for (const ch of this.channels) ch.playing = false;
    this.transportPlaying = false;
  }

  isTransportPlaying(): boolean { return this.transportPlaying; }

  effectiveGain(id: number): number {
    const ch = this.getChannel(id);
    if (ch.mute) return 0;
    const anySolo = this.channels.some((c) => c.solo);
    if (anySolo && !ch.solo) return 0;
    return ch.gain * this.masterGain;
  }

  playingCount(): number { return this.channels.filter((c) => c.playing).length; }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
