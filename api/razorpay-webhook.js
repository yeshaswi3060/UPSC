import paymentWorker from '../worker/index.js'

export default {
  fetch(request, context = {}) {
    return paymentWorker.fetch(request, process.env, vercelContext(context))
  },
}

function vercelContext(context) {
  return {
    waitUntil(promise) {
      if (typeof context.waitUntil === 'function') context.waitUntil(promise)
      else promise.catch((error) => console.error('Background task failed:', error))
    },
  }
}
