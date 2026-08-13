/**
 * Types and helpers for the ledger feed.
 *
 * The site is a static export and reads public/ledger.json, written by
 * export_ledger.py. There is no database connection and no API key anywhere in
 * this app — ded.db is 450MB of research including every experiment that
 * failed, and none of that belongs behind a public endpoint.
 */

export type SeasonTot = {
  bets: number;
  wins: number;
  losses: number;
  units: number;
  roi_pct: number | null;
};

export type Pick = {
  date: string;
  matchup: string;
  pick: string;
  pick_full: string | null;
  price: number;
  decimal: number;
  model_prob: number | null;
  market_prob: number | null;
  edge_pct: number | null;
  published_at: string;
  settled: boolean;
  won: boolean | null;
  score: string | null;
  profit_units: number | null;
  /** true = scored after the fact, never staked. */
  simulated: boolean;
};

export type Ledger = {
  generated_at: string;
  registration: {
    ref: string;
    status: string;
    registered_at: string;
    rule: string;
    threshold: string;
    stake_rule: string;
    sample_size: string;
  };
  /** Dated corrections appended to the registration, never edits of it. */
  findings?: {
    date: string;
    corrects: string;
    title: string;
    body: string;
  }[];
  gate: {
    bets_required: number;
    days_required: number;
    bets_graded: number;
    days_elapsed: number;
    met: boolean;
    /** The site must not render a performance claim unless this is true. */
    claim_permitted: boolean;
  };
  season: SeasonTot;
  live: SeasonTot;
  simulated_count: number;
  summary: {
    published: number;
    graded: number;
    pending: number;
    wins: number;
    losses: number;
    units: number;
    roi_pct: number | null;
  };
  picks: Pick[];
};

export function americanOdds(price: number): string {
  return price > 0 ? `+${price}` : `${price}`;
}

export function fmtUnits(u: number | null): string {
  if (u === null || u === undefined) return "—";
  return `${u > 0 ? "+" : ""}${u.toFixed(2)}`;
}

/** Running bankroll in units, oldest first. Used by the equity curve. */
export function equityCurve(picks: Pick[]): { i: number; units: number }[] {
  let run = 0;
  const out: { i: number; units: number }[] = [{ i: 0, units: 0 }];
  picks
    .filter((p) => p.settled)
    .forEach((p, idx) => {
      run += p.profit_units ?? 0;
      out.push({ i: idx + 1, units: run });
    });
  return out;
}

/** Group settled picks by YYYY-MM, newest month first. */
export function byMonth(picks: Pick[]): { month: string; picks: Pick[] }[] {
  const m = new Map<string, Pick[]>();
  picks.filter((p) => p.settled).forEach((p) => {
    const k = p.date.slice(0, 7);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(p);
  });
  return [...m.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([month, ps]) => ({ month, picks: ps }));
}

export function monthLabel(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("en-US", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
}

export function totals(picks: Pick[]) {
  const u = picks.reduce((a, p) => a + (p.profit_units ?? 0), 0);
  const w = picks.filter((p) => p.won).length;
  return { bets: picks.length, wins: w, losses: picks.length - w, units: u,
           roi: picks.length ? (u / picks.length) * 100 : 0 };
}
