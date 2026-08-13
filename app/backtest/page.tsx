import fs from "node:fs";
import path from "node:path";
import type { Backtest } from "@/lib/backtest";
import BacktestView from "./BacktestView";

function load(): Backtest {
  const p = path.join(process.cwd(), "public", "backtest.json");
  return JSON.parse(fs.readFileSync(p, "utf-8")) as Backtest;
}

export default function BacktestPage() {
  return <BacktestView initial={load()} />;
}
