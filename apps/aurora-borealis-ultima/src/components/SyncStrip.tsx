import { useEffect, useState } from 'react'
import { SKEW_BUDGET_MS, sampleMockSync, skewToMeter, type SyncSample } from '../lib/syncMock'

export function SyncStrip() {
  const [sample, setSample] = useState<SyncSample>(() => sampleMockSync(0))

  useEffect(() => {
    const start = performance.now()
    const id = window.setInterval(() => {
      const tSec = (performance.now() - start) / 1000
      setSample(sampleMockSync(tSec))
    }, 200)
    return () => clearInterval(id)
  }, [])

  const pct = skewToMeter(sample.skewMs) * 100
  const statusClass = sample.status === 'LOCKED' ? 'locked' : 'drift'

  return (
    <div className="glass sync-strip">
      <div>
        <div className="meta-row">
          <span className="chip radar">AURA 1:1 SYNC</span>
          <span className={`chip ${statusClass}`}>{sample.status}</span>
          <span className="chip mock">{sample.label}</span>
        </div>
        <div className="kv">
          budget ±{SKEW_BUDGET_MS}ms · contracts/SYNC.md
        </div>
      </div>
      <div>
        <div className="sync-meter" title={`skew ${sample.skewMs}ms`}>
          <div className="sync-zero" />
          <div className="sync-needle" style={{ left: `${pct}%` }} />
        </div>
        <div className="sync-scale">
          <span>−200ms</span>
          <span>0</span>
          <span>+200ms</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="kv">
          skew <strong>{sample.skewMs >= 0 ? '+' : ''}{sample.skewMs}ms</strong>
        </div>
        <div className="kv">
          rtt <strong>{sample.rttMs}ms</strong>
        </div>
      </div>
    </div>
  )
}
