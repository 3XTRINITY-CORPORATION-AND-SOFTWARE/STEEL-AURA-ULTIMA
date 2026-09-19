# Memory banks — live + long

## Live-memory
In-session ring: playhead, mix levels, AURA FFT frames, sync ping samples. Survives soft reloads via IndexedDB / OS mmap.

## Long-term memory bank
Per project + global:
- soundbanks
- previous projects (open list)
- media bank refs (wav/mp3/mp4)
- AURA frequency pattern journals for Ultima

Each memory bank owns its media subdirectory (see MEDIA.md).
