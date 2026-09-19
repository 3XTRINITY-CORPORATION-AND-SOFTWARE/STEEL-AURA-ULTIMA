import { useState } from 'react'

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  const f = Math.floor((sec % 1) * 100)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(f).padStart(2, '0')}`
}

export function Timeline() {
  const duration = 180
  const [audioT, setAudioT] = useState(12.4)
  const [videoT, setVideoT] = useState(12.4)
  const [prompt, setPrompt] = useState(
    'Aurora curtain over void-black — magenta #ff2bd6 underglow, VU green meters, cyan edges, radar HUD…',
  )

  return (
    <div className="glass timeline">
      <div className="meta-row">
        <span className="chip">TIMELINE</span>
        <span className="chip mock">MOCK scrubber</span>
        <span className="chip">AI prompt · pluggable</span>
      </div>
      <div className="layers">
        <div className="layer">
          <span className="layer-name">AUDIO</span>
          <input
            className="scrub"
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={audioT}
            onChange={(e) => {
              const v = Number(e.target.value)
              setAudioT(v)
              setVideoT(v)
            }}
            aria-label="Audio layer scrubber"
          />
          <span className="time-readout">{fmt(audioT)} / {fmt(duration)}</span>
        </div>
        <div className="layer">
          <span className="layer-name">VIDEO</span>
          <input
            className="scrub"
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={videoT}
            onChange={(e) => setVideoT(Number(e.target.value))}
            aria-label="Video layer scrubber"
          />
          <span className="time-readout">{fmt(videoT)} / {fmt(duration)}</span>
        </div>
      </div>
      <label htmlFor="ai-prompt" className="layer-name" style={{ display: 'block', marginBottom: 6 }}>
        AI PROMPT (stub)
      </label>
      <textarea
        id="ai-prompt"
        className="prompt-box"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the music-video intent…"
      />
      <div className="prompt-hint">
        provider: NOT WIRED · pluggable later (no production claim)
      </div>
    </div>
  )
}
