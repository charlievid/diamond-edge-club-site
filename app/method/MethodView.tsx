"use client";

import type { Ledger } from "@/lib/ledger";
import { useLive } from "@/lib/useLive";

/**
 * The pre-registration, quoted verbatim from the database, plus any dated
 * corrections BENEATH it.
 *
 * Nothing here is written by hand and the registration text is never edited.
 * A method page that quietly rewrites its own rules is worse than no method
 * page, so a finding that overturns something appears next to the thing it
 * overturns rather than in place of it.
 */
export default function MethodView({ initial }: { initial: Ledger }) {
  const { data } = useLive<Ledger>(initial, "/ledger.json");
  const { registration: r, gate, findings } = data;

  return (
    <>
      <h1>Method</h1>
      <p className="lede">
        The rule below was filed on{" "}
        {new Date(r.registered_at).toISOString().slice(0, 10)} and is quoted
        verbatim from the registration record. It is not a summary. Changing any
        part of it requires filing a new registration that supersedes this one,
        with the original preserved.
      </p>

      <div className="banner">
        <b>
          Status: {r.status.toUpperCase()} &middot; {r.ref}
        </b>
        <p>
          {gate.bets_graded} of {gate.bets_required} graded bets. No performance
          claim is published before that gate, and the failure condition below is
          committed to in advance rather than decided once the results are in.
        </p>
      </div>

      <h2>The rule</h2>
      <pre className="rule">{r.rule}</pre>

      <h2>Threshold and price band</h2>
      <pre className="rule">{r.threshold}</pre>

      <h2>Staking</h2>
      <pre className="rule">{r.stake_rule}</pre>

      <h2>Sample gate, failure condition, known weaknesses</h2>
      <pre className="rule">{r.sample_size}</pre>

      {findings && findings.length > 0 && (
        <>
          <h2>Corrections since filing</h2>
          <p className="lede" style={{ fontSize: 15, marginBottom: 14 }}>
            The text above is never edited. Where later evidence answers or
            overturns part of it, the correction is appended here with a date, so
            what was claimed and what was learned stay visible together.
          </p>
          {findings.map((f) => (
            <div className="finding" key={f.date + f.title}>
              <div className="meta">
                {f.date} &middot; corrects {f.corrects}
              </div>
              <b>{f.title}</b>
              <p>{f.body}</p>
            </div>
          ))}
        </>
      )}

      <h2>Why it is written this way</h2>
      <p className="lede">
        A strategy tested until it looks good is not a strategy, it is a search
        result. Writing the rule, the price band, the stake and the stopping
        condition down in advance is the only thing that separates the two. The
        weaknesses are listed alongside the rule for the same reason &mdash; a
        limitation disclosed before the data arrives cannot be explained away
        after it.
      </p>
    </>
  );
}
