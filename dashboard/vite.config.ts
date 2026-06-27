import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { devIpConfigPlugin } from './vite-plugins/dev-ip-config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

export default defineConfig({
  plugins: [devIpConfigPlugin(repoRoot), react(), tailwindcss()],
  optimizeDeps: {
    // FullCalendar v6 injects CSS at runtime; keep packages from being over-tree-shaken.
    include: [
      '@fullcalendar/core',
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
    ],
  },
  build: {
    rollupOptions: {
      treeshake: {
        moduleSideEffects: (id) => id.includes('@fullcalendar'),
      },
    },
  },
  resolve: {
    // Prefer TypeScript sources over stale compiled .js artifacts in src/
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.mts', '.json'],
  },
})
