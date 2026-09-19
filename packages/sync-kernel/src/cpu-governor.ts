/** CpuGovernor — soft limits: degrade viz before audio. */
export type GovernorTier = 'nominal' | 'warn' | 'critical';
export type GovernorState = {
  load: number; tier: GovernorTier; fftSize: number;
  metersEnabled: boolean; allowAudioDrop: boolean;
};
export type CpuGovernorOptions = {
  warnThreshold?: number; criticalThreshold?: number;
  nominalFft?: number; warnFft?: number; criticalFft?: number;
};

export class CpuGovernor {
  readonly warnThreshold: number;
  readonly criticalThreshold: number;
  readonly nominalFft: number;
  readonly warnFft: number;
  readonly criticalFft: number;
  private load = 0;

  constructor(opts: CpuGovernorOptions = {}) {
    this.warnThreshold = opts.warnThreshold ?? 0.7;
    this.criticalThreshold = opts.criticalThreshold ?? 0.9;
    this.nominalFft = opts.nominalFft ?? 2048;
    this.warnFft = opts.warnFft ?? 1024;
    this.criticalFft = opts.criticalFft ?? 512;
  }

  update(load: number): GovernorState {
    this.load = Math.max(0, Math.min(1, load));
    return this.state();
  }

  state(): GovernorState {
    if (this.load >= this.criticalThreshold) {
      return { load: this.load, tier: 'critical', fftSize: this.criticalFft, metersEnabled: false, allowAudioDrop: true };
    }
    if (this.load >= this.warnThreshold) {
      return { load: this.load, tier: 'warn', fftSize: this.warnFft, metersEnabled: false, allowAudioDrop: false };
    }
    return { load: this.load, tier: 'nominal', fftSize: this.nominalFft, metersEnabled: true, allowAudioDrop: false };
  }
}
