import { NextResponse } from "next/server";
import { listGoldEvalRuns } from "@/lib/evaluation/report-store";

export async function GET() {
  const runs = await listGoldEvalRuns();

  return NextResponse.json({ runs });
}
