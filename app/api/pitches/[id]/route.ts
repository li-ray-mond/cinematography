import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdatePitchStatusSchema } from "@/lib/validators/pitches";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pitches")
    .select("*, concept:concepts(*)")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const parsed = UpdatePitchStatusSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("pitches")
    .update({ status: parsed.data.status })
    .eq("id", params.id)
    .select("*, concept:concepts(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const { error } = await supabase.from("pitches").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
