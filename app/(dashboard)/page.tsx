import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { formatNumber, engagementRate } from "@/lib/utils/format";
import Link from "next/link";
import { ArrowRight, Plus, TrendingUp, FileText, Lightbulb, Video } from "lucide-react";
import type { Video as VideoType } from "@/types";

export default async function DashboardPage() {
  const supabase = createClient();

  const [pitchesRes, scriptsRes, videosRes] = await Promise.all([
    supabase.from("pitches").select("id, status").eq("status", "pending"),
    supabase
      .from("scripts")
      .select("id, status")
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("videos")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  const pendingCount = pitchesRes.data?.length ?? 0;
  const draftCount = scriptsRes.data?.length ?? 0;
  const recentVideos: VideoType[] = (videosRes.data ?? []) as VideoType[];

  const totalViews = recentVideos.reduce((s, v) => s + v.views, 0);
  const avgEngagement =
    recentVideos.length > 0
      ? recentVideos.reduce((s, v) => s + engagementRate(v), 0) /
        recentVideos.length
      : 0;

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="Your creative pipeline at a glance"
        action={
          <Link
            href="/pitches"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            <Plus size={14} />
            Generate Pitches
          </Link>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Pending Pitches", value: pendingCount, icon: Lightbulb, href: "/pitches" },
          { label: "Scripts in Draft", value: draftCount, icon: FileText, href: "/scripts" },
          { label: "Total Views (recent)", value: formatNumber(totalViews), icon: Video, href: "/videos" },
          { label: "Avg Engagement", value: `${avgEngagement.toFixed(1)}%`, icon: TrendingUp, href: "/analytics" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="card-dark p-5 hover:border-slate-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon size={16} className="text-amber-500/70 group-hover:text-amber-400 transition-colors" />
              <ArrowRight size={12} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
            </div>
            <div className="font-serif text-2xl text-slate-100">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent videos */}
      {recentVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-slate-300">Recent Performance</h2>
            <Link href="/videos" className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
              All videos <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentVideos.map((v) => (
              <div key={v.id} className="card-dark px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">{v.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5 capitalize">{v.platform}</p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{formatNumber(v.views)}</div>
                    <div className="text-xs text-slate-600">views</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-400">{engagementRate(v)}%</div>
                    <div className="text-xs text-slate-600">engagement</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentVideos.length === 0 && pendingCount === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
          <p className="font-serif text-xl text-slate-400">Ready to create?</p>
          <p className="text-slate-600 text-sm mt-2 mb-6">Generate your first batch of pitches to get started.</p>
          <Link
            href="/pitches"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-6 py-2.5 rounded-md transition-colors"
          >
            <Plus size={14} />
            Generate Pitches
          </Link>
        </div>
      )}
    </div>
  );
}
