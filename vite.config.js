import react from '@vitejs/plugin-react'
import { sites } from '@openai/sites-vite-plugin'
import { defineConfig, loadEnv } from 'vite'
import { copyFile, mkdir } from 'node:fs/promises'
import paymentWorker from './worker/index.js'

function learnovaSiteWorker() {
  return {
    name: 'learnova-site-worker',
    async closeBundle() {
      await mkdir('dist/server', { recursive: true })
      await copyFile('worker/index.js', 'dist/server/index.js')
    },
    configureServer(server) {
      const serverEnv = loadEnv('development', process.cwd(), '')
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith('/api/')) return next()

        try {
          const chunks = []
          for await (const chunk of request) chunks.push(chunk)
          const body = chunks.length ? Buffer.concat(chunks) : undefined
          const origin = `http://${request.headers.host}`
          const webRequest = new Request(new URL(request.url, origin), {
            method: request.method,
            headers: request.headers,
            body: ['GET', 'HEAD'].includes(request.method || '') ? undefined : body,
          })
          const pending = []
          const webResponse = await paymentWorker.fetch(webRequest, serverEnv, {
            waitUntil(promise) { pending.push(Promise.resolve(promise).catch(() => {})) },
          })
          response.statusCode = webResponse.status
          webResponse.headers.forEach((value, key) => response.setHeader(key, value))
          response.end(Buffer.from(await webResponse.arrayBuffer()))
          Promise.allSettled(pending)
        } catch (error) {
          server.config.logger.error(error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: false, error: 'Local payment service failed.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sites(), learnovaSiteWorker()],
})
