import os from 'node:os';

const VIRTUAL_ADAPTER_HINTS = [
  'virtual',
  'vethernet',
  'vmware',
  'hyper-v',
  'wsl',
  'loopback',
  'bluetooth',
  'npcap',
  'tunnel',
  'docker',
  'vbox',
  'tap',
  'tun',
];

const WIFI_HINTS = ['wi-fi', 'wifi', 'wlan', 'wireless'];
const ETHERNET_HINTS = ['ethernet', 'eth'];

/**
 * Picks the best non-internal IPv4 address for LAN API access.
 * Prefers Wi-Fi, then Ethernet, then RFC1918 ranges.
 */
export function detectLanIp() {
  const candidates = [];

  for (const [name, addresses] of Object.entries(os.networkInterfaces())) {
    if (!addresses?.length) continue;

    const lowerName = name.toLowerCase();
    if (VIRTUAL_ADAPTER_HINTS.some((hint) => lowerName.includes(hint))) {
      continue;
    }

    for (const address of addresses) {
      if (address.family !== 'IPv4' || address.internal) continue;

      const ip = address.address;
      if (ip.startsWith('169.254.')) continue;

      candidates.push({
        ip,
        name,
        priority: scoreCandidate(lowerName, ip),
      });
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0]?.ip ?? '127.0.0.1';
}

function scoreCandidate(adapterName, ip) {
  let score = 0;

  if (WIFI_HINTS.some((hint) => adapterName.includes(hint))) score += 100;
  if (ETHERNET_HINTS.some((hint) => adapterName.includes(hint))) score += 80;
  if (ip.startsWith('192.168.')) score += 50;
  if (ip.startsWith('10.')) score += 40;
  if (ip.startsWith('172.')) score += 30;

  return score;
}
