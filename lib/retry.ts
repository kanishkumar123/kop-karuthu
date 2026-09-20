import "server-only";

/**
 * Upstream APIs (ESPN, FPL, football-data) occasionally fail from serverless
 * regions. One blip used to leave a whole section missing until the page
 * revalidated, so every fetch gets a couple of quick retries first.
 */
export async function fetchRetry(url: string, init?: RequestInit, tries = 3): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
      // 5xx and 429 are worth another go; 4xx isn't
      if (res.ok || (res.status < 500 && res.status !== 429)) return res;
      lastError = new Error(`${url} ${res.status}`);
    } catch (e) {
      lastError = e;
    }
    if (i < tries - 1) await new Promise((r) => setTimeout(r, 250 * (i + 1)));
  }
  throw lastError instanceof Error ? lastError : new Error(`${url} failed`);
}
