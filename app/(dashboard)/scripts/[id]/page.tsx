"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ScriptViewer } from "@/components/scripts/ScriptViewer";
import { FeedbackPanel } from "@/components/scripts/FeedbackPanel";
import { VersionHistory } from "@/components/scripts/VersionHistory";
import type { Script } from "@/types";
import { Loader2 } from "lucide-react";

export default function ScriptPage() {
  const { id } = useParams<{ id: string }>();
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/scripts/${id}`);
    if (res.ok) setScript(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-amber-500/50" />
      </div>
    );
  }

  if (!script) {
    return <p className="text-slate-500 py-20 text-center">Script not found.</p>;
  }

  const pitchTitle = (script as Script & { pitch?: { title: string } }).pitch?.title;

  return (
    <div className="animate-fade-in">
      <Header
        title={pitchTitle ?? "Script"}
        subtitle={`Version ${script.version} · ${script.status}`}
        action={
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full border ${
              script.status === "final"
                ? "border-green-800 text-green-400 bg-green-950/30"
                : "border-slate-700 text-slate-500"
            }`}>
              {script.status}
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main script view */}
        <div className="col-span-2 space-y-6">
          <ScriptViewer script={script} />
          <FeedbackPanel scriptId={id} onRevised={load} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <VersionHistory scriptId={id} currentVersion={script.version} />
        </div>
      </div>
    </div>
  );
}
