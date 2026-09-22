import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeJSON } from "@/lib/ai/claude";
import { SuggestConceptsSchema } from "@/lib/validators/concepts";
import type { Concept } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = SuggestConceptsSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createClient();
  const { data: seedConcepts, error } = await supabase
    .from("concepts")
    .select("*")
    .in("id", parsed.data.concept_ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: allConcepts } = await supabase.from("concepts").select("name");
  const existingNames = (allConcepts ?? []).map((c) => c.name);

  const seedList = (seedConcepts as Concept[])
    .map((c) => `- ${c.name} (${c.category})${c.description ? `: ${c.description}` : ""}`)
    .join("\n");

  const prompt = `You are an editorial advisor for Mundy, a short-form psychology/philosophy cinematography channel.

Given these seed concepts:
${seedList}

Suggest 5 complementary concepts that would expand the creative palette. They should NOT duplicate any of these existing concepts:
${existingNames.join(", ")}

Return ONLY valid JSON:
{
  "suggestions": [
    {
      "name": "string",
      "category": "Psychological | Philosophical | Experiential | Relational | Medicine",
      "description": "string — 1-2 sentences on what it means and why it fits the channel",
      "why_complementary": "string — how it expands on the seed concepts"
    }
  ]
}`;

  const result = await callClaudeJSON<{
    suggestions: Array<{
      name: string;
      category: string;
      description: string;
      why_complementary: string;
    }>;
  }>(prompt);

  return NextResponse.json(result.suggestions);
}
