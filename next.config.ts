import type { NextConfig } from "next";

/** Static export: no server, no database credentials, nothing to leak.
 *  The site reads public/*.json, which export_ledger.py / export_backtest.py write.
 *
 *  basePath: GitHub Pages serves a project site from /<repo>/, not the domain
 *  root, so absolute asset URLs like /_next/... 404 unless they are prefixed.
 *  It is driven by an env var rather than hard-coded so `npm run dev` and the
 *  local `python -m http.server` (both served at /) still work untouched.
 *  The deploy workflow sets PAGES_BASE_PATH.
 *
 *  trailingSlash emits `method/index.html` rather than `method.html`, which is
 *  what plain static hosts actually serve. */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  env: {
    // Exposed to the client so the JSON fetch and nav links can prefix too;
    // basePath only rewrites framework-generated URLs, not ones we write.
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
