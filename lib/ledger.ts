/**
 * Types and helpers for the ledger feed.
 *
 * The site is a static export and reads public/ledger.json, written by
 * export_ledger.py. There is no database connection and no API key anywhere in
 * this app — ded.db is 450MB of research including every experiment that
 * failed, and none of that belongs behind a public endpoint.
 */

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
