import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeJSON } from "@/lib/ai/claude";
import { buildShotAnalysisPrompt } from "@/lib/ai/prompts/analytics";
import type { ShotAnalysisResult } from "@/types";

const CACHE_TTL_HOURS = 6;

export async function GET() {
  const supabase = createClient();

  const { data: cached } = await supabase
    .from("analytics_cache")
    .select("*")
    .eq("analysis_type", "shots")
    .gt("expires_at", new Date().toISOString())
    .order("generated_at", { ascending: false })
    .limit(1)
    .single();

  if (cached) return NextResponse.json(cached.result);

  const { data: scripts, error } = await supabase
    .from("scripts")
    .select("id, shot_analysis");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!scripts?.length) return NextResponse.json({ message: "No scripts yet" });

  const prompt = buildShotAnalysisPrompt(scripts as never);
  const result = await callClaudeJSON<ShotAnalysisResult>(prompt);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

  await supabase.from("analytics_cache").insert({
    analysis_type: "shots",
    result,
    expires_at: expiresAt.toISOString(),
  });

  return NextResponse.json(result);
}
