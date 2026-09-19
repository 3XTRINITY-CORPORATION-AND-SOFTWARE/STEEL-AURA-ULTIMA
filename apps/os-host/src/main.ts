/**
 * OS host bridge demo — SyncClock + SyncPingV1 every ~2s (Goliath PING_INTERVAL).
 * Run: npm run os-host
 */

import {
  startHostSync,
  stopHostSync,
  getLastPing,
  PING_INTERVAL_MS,
} from "./bridge.ts";

const DEMO_MS = Number(process.env.OS_HOST_DEMO_MS ?? 6500);

console.log("[os-host] STEEL Aura Ultima — OS kernel bridge demo");
console.log(`[os-host] SyncPingV1 every ${PING_INTERVAL_MS}ms (Goliath-style)`);
console.log("[os-host] Budget: abs(skewMs/frameMs) ≤ 0.2 (default ±200ms)");
console.log("[os-host] On breach → safe_viz; kernel remains audio SoT\n");

startHostSync({
  onPing: (result, ticks) => {
    const { ping, rttMs, mode, check } = result;
    console.log(
      JSON.stringify({
        ticks,
        mode,
        withinBudget: check.withinBudget,
        normalizedSkew: Number(check.normalizedSkew.toFixed(4)),
        skewMs: Number(ping.skewMs.toFixed(3)),
        rttMs: Number(rttMs.toFixed(3)),
        tClient: ping.tClient,
        tKernel: ping.tKernel,
        cpuLoad: ping.cpuLoad,
        glitchScore: ping.glitchScore,
      }),
    );
  },
});

const shutdown = () => {
  const last = getLastPing();
  console.log("\n[os-host] stopping — last ping:", last ? JSON.stringify(last) : "none");
  stopHostSync();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

setTimeout(shutdown, DEMO_MS);
