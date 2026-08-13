# Diamond Edge Club — web

Static Next.js site. Two pages: **The Ledger** and **Method**.

## How the data gets here

    python export_ledger.py        # -> web/public/ledger.json
    cd web && npx next build       # -> web/out/  (fully static)

The site never touches `ded.db`. It reads `public/ledger.json`, which contains
only picks published under the open pre-registration plus their results. There
are no credentials in this app and nothing to leak — `ded.db` is 450MB of
research including every experiment that failed, and none of that belongs
behind a public endpoint.

`daily_ml.py --record` regenerates the JSON automatically, so the site is one
`next build` behind the ledger at any time.

## The one rule this site enforces in code

`app/page.tsx` reads `gate.claim_permitted` from the JSON. While it is false:

* ROI, units and profit render as `—` and are labelled **withheld**
* a banner states how many of the required 600 graded bets exist

This is not styling. It is DEC-ML-003's own terms — no performance claim before
the sample gate — enforced where it cannot be forgotten by whoever is posting.
`export_ledger.py` computes `claim_permitted`; the page cannot override it.

## Deploying

`out/` is plain static files. Any host works (Pages, S3, nginx, Netlify).
`trailingSlash: true` is set so `/method` resolves as `method/index.html`
rather than `method.html`, which is what static hosts actually serve.

**Not deployed anywhere yet, deliberately.** There is no record to publish.
