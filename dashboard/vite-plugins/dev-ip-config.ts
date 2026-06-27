import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

type DevIpFile = {
  apiBaseUrl: string
  lanHost: string
}

const VIRTUAL_MODULE_ID = 'virtual:dev-api-config'
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

function readDevIpFile(repoRoot: string): DevIpFile {
  const configPath = path.join(repoRoot, 'dev-ip.json')
  const fallback = {
    apiBaseUrl: 'http://localhost:4000/api/v1',
    lanHost: 'localhost',
  }

  if (!fs.existsSync(configPath)) return fallback

  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Partial<DevIpFile>
    return {
      apiBaseUrl: parsed.apiBaseUrl ?? fallback.apiBaseUrl,
      lanHost: parsed.lanHost ?? fallback.lanHost,
    }
  } catch {
    return fallback
  }
}

function renderModule(config: DevIpFile) {
  return [
    `export const API_BASE_URL = ${JSON.stringify(config.apiBaseUrl)};`,
    `export const LAN_HOST = ${JSON.stringify(config.lanHost)};`,
  ].join('\n')
}

export function devIpConfigPlugin(repoRoot: string): Plugin {
  let config = readDevIpFile(repoRoot)
  const devIpPath = path.join(repoRoot, 'dev-ip.json')

  return {
    name: 'dev-ip-config',
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return renderModule(config)
      }
    },
    configureServer(server) {
      if (!fs.existsSync(devIpPath)) return

      fs.watch(devIpPath, () => {
        config = readDevIpFile(repoRoot)
        const moduleNode =
          server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (moduleNode) {
          server.moduleGraph.invalidateModule(moduleNode)
        }
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
