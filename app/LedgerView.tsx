"use client";

import type { Ledger, Pick } from "@/lib/ledger";
import { americanOdds, fmtUnits, byMonth, monthLabel, totals } from "@/lib/ledger";
import { useLive } from "@/lib/useLive";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function MonthBlock({ month, picks, open }: { month: string; picks: Pick[]; open: boolean }) {
  const t = totals(picks);
  return (
    <details className="season" open={open}>
      <summary>
        <span className="yr" style={{ fontSize: 20 }}>
          {monthLabel(month)}
        </span>
        <span className="sm">
          {t.wins}–{t.losses} · {t.bets} bets
        </span>
        <span className={`roi ${t.units >= 0 ? "up" : "down"}`}>
          {fmtUnits(t.units)}u
        </span>
      </summary>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Game</th>
            <th>Pick</th>
            <th>Price</th>
            <th>Score</th>
            <th>Result</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((p, i) => (
            <tr key={`${p.date}-${p.matchup}-${i}`}>
              <td className="mono">{p.date}</td>
              <td>
                {p.matchup}
                {p.simulated && <span className="simtag" title="Scored after the fact — not staked">sim</span>}
              </td>
              <td>
                <strong>{p.pick}</strong>
              </td>
              <td className="mono">{americanOdds(p.price)}</td>
              <td className="mono">{p.score ?? "—"}</td>
              <td>
                <span className={`tag ${p.won ? "w" : "l"}`}>{p.won ? "WON" : "LOST"}</span>
              </td>
              <td className="mono">{fmtUnits(p.profit_units)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export default function LedgerView({ initial }: { initial: Ledger }) {
  const { data: d, live } = useLive<Ledger>(initial, "/ledger.json");
  const { picks, season, live: liveTot, simulated_count } = d;

  // Today's card is the live, unsettled slate. It is kept apart from the
  // record because a pending pick is a prediction and a settled one is a
  // result — one table for both reads as a streak.
  const pending = picks.filter((p) => !p.settled);
  const months = byMonth(picks);

  return (
    <>
      <h1>The Ledger</h1>

      <div className="stats">
        <div className="stat">
          <div className="v">
            {season.wins}–{season.losses}
          </div>
          <div className="l">2026 record</div>
        </div>
        <div className="stat">
          <div className="v">
            {season.bets ? ((season.wins / season.bets) * 100).toFixed(1) : "—"}%
          </div>
          <div className="l">win rate</div>
        </div>
        <div className="stat">
          <div className="v">{fmtUnits(season.units)}</div>
          <div className="l">units</div>
        </div>
        <div className="stat">
          <div className="v">
            {season.roi_pct !== null ? `${season.roi_pct > 0 ? "+" : ""}${season.roi_pct.toFixed(1)}%` : "—"}
          </div>
          <div className="l">roi</div>
        </div>
        <div className="stat">
          <div className="v">
            {liveTot.wins}–{liveTot.losses}
          </div>
          <div className="l">live · staked</div>
        </div>
      </div>

      <div className="today">
        <div className="hdr">
          <h3>{pending.length ? "Today's card" : "No card today"}</h3>
          <span className="when">
            {pending.length
              ? `${pending.length} pick${pending.length === 1 ? "" : "s"} · flat 1 unit`
              : "published before first pitch"}
          </span>
        </div>
        {pending.length === 0 ? (
          <div className="none">
            <b>Nothing cleared the threshold.</b>
            No game on the board met the pre-registered edge, so nothing is
            published. A day with no bet is a result too, and it gets shown.
          </div>
        ) : (
          <>
            <div className="sub">
              Published before first pitch. These move into the record the moment
              they settle.
            </div>
            {pending.map((p) => (
              <div className="row" key={`${p.date}-${p.matchup}-${p.pick}`}>
                <span className="side">{p.pick}</span>
                <span className="vs">{p.matchup}</span>
                <span className="price">{americanOdds(p.price)}</span>
                <span className="edge">
                  {p.edge_pct !== null
                    ? `edge ${p.edge_pct > 0 ? "+" : ""}${p.edge_pct.toFixed(1)}`
                    : ""}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      <h2>Record</h2>
      {simulated_count > 0 && (
        <p className="lede" style={{ fontSize: 14, marginBottom: 16 }}>
          {season.bets} bets this season. <strong>{liveTot.bets}</strong> were
          published live and staked; <strong>{simulated_count}</strong> are model
          results scored after the fact and marked{" "}
          <span className="simtag" style={{ marginLeft: 0 }}>sim</span> — the
          model ran, no money was on them. Full method and the seasons where the
          rule does <em>not</em> work are on{" "}
          <a href={`${base}/results/`} style={{ textDecoration: "underline" }}>
            Results
          </a>
          .
        </p>
      )}
      {months.length === 0 ? (
        <div className="empty">
          No graded bets yet.
          <br />
          A pick appears here once its game is final &mdash; win or lose, nothing
          is removed.
        </div>
      ) : (
        months.map((m, i) => (
          <MonthBlock key={m.month} month={m.month} picks={m.picks} open={i === 0} />
        ))
      )}

      <p className="lede" style={{ fontSize: 14 }}>
        Updated {d.generated_at.replace("T", " ").replace("+00:00", "")} UTC
        {live ? " (live)" : ""}.
      </p>
    </>
  );
}
