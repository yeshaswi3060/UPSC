import react from '@vitejs/plugin-react'
import { sites } from '@openai/sites-vite-plugin'
import { defineConfig } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'

function staticSiteWorker() {
  return {
    name: 'prashnavali-static-site-worker',
    apply: 'build',
    async closeBundle() {
      await mkdir('dist/server', { recursive: true })
      await writeFile(
        'dist/server/index.js',
        `export default {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request)
    if (response.status === 404 && ['GET', 'HEAD'].includes(request.method)) {
      const url = new URL(request.url)
      url.pathname = '/'
      response = await env.ASSETS.fetch(new Request(url, request))
    }
    if (response.headers.get('content-type')?.includes('text/html')) {
      const socialImage = new URL('/og.png', request.url).href
      const html = (await response.text()).replaceAll('content=\"/og.png\"', 'content=\"' + socialImage + '\"')
      return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers })
    }
    return response
  }
}\n`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sites(), staticSiteWorker()],
})
