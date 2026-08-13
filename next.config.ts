import type { NextConfig } from "next";

/** Static export: no server, no database credentials, nothing to leak.
 *  The site reads public/ledger.json, which export_ledger.py writes.
 *
 *  trailingSlash emits `method/index.html` rather than `method.html`, which is
 *  what plain static hosts (S3, Pages, nginx autoindex) actually serve. Without
 *  it /method 404s or lists a directory. */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
