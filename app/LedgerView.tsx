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

      <h2>Every pick</h2>
      {picks.length === 0 ? (
        <div className="empty">
          No picks published yet.
          <br />
          The first one appears here the day it is committed, not after it
          settles.
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
            {[...picks].reverse().map((p) => (
              <tr key={`${p.date}-${p.matchup}-${p.pick}`}>
                <td className="mono">{p.date}</td>
                <td>{p.matchup}</td>
                <td>
                  <strong>{p.pick}</strong>
                </td>
                <td className="mono">{americanOdds(p.price)}</td>
                <td className="mono">{p.score ?? "—"}</td>
                <td>
                  {!p.settled ? (
                    <span className="tag p">pending</span>
                  ) : p.won ? (
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
