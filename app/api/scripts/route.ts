import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeJSON } from "@/lib/ai/claude";
import { buildScriptPrompt } from "@/lib/ai/prompts/scripts";
import { ScriptPayloadSchema } from "@/lib/validators/scripts";
import type { GeneratedScript } from "@/types";
import { z } from "zod";

const GenerateScriptSchema = z.object({
  pitch_id: z.string().uuid(),
});

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scripts")
    .select("*, pitch:pitches(*, concept:concepts(*))")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Two modes: generate from pitch_id OR direct insert
  if ("pitch_id" in body && typeof body.pitch_id === "string") {
    const parsed = GenerateScriptSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = createClient();
    const { data: pitch, error: pitchErr } = await supabase
      .from("pitches")
      .select("*, concept:concepts(*)")
      .eq("id", parsed.data.pitch_id)
      .single();

    if (pitchErr || !pitch)
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });

    const prompt = buildScriptPrompt(pitch);
    const generated = await callClaudeJSON<GeneratedScript>(prompt);

    const { data: script, error: insertErr } = await supabase
      .from("scripts")
      .insert({
        pitch_id: pitch.id,
        version: 1,
        ...generated,
        status: "draft",
      })
      .select("*, pitch:pitches(*, concept:concepts(*))")
      .single();

    if (insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 });

    return NextResponse.json(script, { status: 201 });
  }

  // Direct insert
  const parsed = ScriptPayloadSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("scripts")
    .insert({ ...parsed.data, version: 1, status: "draft" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
