export type BtMonth = {
  month: string;
  bets: number;
  wins: number;
  losses: number;
  win_pct: number;
  breakeven_pct: number;
  margin: number;
  roi_pct: number;
  units: number;
  pl: number;
  bank_end: number;
};

export type BtPick = {
  date: string;
  matchup: string;
  pick: string;
  american: number;
  decimal: number;
  model_prob: number;
  fair_prob: number;
  edge: number;
  score: string;
  won: boolean;
  pl: number;
  bank: number;
};

export type BtSummary = {
  bets: number;
  wins: number;
  losses: number;
  win_pct: number;
  breakeven_pct: number;
  margin: number;
  roi_pct: number;
  units: number;
  pl: number;
  bank_end: number;
  bank_peak: number;
  bank_trough: number;
  max_drawdown: number;
  avg_price: number;
  days_bet: number;
  ci90_lo: number;
  ci90_hi: number;
  p_positive: number;
};

export type BtSeason = {
  season: number;
  summary: BtSummary;
  months: BtMonth[];
  equity: { i: number; bank: number; date: string }[];
  picks: BtPick[];
};

export type Backtest = {
  /** Always "backtest". The page keys its warning banner off this. */
  kind: string;
  /** Always 0. A simulation places no bets. */
  bets_placed: number;
  generated_at: string;
  params: {
    ref: string;
    min_decimal: number;
    cap_per_day: number;
    target_per_day: number;
    stake: number;
    bankroll_start: number;
    april_excluded: boolean;
    factors: number;
  };
  combined: {
    seasons: number[];
    bets: number;
    wins: number;
    losses: number;
    win_pct: number;
    breakeven_pct: number;
    margin: number;
    roi_pct: number;
    units: number;
    pl: number;
    ci90_lo: number;
    ci90_hi: number;
    p_positive: number;
  };
  /** Windows deliberately NOT on this page, shown so the strong seasons
   *  cannot be read as the whole story. */
  other_windows: {
    window: string;
    factors: number;
    bets: number;
    roi_pct: number;
    note: string;
  }[];
  seasons: BtSeason[];
};

export function money(n: number): string {
  const s = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${n < 0 ? "-" : ""}$${s}`;
}

export function pct(n: number, dp = 2): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(dp)}%`;
}

export function odds(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/**
 * Equity curve as an SVG path plus the geometry the axes need.
 *
 * Single series, so no legend and no categorical palette — the heading says
 * what is plotted. Y is bankroll in dollars, snapped to a clean rounded band so
 * gridlines land on round numbers rather than on the data's extremes.
 */
export function curveGeometry(
  equity: { i: number; bank: number }[],
  w: number,
  h: number,
  pad: { t: number; r: number; b: number; l: number }
) {
  const vals = equity.map((e) => e.bank);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const step = 250;
  const yMin = Math.floor(lo / step) * step;
  const yMax = Math.ceil(hi / step) * step;
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const x = (i: number) =>
    pad.l + (equity.length > 1 ? (i / (equity.length - 1)) * iw : 0);
  const y = (v: number) =>
    pad.t + ih - ((v - yMin) / (yMax - yMin || 1)) * ih;

  const d = equity
    .map((e, k) => `${k === 0 ? "M" : "L"}${x(e.i).toFixed(1)},${y(e.bank).toFixed(1)}`)
    .join(" ");

  const ticks: number[] = [];
  for (let v = yMin; v <= yMax; v += step) ticks.push(v);

  return { d, x, y, yMin, yMax, ticks, iw, ih };
}
