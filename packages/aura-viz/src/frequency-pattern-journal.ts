/** FrequencyPatternJournal — 1:1 audio hop ↔ viz frame (1000:1000). */
export type AuraMode = 'bars' | 'ring' | 'wave' | 'bloom';

export type JournalHop = {
  hopIndex: number; audioMs: number; vizFrameIndex: number; bins: number[]; mode?: AuraMode;
};

export type JournalHeader = {
  version: 1; accuracyClass: '1000:1000'; hopCount: number; createdAt: number; sourceLabel?: string;
};

export type FrequencyPatternJournalData = { header: JournalHeader; hops: JournalHop[] };
export type JournalWriteResult = { accepted: boolean; reason?: string };

export class FrequencyPatternJournal {
  private hops: JournalHop[] = [];
  private sourceLabel?: string;
  constructor(sourceLabel?: string) { this.sourceLabel = sourceLabel; }

  get length(): number { return this.hops.length; }

  write(hop: JournalHop): JournalWriteResult {
    if (hop.vizFrameIndex !== hop.hopIndex) {
      return { accepted: false, reason: `1:1 violation: viz=${hop.vizFrameIndex} hop=${hop.hopIndex}` };
    }
    if (hop.hopIndex !== this.hops.length) {
      return { accepted: false, reason: `non-contiguous hopIndex=${hop.hopIndex}, expected ${this.hops.length}` };
    }
    this.hops.push({ ...hop, bins: hop.bins.slice() });
    return { accepted: true };
  }

  read(hopIndex: number): JournalHop | undefined { return this.hops[hopIndex]; }
  readAll(): readonly JournalHop[] { return this.hops; }

  accuracyRatio(): number {
    if (this.hops.length === 0) return 1;
    let ok = 0;
    for (const h of this.hops) if (h.vizFrameIndex === h.hopIndex) ok += 1;
    return ok / this.hops.length;
  }

  isPerfectOneToOne(): boolean { return this.accuracyRatio() === 1; }

  toJSON(): FrequencyPatternJournalData {
    return {
      header: {
        version: 1, accuracyClass: '1000:1000', hopCount: this.hops.length,
        createdAt: Date.now(), sourceLabel: this.sourceLabel,
      },
      hops: this.hops.map((h) => ({ ...h, bins: h.bins.slice() })),
    };
  }

  static fromJSON(data: FrequencyPatternJournalData): FrequencyPatternJournal {
    const j = new FrequencyPatternJournal(data.header.sourceLabel);
    for (const hop of data.hops) {
      const r = j.write(hop);
      if (!r.accepted) throw new Error(r.reason);
    }
    return j;
  }

  clear(): void { this.hops = []; }
}
