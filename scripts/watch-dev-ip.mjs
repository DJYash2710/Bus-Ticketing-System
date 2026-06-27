#!/usr/bin/env node
import { syncDevIp } from './sync-dev-ip.mjs';
import { detectLanIp } from './lib/detect-lan-ip.mjs';

const POLL_MS = Number(process.env.DEV_IP_POLL_MS ?? 15_000);

let lastIp = detectLanIp();

console.log(`[watch-ip] Watching for LAN IP changes every ${POLL_MS / 1000}s`);
console.log(`[watch-ip] Current IP: ${lastIp}`);
syncDevIp();

const timer = setInterval(() => {
  const currentIp = detectLanIp();
  if (currentIp === lastIp) return;

  console.log(`[watch-ip] IP changed: ${lastIp} -> ${currentIp}`);
  lastIp = currentIp;
  syncDevIp();
}, POLL_MS);

process.on('SIGINT', () => {
  clearInterval(timer);
  process.exit(0);
});
