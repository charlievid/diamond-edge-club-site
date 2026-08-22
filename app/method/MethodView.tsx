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
  const { registration: r, gate, findings, picks, market_trust } = data;

  // First staked pick, read from the data rather than written down, so the date
  // cannot drift away from the record it describes.
  const staked = picks.filter((p) => !p.simulated).map((p) => p.date).sort();
  const liveSince = staked.length ? staked[0] : null;

  return (
    <>
      <section className="hero">
        <span className="eyebrow">
          {r.ref} · filed{" "}
          <span style={{ whiteSpace: "nowrap" }}>
            {new Date(r.registered_at).toISOString().slice(0, 10)}
          </span>
        </span>
        <h1>Method</h1>
        <p className="promise">
          The rule below is quoted <b>verbatim</b> from the registration record.
          It is not a summary. Changing any part of it means filing a new
          registration that supersedes this one, with the original preserved.
        </p>
      </section>

      <div className="banner">
        <b>
          Status: {r.status.toUpperCase()} &middot; {r.ref}
        </b>
        <p>
          {/* The countdown is gone from the page, not from the rule. The gate
              below still governs when a performance claim may be made; showing
              a running "N of 600" only invited the number to be read as
              progress toward permission to sell something. */}
          {liveSince
            ? `Grading live since ${liveSince}. `
            : "Grading live from the first staked pick. "}
          No performance claim is published until the sample gate below is met,
          and the failure condition is committed to in advance rather than
          decided once the results are in.
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

      {market_trust && market_trust.length > 1 && (
        <>
          <h2>How far the model trusts the price</h2>
          <p className="lede" style={{ fontSize: 15, marginBottom: 14 }}>
            The rule above says the de-vigged market probability is entered
            &ldquo;directly and unscaled&rdquo;. In the fitted model it is not.
            The L2 penalty applies to the market term along with everything
            else, so its weight lands <b>below 1</b> &mdash; the model disagrees
            with every price, pulling long ones toward even money. That
            disagreement, not the twenty factors, is where most of the measured
            edge comes from: re-fitting 2022&ndash;2026 with the weight pinned
            at 1.0 takes the walk-forward from <b>+10.44%</b> to <b>+2.59%</b>.
          </p>
          <p className="lede" style={{ fontSize: 15, marginBottom: 14 }}>
            It is not a chosen number, and it does not hold still. The
            penalty&rsquo;s grip weakens as the fit set grows, so the weight
            climbs &mdash; and on the same walk-forward, higher earns less
            (0.55 returned +10.59%, 1.0 returned +2.59%). Unpenalised it fits
            at 0.89, which is where it is heading. It is published here, month
            by month, so the drift is visible while it happens rather than
            inferred later from a losing run. It is not pinned, and it changes
            no pick.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="trust">
              <thead>
                <tr>
                  <th>Refit</th>
                  <th>Games fit on</th>
                  <th>Trust in price</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {market_trust.map((m) => (
                  <tr key={m.month}>
                    <td>{m.month}</td>
                    <td>{m.fit_rows.toLocaleString()}</td>
                    <td>{m.market_coef.toFixed(3)}</td>
                    <td>{(m.threshold * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="lede" style={{ fontSize: 15, marginTop: 14 }}>
            Stated plainly, because it is the least flattering way to read the
            record and it is also the most accurate: on prediction accuracy the
            market beats every version of this model. The edge has never come
            from forecasting baseball better than the bookmakers. It comes from
            leaning against how they price the extremes.
          </p>
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
