import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Diamond Edge Club — The Ledger",
  description:
    "What the numbers say before first pitch, and every call graded in public after.",
  icons: {
    icon: `${base}/favicon.ico`,
    apple: `${base}/apple-touch-icon.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site">
          <div className="wrap row">
            <Link href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${base}/logo.png`} alt="" className="mark" width={44} height={44} />
              <span>
                Diamond Edge Club
                <small>Data. Insight. Edge.</small>
              </span>
            </Link>
            <nav>
              <Link href="/">Ledger</Link>
              <Link href="/backtest">Backtest</Link>
              <Link href="/method">Method</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site">
          <div className="wrap">
            Published before first pitch. Every call graded in public after. No
            deleted picks.
            <br />
            This site is a record, not advice, and not an offer to bet.
          </div>
        </footer>
      </body>
    </html>
  );
}
