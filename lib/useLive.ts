"use client";

import { useEffect, useState } from "react";

/**
 * Server-rendered data first, then refreshed from the JSON on the client.
 *
 * Why both:
 *  - The static build bakes the JSON in, so the deployed HTML is correct on
 *    first paint with no JS and no loading flash. That matters once this is
 *    public.
 *  - But a static export is frozen at build time, and the nightly job rewrites
 *    the JSON every night. Without a client fetch the site would silently show
 *    yesterday's ledger until someone rebuilt it — the worst kind of stale,
 *    because it looks fine.
 *
 * So: render `initial`, then fetch the live file and swap it in if it differs.
 * `cache: "no-store"` because the whole point is to bypass the copy the browser
 * already has.
 */
export function useLive<T>(initial: T, url: string): { data: T; live: boolean } {
  const [data, setData] = useState<T>(initial);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    fetch(base + url, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((fresh) => {
        if (cancelled || !fresh) return;
        setData(fresh as T);
        setLive(true);
      })
      .catch(() => {
        /* keep the baked-in copy; it is not wrong, only possibly older */
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, live };
}
