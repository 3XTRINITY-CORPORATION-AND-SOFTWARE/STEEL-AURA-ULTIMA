import { useEffect, useRef, useState, type ChangeEvent } from 'react'

const PROFILES = [
  { id: 'EVO-00', name: 'Aurora Steel', hue: '#39ff14', contrast: 1.08, saturation: 1.1 },
  { id: 'EVO-01', name: 'Noir Pulse', hue: '#3aa0ff', contrast: 1.25, saturation: 0.75 },
  { id: 'EVO-02', name: 'Magenta Bloom', hue: '#ff2bd6', contrast: 1.12, saturation: 1.35 },
  { id: 'EXP-00', name: 'Amber Haze', hue: '#ffb347', contrast: 1.05, saturation: 1.2 },
  { id: 'EXP-01', name: 'Violet Glass', hue: '#a970ff', contrast: 1.18, saturation: 1.05 },
]

export default function App() {
  const [audioUrl, setAudioUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [profile, setProfile] = useState(PROFILES[0])
  const [intensity, setIntensity] = useState(60)
  const [glow, setGlow] = useState(70)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [level, setLevel] = useState(0)
  const [textures, setTextures] = useState<string[]>([])

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const frameRef = useRef<number>(0)

  const loadAudio = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setAudioUrl(URL.createObjectURL(file))
  }
  const loadVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setVideoUrl(URL.createObjectURL(file))
  }
  const loadTextures = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setTextures(files.map((file) => URL.createObjectURL(file)))
  }

  const ensureAudioGraph = () => {
    const audio = audioRef.current
    if (!audio || sourceRef.current) return
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const context = contextRef.current ?? new AudioContextCtor()
    const analyser = context.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.72
    const source = context.createMediaElementSource(audio)
    source.connect(analyser)
    analyser.connect(context.destination)
    contextRef.current = context
    analyserRef.current = analyser
    sourceRef.current = source
  }

  const render = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const analyser = analyserRef.current
    if (!canvas || !video || !analyser) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    const average = data.reduce((sum, value) => sum + value, 0) / data.length
    setLevel(Math.round(average))

    if (video.readyState >= 2) {
      const zoom = 1 + (average / 255) * 0.08 * (intensity / 100)
      const width = canvas.width * zoom
      const height = canvas.height * zoom
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.filter = `brightness(${100 + (average / 255) * glow}%) contrast(${profile.contrast * 100}%) saturate(${profile.saturation})`
      ctx.drawImage(video, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
      ctx.restore()
      ctx.strokeStyle = profile.hue
      ctx.globalAlpha = 0.35 + average / 510
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 24 + average / 8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.font = '14px monospace'
      ctx.fillStyle = profile.hue
      ctx.fillText(`FFT ${Math.round(average)}  PROFILE ${profile.id}`, 18, 26)
    }

    const audio = audioRef.current
    if (audio && video && !audio.paused) {
      const drift = audio.currentTime - video.currentTime
      if (Math.abs(drift) > 0.12) video.currentTime = audio.currentTime
      else video.playbackRate = Math.max(0.97, Math.min(1.03, 1 + drift * 0.08))
      setPosition(audio.currentTime)
    }
    frameRef.current = requestAnimationFrame(render)
  }

  const togglePlayback = async () => {
    if (!audioRef.current || !videoRef.current || !audioUrl || !videoUrl) return
    ensureAudioGraph()
    await contextRef.current?.resume()
    if (playing) {
      audioRef.current.pause()
      videoRef.current.pause()
      cancelAnimationFrame(frameRef.current)
      setPlaying(false)
      return
    }
    videoRef.current.currentTime = audioRef.current.currentTime
    await Promise.all([audioRef.current.play(), videoRef.current.play()])
    setPlaying(true)
    frameRef.current = requestAnimationFrame(render)
  }

  const scrub = (event: ChangeEvent<HTMLInputElement>) => {
    const time = Number(event.target.value)
    if (audioRef.current) audioRef.current.currentTime = time
    if (videoRef.current) videoRef.current.currentTime = time
    setPosition(time)
  }

  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    if (videoUrl) URL.revokeObjectURL(videoUrl)
  }, [audioUrl, videoUrl])

  return (
    <div className="app-shell" style={{ '--accent': profile.hue } as React.CSSProperties}>
      <header className="topbar">
        <div className="brand"><h1>AURORA BOREALIS ULTIMA™</h1><span className="chip">LIVE AUDIO-MASTER ENGINE</span></div>
        <span className="chip vu">FFT {level}</span>
      </header>
      <main className="main">
        <section className="glass panel stage-panel">
          <div className="stage-wrap">
            <audio ref={audioRef} src={audioUrl} loop onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />
            <video ref={videoRef} src={videoUrl} muted={muted} loop playsInline className="source-video" />
            {videoUrl ? <canvas ref={canvasRef} width={1280} height={720} className="render-canvas" /> : <div className="empty-stage">INGEST AUDIO + VIDEO TO ARM THE ENGINE</div>}
          </div>
          <div className="transport">
            <button onClick={togglePlayback} disabled={!audioUrl || !videoUrl}>{playing ? 'PAUSE ENGINE' : 'PLAY MASTER'}</button>
            <button onClick={() => { if (videoRef.current) videoRef.current.muted = !muted; setMuted(!muted) }}>{muted ? 'VIDEO MUTED' : 'VIDEO AUDIO ON'}</button>
            <input aria-label="Master timeline" type="range" min="0" max={duration || 0.01} step="0.01" value={position} onChange={scrub} />
            <span className="mono">{position.toFixed(2)} / {duration.toFixed(2)}s</span>
          </div>
        </section>
        <aside className="side-stack">
          <section className="glass panel"><h2>MEDIA INGESTION</h2><label className="drop">MASTER AUDIO<input type="file" accept="audio/*" onChange={loadAudio} /></label><label className="drop">RAW VIDEO<input type="file" accept="video/*" onChange={loadVideo} /></label><label className="drop">STYLE TEXTURES<input type="file" accept="image/*" multiple onChange={loadTextures} /></label><p className="kv">{textures.length} local texture(s) loaded · no remote provider</p></section>
          <section className="glass panel"><h2>ULTIMA PARAMETERS</h2><label>Mutation intensity <input type="range" min="0" max="100" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} /></label><label>AURA glow <input type="range" min="0" max="140" value={glow} onChange={(e) => setGlow(Number(e.target.value))} /></label><div className="profile-grid">{PROFILES.map((item) => <button key={item.id} className={profile.id === item.id ? 'profile active' : 'profile'} onClick={() => setProfile(item)}>{item.id}<small>{item.name}</small></button>)}</div></section>
        </aside>
      </main>
      <footer className="footer">A/V LOCK: BOUNDED CORRECTION · EXPORT: NOT IMPLEMENTED · REFERENCE BANK: LOCAL FILES</footer>
    </div>
  )
}
