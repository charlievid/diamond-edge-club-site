"use client";

import type { Backtest, BtSeason } from "@/lib/backtest";
import { money, pct, odds, curveGeometry } from "@/lib/backtest";
import { useLive } from "@/lib/useLive";

const W = 1000;
const H = 260;
const PAD = { t: 14, r: 18, b: 28, l: 62 };

function EquityChart({ s }: { s: BtSeason }) {
  const geo = curveGeometry(s.equity, W, H, PAD);
  const start = s.equity[0].bank;
  const last = s.equity[s.equity.length - 1];
  return (
    <div className="chartwrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart"
        role="img"
        aria-label={`${s.season} bankroll over ${s.summary.bets} bets, ending at ${money(
          s.summary.bank_end
        )}`}
      >
        {geo.ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={geo.y(t)} y2={geo.y(t)} className="grid" />
            <text x={PAD.l - 10} y={geo.y(t) + 4} className="ytick">
              ${t.toLocaleString()}
            </text>
          </g>
        ))}
        {/* starting bankroll: the only reference line that matters */}
        <line x1={PAD.l} x2={W - PAD.r} y1={geo.y(start)} y2={geo.y(start)} className="baseline" />
        <path d={geo.d} className="equity" />
        <circle cx={geo.x(last.i)} cy={geo.y(last.bank)} r="5" className="enddot" />
        <text x={PAD.l} y={H - 7} className="xtick">
          {s.equity[1]?.date}
        </text>
        <text x={W - PAD.r} y={H - 7} className="xtick" textAnchor="end">
          {last.date}
        </text>
      </svg>
    </div>
  );
}

