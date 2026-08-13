import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diamond Edge Club — The Ledger",
  description:
    "What the numbers say before first pitch, and every call graded in public after.",
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
            <div className="brand">
              Diamond Edge Club
              <small>Data. Insight. Edge.</small>
            </div>
            <nav>
              <a href="/">Ledger</a>
              <a href="/backtest">Backtest</a>
              <a href="/method">Method</a>
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
