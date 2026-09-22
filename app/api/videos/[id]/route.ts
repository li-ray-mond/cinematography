import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateVideoSchema } from "@/lib/validators/videos";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*, script:scripts(*, pitch:pitches(*))")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const parsed = UpdateVideoSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("videos")
    .update(parsed.data)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const { error } = await supabase.from("videos").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
