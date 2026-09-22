import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateVideoSchema } from "@/lib/validators/videos";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");

  const supabase = createClient();
  let query = supabase
    .from("videos")
    .select("*, script:scripts(id, themes, moral, voiceover_line)")
    .order("published_at", { ascending: false });

  if (platform) query = query.eq("platform", platform);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = CreateVideoSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("videos")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
