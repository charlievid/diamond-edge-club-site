import fs from "node:fs";
import path from "node:path";
import type { Ledger } from "@/lib/ledger";
import MethodView from "./MethodView";

function load(): Ledger {
  const p = path.join(process.cwd(), "public", "ledger.json");
  return JSON.parse(fs.readFileSync(p, "utf-8")) as Ledger;
}

export default function Method() {
  return <MethodView initial={load()} />;
}
