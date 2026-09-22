"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Loader2, RefreshCw } from "lucide-react";
import type {
  ThemeAnalysisResult,
  ViralAnalysisResult,
  ShotAnalysisResult,
  OverlapAnalysisResult,
} from "@/types";

type Tab = "themes" | "viral" | "shots" | "overlap";

const TABS: { key: Tab; label: string }[] = [
  { key: "themes", label: "Theme Analysis" },
  { key: "viral", label: "Viral Patterns" },
  { key: "shots", label: "Shot Audit" },
  { key: "overlap", label: "Concept Overlap" },
];

type Results = {
  themes: ThemeAnalysisResult | null;
  viral: ViralAnalysisResult | null;
  shots: ShotAnalysisResult | null;
  overlap: OverlapAnalysisResult | null;
};

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("themes");
  const [results, setResults] = useState<Results>({ themes: null, viral: null, shots: null, overlap: null });
  const [loading, setLoading] = useState<Tab | null>(null);

  async function load(type: Tab) {
    if (results[type]) return;
    setLoading(type);
    const res = await fetch(`/api/analytics/${type}`);
    if (res.ok) {
      const data = await res.json();
      setResults((r) => ({ ...r, [type]: data }));
    }
    setLoading(null);
  }

  async function refresh(type: Tab) {
    setResults((r) => ({ ...r, [type]: null }));
    setLoading(type);
    const res = await fetch(`/api/analytics/${type}`);
    if (res.ok) {
      const data = await res.json();
      setResults((r) => ({ ...r, [type]: data }));
    }
    setLoading(null);
  }

  useEffect(() => { load(tab); }, [tab]);

  const current = results[tab];
  const isLoading = loading === tab;

  return (
    <div className="animate-fade-in">
      <Header
        title="Analytics"
        subtitle="AI-powered insights across your content"
        action={
          <button
            onClick={() => refresh(tab)}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-900 rounded-lg p-1 w-fit border border-slate-800">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              tab === key
                ? "bg-amber-500 text-slate-950 font-medium"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin text-amber-500/50" />
        </div>
      ) : !current ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
          <p className="text-slate-500 text-sm">Not enough data yet.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Summary card */}
          {"summary" in current && (
            <div className="card-dark p-6 border-amber-500/20">
              <h3 className="text-xs uppercase tracking-widest text-amber-500/70 mb-3">Summary</h3>
              <p className="font-serif text-slate-200 leading-relaxed">{(current as { summary: string }).summary}</p>
            </div>
          )}

          {/* Themes analysis */}
          {tab === "themes" && (() => {
            const d = current as ThemeAnalysisResult;
            return (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-dark p-6">
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Theme Groups</h3>
                    <div className="space-y-3">
                      {d.theme_groups.map((g) => (
                        <div key={g.theme} className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-slate-300">{g.theme}</p>
                          </div>
                          <span className="text-xs text-amber-400 tabular-nums">{g.count}</span>
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${Math.min(100, (g.count / d.theme_groups[0]?.count) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-dark p-6">
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Content Gaps</h3>
                    <ul className="space-y-2">
                      {d.content_gaps.map((gap) => (
                        <li key={gap} className="text-sm text-slate-400 flex gap-2">
                          <span className="text-amber-500/50">→</span> {gap}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-xs text-slate-600 mb-1">Emotional Depth Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${d.emotional_depth_score * 10}%` }}
                          />
                        </div>
                        <span className="text-sm text-amber-400">{d.emotional_depth_score}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Viral analysis */}
          {tab === "viral" && (() => {
            const d = current as ViralAnalysisResult;
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="card-dark p-6">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Top Performers</h3>
                  {d.top_performers.map((v) => (
                    <div key={v.video_id} className="mb-4 pb-4 border-b border-slate-800 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-300">{v.title}</p>
                        <span className="text-amber-400 text-sm font-medium">{v.engagement_rate}%</span>
                      </div>
                      {v.anomalies.map((a) => (
                        <p key={a} className="text-xs text-slate-600 flex gap-1">
                          <span className="text-green-500">+</span> {a}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="card-dark p-6 space-y-4">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Patterns</h3>
                    <ul className="space-y-2">
                      {d.engagement_patterns.map((p) => (
                        <li key={p} className="text-sm text-slate-400 flex gap-2">
                          <span className="text-amber-500/50">→</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {d.recommendations.map((r) => (
                        <li key={r} className="text-sm text-slate-400 flex gap-2">
                          <span className="text-green-500/70">↑</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Shot audit */}
          {tab === "shots" && (() => {
            const d = current as ShotAnalysisResult;
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="card-dark p-6">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Shot Frequencies</h3>
                  {d.shot_frequencies.map((s) => (
                    <div key={s.shot_type} className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">{s.shot_type}</span>
                        <span className="text-slate-500">{s.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.overused_types.includes(s.shot_type) ? "bg-red-500" : "bg-amber-500"}`}
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {d.overused_types.length > 0 && (
                    <p className="text-xs text-red-400 mt-4 flex gap-1">
                      <span>⚠</span> Overused: {d.overused_types.join(", ")}
                    </p>
                  )}
                </div>
                <div className="card-dark p-6">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Expand Your Range</h3>
                  <ul className="space-y-2">
                    {d.recommendations.map((r) => (
                      <li key={r} className="text-sm text-slate-400 flex gap-2">
                        <span className="text-amber-500/50">→</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}

          {/* Concept overlap */}
          {tab === "overlap" && (() => {
            const d = current as OverlapAnalysisResult;
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="card-dark p-6">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Concept Overlaps</h3>
                  {d.concept_overlaps.slice(0, 10).map((o) => (
                    <div key={`${o.concept_a}-${o.concept_b}`} className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-slate-500 w-32 truncate">{o.concept_a}</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500/70 rounded-full"
                          style={{ width: `${o.overlap_score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-32 truncate text-right">{o.concept_b}</span>
                    </div>
                  ))}
                </div>
                <div className="card-dark p-6">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Thematic Clusters</h3>
                  {d.thematic_clusters.map((cluster, i) => (
                    <div key={i} className="mb-3 flex flex-wrap gap-1">
                      {cluster.map((t) => (
                        <span key={t} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
