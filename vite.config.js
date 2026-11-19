import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev: /api/stations wird wie die Netlify-Function an Tankerkönig weitergereicht (Key aus .env).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/stations': {
          target: 'https://creativecommons.tankerkoenig.de',
          changeOrigin: true,
          rewrite: (p) => {
            const q = new URLSearchParams(p.split('?')[1] || '')
            q.set('sort', 'dist'); q.set('type', 'all'); q.set('apikey', env.TANKERKOENIG_KEY || '')
            return `/json/list.php?${q}`
          },
        },
      },
    },
  }
})
