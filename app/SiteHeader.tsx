"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LINKS = [
  { href: "/", label: "Ledger" },
  { href: "/results", label: "Results" },
  { href: "/method", label: "Method" },
];

/**
 * Site header. Client-side because the nav needs the current route to mark the
 * active link, and the mobile menu needs state.
 *
 * The menu closes on navigation. Next's static export serves real pages, so a
 * left-open menu would otherwise still be sitting there after the new page
 * paints — which reads as a broken control rather than a deliberate one.
 */
export default function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);

  // Escape closes the menu. Cheap to support and expected by anyone using a
  // keyboard; without it the only way out is the button itself.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isOn = (href: string) => {
    const p = (path ?? "/").replace(/\/+$/, "") || "/";
    return href === "/" ? p === "/" : p.startsWith(href);
  };

  return (
    <header className="site">
      <div className="wrap">
        <div className="row">
          <Link href="/" className="brand" aria-label="Diamond Edge Club, home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* 320px source for a 100px mark: 3.2x, sharp on a 3x display. */}
            <img
              src={`${base}/logo-320.png`}
              alt=""
              className="mark"
              width={100}
              height={100}
              fetchPriority="high"
            />
            <span className="wordmark">
              <span className="nm">Diamond Edge Club</span>
              <span className="tag">Data. Insight. Edge.</span>
            </span>
          </Link>

          <nav className="desk" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={isOn(l.href) ? "on" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="burger"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <i aria-hidden="true" />
          </button>
        </div>

        <nav
          id="mobile-nav"
          className={`mob${open ? " open" : ""}`}
          aria-label="Primary, mobile"
        >
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isOn(l.href) ? "on" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
