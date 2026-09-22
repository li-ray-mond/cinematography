"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { formatRelativeDate } from "@/lib/utils/format";
import { Plus, Sparkles, Check, X, Loader2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Pitch, PitchStatus } from "@/types";

const TABS: { key: PitchStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function PitchesPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [tab, setTab] = useState<PitchStatus | "all">("pending");
  const [generating, setGenerating] = useState(false);
  const [scriptingId, setScriptingId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/pitches");
    if (res.ok) setPitches(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tab === "all" ? pitches : pitches.filter((p) => p.status === tab);

  async function generate() {
    setGenerating(true);
    await fetch("/api/pitches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    await load();
    setGenerating(false);
    setTab("pending");
  }

  async function updateStatus(id: string, status: PitchStatus) {
    await fetch(`/api/pitches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function generateScript(pitchId: string) {
    setScriptingId(pitchId);
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pitch_id: pitchId }),
    });
    if (res.ok) {
      const script = await res.json();
      router.push(`/scripts/${script.id}`);
    }
    setScriptingId(null);
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Pitches"
        subtitle="AI-generated short-film concepts"
        action={
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate 3 Pitches
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 rounded-lg p-1 w-fit border border-slate-800">
        {TABS.map(({ key, label }) => {
          const count = key === "all" ? pitches.length : pitches.filter((p) => p.status === key).length;
          return (
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
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${tab === key ? "text-slate-800" : "text-slate-600"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pitch cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
          <p className="text-slate-500 text-sm">No {tab === "all" ? "" : tab} pitches yet.</p>
          {tab === "pending" && (
            <button onClick={generate} className="mt-4 text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1 mx-auto">
              <Plus size={12} /> Generate some
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((pitch) => (
            <div key={pitch.id} className="card-dark p-6 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {pitch.concept && (
                      <span className="text-xs text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {pitch.concept.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-600">{formatRelativeDate(pitch.created_at)}</span>
                  </div>
                  <h3 className="font-serif text-lg text-slate-100 mb-3">{pitch.title}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Moment</p>
                      <p className="text-slate-400 leading-relaxed">{pitch.mundane_moment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Reframe</p>
                      <p className="text-slate-400 leading-relaxed">{pitch.psychological_reframe}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Visual</p>
                      <p className="text-slate-400 leading-relaxed">{pitch.visual_metaphor}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {pitch.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(pitch.id, "approved")}
                        className="flex items-center gap-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(pitch.id, "rejected")}
                        className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <X size={12} /> Reject
                      </button>
                    </>
                  )}
                  {pitch.status === "approved" && (
                    <button
                      onClick={() => generateScript(pitch.id)}
                      disabled={scriptingId === pitch.id}
                      className="flex items-center gap-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 text-amber-400 px-3 py-1.5 rounded-md transition-colors"
                    >
                      {scriptingId === pitch.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <FileText size={12} />
                      )}
                      Script it
                    </button>
                  )}
                  {pitch.status === "rejected" && (
                    <button
                      onClick={() => updateStatus(pitch.id, "pending")}
                      className="text-xs text-slate-600 hover:text-slate-400 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
