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
  /** win | loss | push. `won` cannot express a push; prefer this when present. */
  outcome?: "win" | "loss" | "push" | null;
  score: string | null;
  profit_units: number | null;
  /** true = scored after the fact, never staked. */
  simulated: boolean;
  /** Which registration this bet was placed under. null for simulated rows. */
  prereg_ref?: string | null;
};

/**
 * One registration and its own record.
 *
 * Every rule this project has bet under keeps its block here, superseded ones
 * included. They are never merged: a bet placed under one rule is not evidence
 * about a different rule, and each carries its own gate for that reason.
 */
export type Registration = {
  ref: string;
  status: string;
  is_current: boolean;
  registered_at: string;
  rule: string;
  threshold: string;
  stake_rule: string;
  sample_size: string;
  live: SeasonTot;
  gate: {
    bets_required: number;
    days_required: number;
    bets_graded: number;
    /** Wall-time days since this rule was registered, stopping at its
     *  supersede. This is the quantity the registration gates on. */
    days_elapsed: number;
    /** Days this rule actually had a graded bet. Always <= days_elapsed.
     *  Reported for context; the gate does NOT read it. */
    days_with_action?: number;
    met: boolean;
    claim_permitted: boolean;
  };
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
  /** Oldest first. Superseded rules keep their record rather than vanishing. */
  registrations?: Registration[];
  /** One row per monthly refit, oldest first.
   *  `market_coef` is the fitted weight on the de-vigged market logit. 1.0
   *  would mean the price is trusted exactly; below 1 the model disagrees
   *  with every price, and that disagreement carries most of the edge.
   *  It climbs as `fit_rows` grows, and higher has measured worse. */
  market_trust?: {
    month: string;
    market_coef: number;
    intercept: number;
    threshold: number;
    fit_rows: number;
  }[];
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
    /** Wall-time days since the CURRENT rule was registered. */
    days_elapsed: number;
    /** Days the current rule actually had a graded bet. Context only. */
    days_with_action?: number;
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

/** Dollars per unit for the illustrative stake conversion on the Ledger. */
export const STAKE_USD = 100;

/**
 * Units expressed at STAKE_USD a unit.
 *
 * This is arithmetic on the unit figure, not a record of money moved. The
 * season total is mostly `sim` picks, so the dollar number inherits exactly the
 * same caveat as the units it is derived from and must be labelled with it.
 */
export function fmtUsd(u: number | null): string {
  if (u === null || u === undefined) return "—";
  const d = u * STAKE_USD;
  const sign = d > 0 ? "+" : d < 0 ? "−" : "";
  return `${sign}$${Math.abs(d).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
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
