import { cacheLife } from "next/cache";

/**
 * Call inside a "use cache" function when a fetch fails: keeps the failure
 * cached only briefly (so we retry soon) and logs it. Throwing inside a
 * cached function would fail the whole prerender, so we return a fallback instead.
 */
export function cacheFailure(label: string, e: unknown) {
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  console.warn(`[${label}]`, (e as Error)?.message ?? e);
}
