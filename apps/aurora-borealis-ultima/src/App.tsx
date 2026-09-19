import { Footer } from './components/Footer'
import { JournalStatus } from './components/JournalStatus'
import { MediaBanks } from './components/MediaBanks'
import { Stage } from './components/Stage'
import { SyncStrip } from './components/SyncStrip'
import { Timeline } from './components/Timeline'

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <h1>AURORA BOREALIS ULTIMA™</h1>
          <span className="chip">MUSIC-VIDEO SHELL</span>
          <span className="chip magenta">STEEL Studio interior</span>
        </div>
        <div className="meta-row" style={{ margin: 0 }}>
          <span className="chip mock">DEMO UI</span>
          <span className="chip">void #050508</span>
          <span className="chip magenta">magenta #ff2bd6</span>
          <span className="chip vu">VU #39ff14</span>
          <span className="chip radar">radar #3aa0ff</span>
        </div>
      </header>

      <div className="main">
        <Stage />
        <aside className="side-stack">
          <JournalStatus />
          <div className="glass panel">
            <h2>Wiring map</h2>
            <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>
                <span className="chip mock">MOCK</span> Stage SIM bins
              </li>
              <li>
                <span className="chip mock">MOCK</span> Sync strip (±200ms)
              </li>
              <li>
                <span className="chip mock">MOCK</span> Timeline + AI prompt
              </li>
              <li>
                <span className="chip mock">MOCK</span> Media / Memory banks
              </li>
              <li>
                <span className="chip wired">FIXTURE</span> Journal JSON status
              </li>
            </ul>
            <p className="kv" style={{ marginTop: 10 }}>
              next: sync-kernel + aura-viz live journal · variants/ultima pending
            </p>
          </div>
        </aside>
      </div>

      <SyncStrip />
      <Timeline />
      <MediaBanks />
      <Footer />
    </div>
  )
}
