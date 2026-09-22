export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || 'Please try again.');
  return data;
}

let trackQueue = Promise.resolve();
let lastPageView = { path:'', at:0 };
export function track(type, path = window.location.pathname) {
  if (type === 'page_view') {
    const now = Date.now();
    if (lastPageView.path === path && now - lastPageView.at < 1000) return;
    lastPageView = { path, at:now };
  }
  trackQueue = trackQueue.then(() => api('/api/track', { method:'POST', body:JSON.stringify({ type, path }) })).catch(() => {});
}
