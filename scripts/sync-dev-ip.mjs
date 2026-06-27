#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { detectLanIp } from './lib/detect-lan-ip.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const rootEnvPath = path.join(repoRoot, '.env');
const dashboardEnvPath = path.join(repoRoot, 'dashboard', '.env');
const devIpJsonPath = path.join(repoRoot, 'dev-ip.json');
const mobileConfigPath = path.join(
  repoRoot,
  'mobile',
  'lib',
  'config',
  'dev_api_config.g.dart',
);

function readPort() {
  if (process.env.PORT) return process.env.PORT;

  if (fs.existsSync(rootEnvPath)) {
    const match = fs.readFileSync(rootEnvPath, 'utf8').match(/^PORT=(\d+)/m);
    if (match) return match[1];
  }

  return '4000';
}

function upsertEnvLine(content, key, value) {
  const line = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, 'm');

  if (regex.test(content)) {
    return content.replace(regex, line);
  }

  const trimmed = content.trimEnd();
  const separator = trimmed.length === 0 ? '' : '\n';
  return `${trimmed}${separator}${line}\n`;
}

function writeEnvFile(filePath, entries) {
  let content = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : '';

  for (const [key, value] of Object.entries(entries)) {
    content = upsertEnvLine(content, key, value);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function writeMobileConfig({ lanHost, apiBaseUrl }) {
  const contents = `// GENERATED FILE - DO NOT EDIT BY HAND.
// Updated by: npm run sync-ip

abstract final class DevApiConfig {
  static const String lanHost = '${lanHost}';
  static const String apiBaseUrl = '${apiBaseUrl}';
}
`;

  fs.mkdirSync(path.dirname(mobileConfigPath), { recursive: true });
  fs.writeFileSync(mobileConfigPath, contents, 'utf8');
}

export function syncDevIp(options = {}) {
  const { quiet = false } = options;
  const lanHost = detectLanIp();
  const port = readPort();
  const apiBaseUrl = `http://${lanHost}:${port}/api/v1`;

  writeEnvFile(rootEnvPath, {
    DEV_LAN_IP: lanHost,
    DEV_API_BASE_URL: apiBaseUrl,
  });

  writeEnvFile(dashboardEnvPath, {
    VITE_API_BASE_URL: apiBaseUrl,
  });

  const devIpPayload = {
    lanHost,
    port: Number(port),
    apiBaseUrl,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(devIpJsonPath, `${JSON.stringify(devIpPayload, null, 2)}\n`, 'utf8');
  writeMobileConfig({ lanHost, apiBaseUrl });

  if (!quiet) {
    console.log(`[sync-ip] LAN host: ${lanHost}`);
    console.log(`[sync-ip] API base URL: ${apiBaseUrl}`);
    console.log('[sync-ip] Updated: .env, dashboard/.env, dev-ip.json, mobile dev config');
  }

  return devIpPayload;
}

if (process.argv[1] &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  syncDevIp();
}
