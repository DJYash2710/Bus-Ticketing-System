import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
