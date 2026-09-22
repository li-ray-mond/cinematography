import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { callClaudeJSON } from "@/lib/ai/claude";
import { buildPitchPrompt } from "@/lib/ai/prompts/pitches";
import type { GeneratedPitch, Concept, Pitch } from "@/types";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [conceptsRes, recentRes] = await Promise.all([
    supabase.from("concepts").select("*").order("name"),
    supabase
      .from("pitches")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (conceptsRes.error)
    return NextResponse.json({ error: conceptsRes.error.message }, { status: 500 });

  const concepts: Concept[] = conceptsRes.data ?? [];
  const recentPitches: Pick<Pitch, "title">[] = recentRes.data ?? [];

  const prompt = buildPitchPrompt(concepts, recentPitches);
  const result = await callClaudeJSON<{ pitches: GeneratedPitch[] }>(prompt);

  const toInsert = result.pitches.slice(0, 3).map((p) => {
    const concept = concepts.find((c) => c.name === p.concept_name);
    return {
      title: p.title,
      mundane_moment: p.mundane_moment,
      psychological_reframe: p.psychological_reframe,
      visual_metaphor: p.visual_metaphor,
      concept_id: concept?.id ?? null,
      status: "pending" as const,
    };
  });

  const { data: inserted, error: insertError } = await supabase
    .from("pitches")
    .insert(toInsert)
    .select();

  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({
    generated: inserted?.length ?? 0,
    pitches: inserted,
  });
}
