import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeJSON } from "@/lib/ai/claude";
import { buildScriptRevisionPrompt } from "@/lib/ai/prompts/scripts";
import { ScriptFeedbackSchema } from "@/lib/validators/scripts";
import type { GeneratedScript, Script } from "@/types";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("script_feedback")
    .select("*")
    .eq("script_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const parsed = ScriptFeedbackSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createClient();

  // Fetch current script + its pitch
  const { data: script, error: scriptErr } = await supabase
    .from("scripts")
    .select("*, pitch:pitches(*, concept:concepts(*))")
    .eq("id", params.id)
    .single();

  if (scriptErr || !script)
    return NextResponse.json({ error: "Script not found" }, { status: 404 });

  // Fetch feedback history for context
  const { data: history } = await supabase
    .from("script_feedback")
    .select("version, feedback_text")
    .eq("script_id", params.id)
    .order("created_at", { ascending: true });

  // Snapshot current content before revision
  const snapshot = {
    version: script.version,
    opening_shot: script.opening_shot,
    visual_sequence: script.visual_sequence,
    voiceover_line: script.voiceover_line,
    closing_shot: script.closing_shot,
    sound_design: script.sound_design,
    cherry_on_top: script.cherry_on_top,
    moral: script.moral,
    themes: script.themes,
    shot_analysis: script.shot_analysis,
    status: script.status,
  };

  // Log feedback entry
  const { error: feedbackErr } = await supabase.from("script_feedback").insert({
    script_id: params.id,
    version: script.version,
    content_snapshot: snapshot,
    feedback_text: parsed.data.feedback_text,
  });

  if (feedbackErr)
    return NextResponse.json({ error: feedbackErr.message }, { status: 500 });

  // Generate revision
  const pitch = (script as Script & { pitch: NonNullable<Script["pitch"]> }).pitch;
  const prompt = buildScriptRevisionPrompt(
    pitch,
    snapshot,
    parsed.data.feedback_text,
    history ?? []
  );
  const revised = await callClaudeJSON<GeneratedScript>(prompt);

  // Update script with new content + incremented version
  const { data: updated, error: updateErr } = await supabase
    .from("scripts")
    .update({
      ...revised,
      version: script.version + 1,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json(updated);
}
