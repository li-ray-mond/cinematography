import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeJSON } from "@/lib/ai/claude";
import { buildPitchPrompt } from "@/lib/ai/prompts/pitches";
import { GeneratePitchesSchema } from "@/lib/validators/pitches";
import type { GeneratedPitch, Pitch, Concept } from "@/types";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pitches")
    .select("*, concept:concepts(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = GeneratePitchesSchema.safeParse(body);
  const count = parsed.success ? parsed.data.count : 3;

  const supabase = createClient();

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

  const toInsert = result.pitches.slice(0, count).map((p) => {
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
    .select("*, concept:concepts(*)");

  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json(inserted, { status: 201 });
}