function SeasonBlock({ s, open }: { s: BtSeason; open: boolean }) {
  const q = s.summary;
  return (
    <details className="season" open={open}>
      <summary>
        <span className="yr">{s.season}</span>
        <span className="sm">
          {q.wins}–{q.losses} · {q.bets} bets
        </span>
        <span className={`roi ${q.roi_pct >= 0 ? "up" : "down"}`}>{pct(q.roi_pct)}</span>
        <span className="sm">{money(q.bank_end)}</span>
      </summary>

      <div className="stats">
        <div className="stat">
          <div className="v">{q.win_pct.toFixed(1)}%</div>
          <div className="l">win rate</div>
        </div>
        <div className="stat">
          <div className="v">{q.breakeven_pct.toFixed(1)}%</div>
          <div className="l">breakeven</div>
        </div>
        <div className="stat">
          <div className="v">
            {q.margin > 0 ? "+" : ""}
            {q.margin.toFixed(2)}
          </div>
          <div className="l">margin</div>
        </div>
        <div className="stat">
          <div className="v">{q.avg_price.toFixed(2)}</div>
          <div className="l">avg price</div>
        </div>
        <div className="stat">
          <div className="v">{money(q.max_drawdown)}</div>
          <div className="l">max drawdown</div>
        </div>
      </div>

      <EquityChart s={s} />

      <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Bets</th>
            <th>W–L</th>
            <th>Win%</th>
            <th className="c-be">B/E</th>
            <th className="c-be">Margin</th>
            <th>ROI</th>
            <th>P/L</th>
            <th className="c-bank">Bankroll</th>
          </tr>
        </thead>
        <tbody>
          {s.months.map((m) => (
            <tr key={m.month}>
              <td className="mono">
                <span className="d-long">{m.month}</span>
                <span className="d-short">{m.month.slice(5)}</span>
              </td>
              <td className="mono">{m.bets}</td>
              <td className="mono">
                {m.wins}–{m.losses}
              </td>
              <td className="mono">{m.win_pct.toFixed(1)}%</td>
              <td className="mono c-be">{m.breakeven_pct.toFixed(1)}%</td>
              <td className="mono c-be">
                {m.margin > 0 ? "+" : ""}
                {m.margin.toFixed(2)}
              </td>
              <td className="mono">{pct(m.roi_pct)}</td>
              <td className="mono">{money(m.pl)}</td>
              <td className="mono c-bank">{money(m.bank_end)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <p className="lede" style={{ fontSize: 14, marginBottom: 8 }}>
        CI90 [{pct(q.ci90_lo)}, {pct(q.ci90_hi)}], P(ROI&gt;0) = {q.p_positive.toFixed(3)} ·{" "}
        {q.days_bet} days bet · peak {money(q.bank_peak)}, trough {money(q.bank_trough)}
      </p>

      <details className="picks">
        <summary>All {s.picks.length} bets</summary>
        <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th className="c-game">Game</th>
              <th>Pick</th>
              <th>Price</th>
              <th className="c-model">Model</th>
              <th className="c-model">Fair</th>
              <th>Edge</th>
              <th className="c-score">Score</th>
              <th>R</th>
              <th>P/L</th>
              <th className="c-bank">Bankroll</th>
            </tr>
          </thead>
          <tbody>
            {s.picks.map((p, i) => (
              <tr key={`${p.date}-${p.matchup}-${i}`}>
                <td className="mono">
                  <span className="d-long">{p.date}</span>
                  <span className="d-short">{p.date.slice(5)}</span>
                </td>
                <td className="c-game">{p.matchup}</td>
                <td>
                  <strong>{p.pick}</strong>
                </td>
                <td className="mono">{odds(p.american)}</td>
                <td className="mono c-model">{(p.model_prob * 100).toFixed(1)}%</td>
                <td className="mono c-model">{(p.fair_prob * 100).toFixed(1)}%</td>
                <td className="mono">
                  {p.edge > 0 ? "+" : ""}
                  {(p.edge * 100).toFixed(1)}
                </td>
                <td className="mono c-score">{p.score}</td>
                <td>
                  <span className={`tag ${p.won ? "w" : "l"}`}>{p.won ? "W" : "L"}</span>
                </td>
                <td className="mono">{money(p.pl)}</td>
                <td className="mono c-bank">{money(p.bank)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </details>
    </details>
  );
}

export default function BacktestView({ initial }: { initial: Backtest }) {
  const { data: d } = useLive<Backtest>(initial, "/backtest.json");
  const { combined: c, params, seasons, other_windows } = d;
  const newest = Math.max(...seasons.map((s) => s.season));

  return (
    <>
      <section className="hero">
        <span className="eyebrow">
          {d.kind === "backtest" ? "Simulation" : "Record"} ·{" "}
          {c.bets.toLocaleString()} bets · {c.seasons.join("–")}
        </span>
        <h1>Results</h1>
        <p className="promise">
          How the rule was built, replayed month by month on prices it never saw
          during fitting.{" "}
          {/* Keyed off the data, not a hard-coded string, so this cannot drift
              away from the numbers it describes. */}
          <b>
            {d.bets_placed === 0
              ? "No money was on any of it."
              : `${d.bets_placed} of these were actually placed.`}
          </b>{" "}
          The seasons where the rule fails are on this page too. The staked
          record is on{" "}
          <a
            href={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/"}
            style={{ textDecoration: "underline" }}
          >
            The Ledger
          </a>
          .
        </p>
      </section>

      <div className="stats">
        <div className="stat">
          <div className="v">
            {c.wins}–{c.losses}
          </div>
          <div className="l">record</div>
        </div>
        <div className="stat">
          <div className="v">{c.win_pct.toFixed(1)}%</div>
          <div className="l">win rate</div>
        </div>
        <div className="stat">
          <div className="v">{c.breakeven_pct.toFixed(1)}%</div>
          <div className="l">breakeven</div>
        </div>
        <div className="stat">
          <div className="v">{pct(c.roi_pct)}</div>
          <div className="l">roi · {c.seasons.join("–")}</div>
        </div>
        <div className="stat">
          <div className="v">{money(c.pl)}</div>
          <div className="l">on {money(params.stake)} flat</div>
        </div>
      </div>

      <p className="lede" style={{ fontSize: 15 }}>
        {c.bets} bets across {c.seasons.length} seasons. CI90 [{pct(c.ci90_lo)},{" "}
        {pct(c.ci90_hi)}], P(ROI&gt;0) = {c.p_positive.toFixed(3)}. Each season starts from{" "}
        {money(params.bankroll_start)} independently — the bankrolls do not compound across
        years.
      </p>

      <div className="banner" style={{ borderColor: "var(--line)", background: "transparent" }}>
        <b>Windows that are not on this page</b>
        <p>
          The seasons above are the ones where Statcast exists and the rule looks strong. These
          do not:
          <br />
          {other_windows.map((w) => (
            <span key={w.window}>
              • <strong>{w.window}</strong>, {w.factors} factors, {w.bets.toLocaleString()} bets:{" "}
              <strong>{pct(w.roi_pct)}</strong> — {w.note}
              <br />
            </span>
          ))}
          Roughly 4,000 bets before 2022 say nothing. That is the honest counterweight to
          everything above.
        </p>
      </div>

      <h2>By season</h2>
      {seasons
        .slice()
        .sort((a, b) => b.season - a.season)
        .map((s) => (
          <SeasonBlock key={s.season} s={s} open={s.season === newest} />
        ))}

      <p className="lede" style={{ fontSize: 14 }}>
        Generated {d.generated_at.replace("T", " ").replace("+00:00", "")} UTC · {params.factors}{" "}
        factors · band ≥{params.min_decimal} decimal · max {params.cap_per_day}/day · April
        excluded.
      </p>
    </>
  );
}
