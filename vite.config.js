import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function loginApiLogger() {
  return {
    name: 'login-api-logger',
    configureServer(server) {
      server.middlewares.use('/__login-api-log', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          try {
            const { status, data } = JSON.parse(body)
            console.log(`[Login API ${status}]`, data)
            res.statusCode = 204
            res.end()
          } catch {
            res.statusCode = 400
            res.end('Invalid log payload')
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(() => ({
  // Custom domain act.vegan.md serves from root '/'
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    loginApiLogger(),
  ],
  server: {
    open: true,
    allowedHosts: [
      "act.vegan.md",
      ".ngrok-free.dev",
    ],
  },
}));