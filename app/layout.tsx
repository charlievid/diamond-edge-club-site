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
            <p className="fine">
              This site is a record, not advice, and not an offer to bet. Figures
              marked <span className="simtag" style={{ marginLeft: 0 }}>sim</span>{" "}
              are model results scored after the fact, with no money on them.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
