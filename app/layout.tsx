import type { Metadata } from "next";
import SiteHeader from "./SiteHeader";
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

export const viewport = {
  themeColor: "#0A0D14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Montserrat is the specified body face. Archivo carries a width axis,
            which is what lets it stand in for Bank Gothic's extended capitals
            at wdth 125 — see --display in globals.css. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        <main className="wrap">{children}</main>
        <footer className="site">
          <div className="wrap">
            <div className="promise">
              Published before first pitch. Graded in public after. No deleted picks.
            </div>

            <div className="foot-cols">
              <div className="foot-col">
                <div className="foot-h">Explore</div>
                <a href={`${base}/`}>Ledger</a>
                <a href={`${base}/results/`}>Results</a>
                <a href={`${base}/method/`}>Method</a>
              </div>

              <div className="foot-col">
                <div className="foot-h">Follow</div>
                <a
                  className="foot-social"
                  href="https://www.instagram.com/diamondedgeclub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>@diamondedgeclub</span>
                </a>
              </div>

              <div className="foot-col">
                <div className="foot-h">Partners</div>
                <a
                  className="foot-aff"
                  href="https://stake.com/?c=73808a036c"
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                >
                  Stake<small>Sportsbook · International</small>
                </a>
                <a
                  className="foot-aff"
                  href="https://polymarket.com?via=strike-ledger"
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                >
                  Polymarket<small>Prediction markets · Intl + Canada</small>
                </a>
              </div>
            </div>

            <p className="fine">
              This site is a record, not advice, and not an offer to bet. Partner
              links are affiliate links. 18+ &middot; gamble responsibly, and only
              where it is legal for you to do so.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
