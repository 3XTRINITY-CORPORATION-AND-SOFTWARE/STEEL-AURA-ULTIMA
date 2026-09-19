import { useEffect, useState } from 'react'
import { loadFixtureSummary, type JournalFixtureSummary } from '../lib/journalBrowser'

export function JournalStatus() {
  const [sum, setSum] = useState<JournalFixtureSummary | null>(null)

  useEffect(() => {
    void loadFixtureSummary().then(setSum)
  }, [])

  return (
    <div className="glass panel">
      <h2>Journal / AURA fixture</h2>
      <div className="meta-row">
        <span className={`chip ${sum?.wiring === 'FIXTURE' && sum.ok ? 'wired' : 'mock'}`}>
          {sum?.wiring ?? '…'}
        </span>
        {sum && (
          <span className={`chip ${sum.ok ? 'locked' : 'drift'}`}>
            {sum.ok ? 'STRUCT OK' : 'FAIL'}
          </span>
        )}
      </div>
      {!sum && <p className="kv">loading fixture…</p>}
      {sum && (
        <>
          <p className="kv">
            path <strong>{sum.path}</strong>
          </p>
          <p className="kv">
            class <strong>{sum.accuracyClass ?? 'n/a'}</strong> · hops{' '}
            <strong>{sum.hopCount ?? 0}</strong>
          </p>
          {sum.hopDurationSec != null && (
            <p className="kv">
              hop <strong>{sum.hopDurationSec.toFixed(6)}s</strong>
            </p>
          )}
          {sum.error && <p className="err">{sum.error}</p>}
          <p className="kv" style={{ marginTop: 8 }}>
            UI fixture read ≠ production <strong>1000:1000</strong> harness PASS
          </p>
        </>
      )}
    </div>
  )
}
