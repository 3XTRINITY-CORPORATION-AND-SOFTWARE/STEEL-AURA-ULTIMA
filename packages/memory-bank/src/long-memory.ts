/** LongMemoryBank — projects, soundbanks, media refs, journal refs. */
import type { PersistHooks } from './live-memory.ts';

export type ProjectRef = { id: string; name: string; openedAt: number; mediaBankId?: string };
export type SoundbankEntry = { id: string; name: string; samples: Record<string, string> };
export type MediaRef = { id: string; kind: 'wav' | 'mp3' | 'mp4' | 'other'; pathOrKey: string; bankId: string };
export type JournalRef = { id: string; projectId: string; storageKey: string; hopCount: number };
export type LongMemorySnapshot = {
  projects: ProjectRef[]; soundbanks: Record<string, SoundbankEntry>;
  mediaRefs: Record<string, MediaRef>; journals: Record<string, JournalRef>; updatedAt: number;
};
export type LongMemoryBankOptions = { persist?: PersistHooks<LongMemorySnapshot> };

export class LongMemoryBank {
  private projects: ProjectRef[] = [];
  private soundbanks: Record<string, SoundbankEntry> = {};
  private mediaRefs: Record<string, MediaRef> = {};
  private journals: Record<string, JournalRef> = {};
  private readonly persist?: PersistHooks<LongMemorySnapshot>;

  constructor(opts: LongMemoryBankOptions = {}) { this.persist = opts.persist; }

  listProjects(): ProjectRef[] {
    return this.projects.slice().sort((a, b) => b.openedAt - a.openedAt);
  }

  upsertProject(project: ProjectRef): void {
    const idx = this.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) this.projects[idx] = project; else this.projects.push(project);
  }

  getSoundbank(id: string): SoundbankEntry | undefined { return this.soundbanks[id]; }
  setSoundbank(entry: SoundbankEntry): void { this.soundbanks[entry.id] = entry; }
  get soundbanksMap(): Readonly<Record<string, SoundbankEntry>> { return this.soundbanks; }

  putMediaRef(ref: MediaRef): void { this.mediaRefs[ref.id] = ref; }
  getMediaRef(id: string): MediaRef | undefined { return this.mediaRefs[id]; }
  listMediaForBank(bankId: string): MediaRef[] {
    return Object.values(this.mediaRefs).filter((m) => m.bankId === bankId);
  }

  putJournal(ref: JournalRef): void { this.journals[ref.id] = ref; }
  getJournal(id: string): JournalRef | undefined { return this.journals[id]; }

  snapshot(): LongMemorySnapshot {
    return {
      projects: this.projects.slice(), soundbanks: { ...this.soundbanks },
      mediaRefs: { ...this.mediaRefs }, journals: { ...this.journals }, updatedAt: Date.now(),
    };
  }

  hydrate(snap: LongMemorySnapshot): void {
    this.projects = snap.projects.slice();
    this.soundbanks = { ...snap.soundbanks };
    this.mediaRefs = { ...snap.mediaRefs };
    this.journals = { ...snap.journals };
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
