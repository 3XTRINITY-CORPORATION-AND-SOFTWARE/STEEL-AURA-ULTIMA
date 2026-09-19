export type AudioFormat = 'wav' | 'mp3';
export type VideoFormat = 'mp4';
export type MediaFormat = AudioFormat | VideoFormat;
export type VideoResolution = 480 | 720 | 1080 | 1440 | 2160;
export type VideoFps = 25 | 30 | 50 | 60;

export type AudioMetadata = {
  kind: 'audio'; format: AudioFormat; sampleRate?: number; channels?: number; durationMs?: number;
};
export type VideoMetadata = {
  kind: 'video'; format: VideoFormat; width: number;
  height: VideoResolution | number; fps: VideoFps | number; durationMs?: number;
};
export type MediaMetadata = AudioMetadata | VideoMetadata;
export type MediaAsset = {
  id: string; bankId: string; filename: string; metadata: MediaMetadata;
  sandboxPath: string; createdAt: number;
};

export const ALLOWED_AUDIO = new Set<AudioFormat>(['wav', 'mp3']);
export const ALLOWED_VIDEO = new Set<VideoFormat>(['mp4']);
export const MIN_HEIGHT = 480;
export const MAX_HEIGHT = 2160;
export const MIN_FPS = 25;
export const MAX_FPS = 60;

export function assertVideoConstraints(meta: VideoMetadata): void {
  if (meta.height < MIN_HEIGHT || meta.height > MAX_HEIGHT) {
    throw new Error(`Video height ${meta.height} outside 480p–4K`);
  }
  if (meta.fps < MIN_FPS || meta.fps > MAX_FPS) {
    throw new Error(`Video fps ${meta.fps} outside 25–60`);
  }
  if (meta.format !== 'mp4') throw new Error(`Unsupported video format: ${meta.format}`);
}

export function assertAudioConstraints(meta: AudioMetadata): void {
  if (!ALLOWED_AUDIO.has(meta.format)) throw new Error(`Unsupported audio format: ${meta.format}`);
}
