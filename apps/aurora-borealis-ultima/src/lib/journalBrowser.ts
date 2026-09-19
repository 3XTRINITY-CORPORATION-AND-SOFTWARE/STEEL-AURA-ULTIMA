/**
 * Browser-side journal fixture status for the Ultima shell.
 * Honest: UI reads public fixture JSON — full aura-viz validateJournal is Node/CLI.
 */

export interface JournalFixtureSummary {
  ok: boolean
  path: string
  schema?: number
  accuracyClass?: string
  hopCount?: number
  hopDurationSec?: number
  error?: string
  wiring: 'MOCK' | 'FIXTURE'
}

interface LooseJournal {
  schema?: number
  accuracyClass?: string
  hopDurationSec?: number
  entries?: unknown[]
}

export async function loadFixtureSummary(
  path = '/fixtures/demo-1000.json',
): Promise<JournalFixtureSummary> {
  try {
    const res = await fetch(path)
    if (!res.ok) {
      return {
        ok: false,
        path,
        error: `HTTP ${res.status}`,
        wiring: 'MOCK',
      }
    }
    const doc = (await res.json()) as LooseJournal
    const hopCount = Array.isArray(doc.entries) ? doc.entries.length : 0
    const ok = hopCount > 0 && doc.schema === 1
    return {
      ok,
      path,
      schema: doc.schema,
      accuracyClass: doc.accuracyClass,
      hopCount,
      hopDurationSec: doc.hopDurationSec,
      wiring: 'FIXTURE',
      error: ok ? undefined : 'Fixture missing schema/entries',
    }
  } catch (e) {
    return {
      ok: false,
      path,
      error: e instanceof Error ? e.message : String(e),
      wiring: 'MOCK',
    }
  }
}
