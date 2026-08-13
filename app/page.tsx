import fs from "node:fs";
import path from "node:path";
import type { Ledger } from "@/lib/ledger";
import LedgerView from "./LedgerView";

/** Read at build time so the deployed HTML is correct with no JS.
 *  LedgerView then refreshes it from /ledger.json on the client. */
function load(): Ledger {
  const p = path.join(process.cwd(), "public", "ledger.json");
  return JSON.parse(fs.readFileSync(p, "utf-8")) as Ledger;
}

export default function Page() {
  return <LedgerView initial={load()} />;
}
