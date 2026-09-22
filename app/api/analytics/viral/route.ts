import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeJSON } from "@/lib/ai/claude";
import { buildViralAnalysisPrompt } from "@/lib/ai/prompts/analytics";
import type { ViralAnalysisResult } from "@/types";

const CACHE_TTL_HOURS = 6;

export async function GET() {
  const supabase = createClient();

  const { data: cached } = await supabase
    .from("analytics_cache")
    .select("*")
    .eq("analysis_type", "viral")
    .gt("expires_at", new Date().toISOString())
    .order("generated_at", { ascending: false })
    .limit(1)
    .single();

  if (cached) return NextResponse.json(cached.result);

  const [videosRes, scriptsRes] = await Promise.all([
    supabase.from("videos").select("*").order("published_at", { ascending: false }),
    supabase.from("scripts").select("id, themes, moral"),
  ]);

  if (videosRes.error)
    return NextResponse.json({ error: videosRes.error.message }, { status: 500 });
  if (!videosRes.data?.length)
    return NextResponse.json({ message: "No videos yet" });

  const prompt = buildViralAnalysisPrompt(
    videosRes.data as never,
    (scriptsRes.data ?? []) as never
  );
  const result = await callClaudeJSON<ViralAnalysisResult>(prompt);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

  await supabase.from("analytics_cache").insert({
    analysis_type: "viral",
    result,
    expires_at: expiresAt.toISOString(),
  });

  return NextResponse.json(result);
}
