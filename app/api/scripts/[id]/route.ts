import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ScriptPayloadSchema, UpdateScriptStatusSchema } from "@/lib/validators/scripts";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scripts")
    .select("*, pitch:pitches(*, concept:concepts(*))")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));

  // Status-only update
  if ("status" in body && Object.keys(body).length === 1) {
    const parsed = UpdateScriptStatusSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from("scripts")
      .update({ status: parsed.data.status })
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Full content update
  const parsed = ScriptPayloadSchema.partial().safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("scripts")
    .update(parsed.data)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const { error } = await supabase.from("scripts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
