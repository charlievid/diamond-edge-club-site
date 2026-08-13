"use client";

import type { Ledger } from "@/lib/ledger";
import { americanOdds, fmtUnits } from "@/lib/ledger";
import { useLive } from "@/lib/useLive";

export default function LedgerView({ initial }: { initial: Ledger }) {
  const { data: d, live } = useLive<Ledger>(initial, "/ledger.json");
  const { gate, summary, picks, registration } = d;
  const pct = Math.min(gate.bets_graded / gate.bets_required, 1) * 100;

  // The one rule this page enforces: no performance claim until the
  // pre-registered sample gate is met. ROI is withheld, not greyed out.
  const showPerformance = gate.claim_permitted;

  // Today's card is kept visually separate from the graded history. A pending
  // pick and a settled one are different claims: one is a prediction on the
  // record, the other is a result. Mixing them in one table invites reading a
  // hot streak into a list that is really just "what is live right now".
  const pending = picks.filter((p) => !p.settled);
  const settled = picks.filter((p) => p.settled);

  return (
    <>
      <h1>The Ledger</h1>
      <p className="lede">
        Every pick published under <strong>{registration.ref}</strong> is listed
        below, with the price it was published at and the result once the game
        finished. Losers included. The registration was filed{" "}
        {new Date(registration.registered_at).toISOString().slice(0, 10)}, before
        any of these bets existed.
      </p>

      {!showPerformance && (
        <div className="banner">
          <b>This is not a track record yet.</b>
          <p>
            {gate.bets_graded} of {gate.bets_required} graded bets, over{" "}
            {gate.days_elapsed} of {gate.days_required} required days. Under our
            own pre-registration no win rate, ROI or profit figure is published
            until that gate is met. If the answer turns out to be no edge, that
            gets published too, and the rule closes rather than being retuned.
          </p>
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <div className="v">{summary.published}</div>
          <div className="l">published</div>
        </div>
        <div className="stat">
          <div className="v">{summary.graded}</div>
          <div className="l">graded</div>
        </div>
        <div className="stat">
          <div className="v">
            {summary.graded ? `${summary.wins}–${summary.losses}` : "—"}
          </div>
          <div className="l">record</div>
        </div>
        <div className="stat">
          <div className="v">
            {showPerformance && summary.roi_pct !== null
              ? `${summary.roi_pct > 0 ? "+" : ""}${summary.roi_pct.toFixed(1)}%`
              : "—"}
          </div>
          <div className="l">
            {showPerformance ? "roi" : "roi · withheld"}
          </div>
        </div>
        <div className="stat">
          <div className="v">
            {showPerformance ? fmtUnits(summary.units) : "—"}
          </div>
          <div className="l">
            {showPerformance ? "units" : "units · withheld"}
          </div>
        </div>
      </div>

      <div className="gate">
        <div className="top">
          <span className="lab">Sample gate</span>
          <span className="mono">
            {gate.bets_graded} / {gate.bets_required} bets
          </span>
        </div>
        <div className="bar">
          <div style={{ width: `${pct.toFixed(1)}%` }} />
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
              Published before first pitch and already written to the ledger below.
              These move into the record the moment they settle.
            </div>
            {pending.map((p) => (
              <div className="row" key={`${p.date}-${p.matchup}-${p.pick}`}>
                <span className="side">{p.pick}</span>
                <span className="vs">{p.matchup}</span>
                <span className="price">{americanOdds(p.price)}</span>
                <span className="edge">
                  {p.edge_pct !== null ? `edge ${p.edge_pct > 0 ? "+" : ""}${p.edge_pct.toFixed(1)}` : ""}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      <h2>The record</h2>
      {settled.length === 0 ? (
        <div className="empty">
          No graded bets yet.
          <br />
          A pick appears here once its game is final &mdash; win or lose,
          nothing is removed.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Game</th>
              <th>Pick</th>
              <th>Price</th>
              <th>Score</th>
              <th>Result</th>
              {showPerformance && <th>Units</th>}
            </tr>
          </thead>
          <tbody>
            {[...settled].reverse().map((p) => (
              <tr key={`${p.date}-${p.matchup}-${p.pick}`}>
                <td className="mono">{p.date}</td>
                <td>{p.matchup}</td>
                <td>
                  <strong>{p.pick}</strong>
                </td>
                <td className="mono">{americanOdds(p.price)}</td>
                <td className="mono">{p.score ?? "—"}</td>
                <td>
                  {p.won ? (
                    <span className="tag w">WON</span>
                  ) : (
                    <span className="tag l">LOST</span>
                  )}
                </td>
                {showPerformance && (
                  <td className="mono">{fmtUnits(p.profit_units)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="lede" style={{ fontSize: 14 }}>
        Updated {d.generated_at.replace("T", " ").replace("+00:00", "")} UTC{live ? " (live)" : ""}.
      </p>
    </>
  );
}
