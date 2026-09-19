/** MediaBank — wav/mp3 + mp4 stubs writing to .media-sandbox. */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  type MediaAsset, type MediaMetadata, type AudioMetadata, type VideoMetadata,
  assertAudioConstraints, assertVideoConstraints,
} from './types.ts';

export type MediaBankOptions = { sandboxRoot?: string; bankId?: string };

function defaultSandboxRoot(): string {
  const candidates = [
    join(process.cwd(), '.media-sandbox'),
    join(process.cwd(), '..', '..', '.media-sandbox'),
  ];
  return candidates[0];
}

export class MediaBank {
  readonly bankId: string;
  readonly sandboxRoot: string;
  private assets = new Map<string, MediaAsset>();

  constructor(opts: MediaBankOptions = {}) {
    this.bankId = opts.bankId ?? 'default';
    this.sandboxRoot = opts.sandboxRoot ?? defaultSandboxRoot();
    mkdirSync(join(this.sandboxRoot, this.bankId), { recursive: true });
  }

  list(): MediaAsset[] { return [...this.assets.values()]; }
  get(id: string): MediaAsset | undefined { return this.assets.get(id); }

  upload(filename: string, metadata: MediaMetadata, data: Uint8Array | Buffer | string = new Uint8Array(0)): MediaAsset {
    if (metadata.kind === 'audio') assertAudioConstraints(metadata as AudioMetadata);
    else assertVideoConstraints(metadata as VideoMetadata);
    const id = randomUUID();
    const safeName = basename(filename).replace(/[^\w.\-]+/g, '_');
    const sandboxPath = join(this.bankId, `${id}_${safeName}`);
    const abs = join(this.sandboxRoot, sandboxPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, data);
    const asset: MediaAsset = {
      id, bankId: this.bankId, filename: safeName, metadata, sandboxPath, createdAt: Date.now(),
    };
    this.assets.set(id, asset);
    return asset;
  }

  download(id: string): { asset: MediaAsset; data: Buffer } {
    const asset = this.assets.get(id);
    if (!asset) throw new Error(`unknown asset ${id}`);
    const abs = join(this.sandboxRoot, asset.sandboxPath);
    if (!existsSync(abs)) throw new Error(`missing file ${abs}`);
    return { asset, data: readFileSync(abs) };
  }
}
