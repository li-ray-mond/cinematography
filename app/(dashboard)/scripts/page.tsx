import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { formatRelativeDate } from "@/lib/utils/format";
import Link from "next/link";
import type { Script } from "@/types";

export default async function ScriptsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("scripts")
    .select("*, pitch:pitches(title)")
    .order("created_at", { ascending: false });

  const scripts: Script[] = (data ?? []) as Script[];

  return (
    <div className="animate-fade-in">
      <Header title="Scripts" subtitle="All generated and refined scripts" />

      {scripts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
          <p className="text-slate-500 text-sm">No scripts yet. Approve a pitch and script it.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map((s) => {
            const pitch = (s as Script & { pitch?: { title: string } }).pitch;
            return (
              <Link
                key={s.id}
                href={`/scripts/${s.id}`}
                className="card-dark p-5 flex items-center justify-between hover:border-slate-700 transition-colors group"
              >
                <div>
                  <p className="text-slate-200 font-serif">{pitch?.title ?? "Untitled"}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-slate-600">v{s.version}</span>
                    <span className={`text-xs ${s.status === "final" ? "text-green-400" : "text-slate-600"}`}>
                      {s.status}
                    </span>
                    <span className="text-xs text-slate-700">{formatRelativeDate(s.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {s.themes.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
