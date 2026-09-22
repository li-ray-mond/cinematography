"use client";

import { useEffect, useState } from "react";
import { formatRelativeDate } from "@/lib/utils/format";
import type { ScriptFeedback } from "@/types";

interface Props {
  scriptId: string;
  currentVersion: number;
}

export function VersionHistory({ scriptId, currentVersion }: Props) {
  const [history, setHistory] = useState<ScriptFeedback[]>([]);

  useEffect(() => {
    fetch(`/api/scripts/${scriptId}/feedback`)
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {});
  }, [scriptId, currentVersion]);

  if (history.length === 0) {
    return (
      <div className="card-dark p-5">
        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Version History</h3>
        <p className="text-slate-700 text-xs">No revisions yet. Submit feedback above to generate a new version.</p>
      </div>
    );
  }

  return (
    <div className="card-dark p-5">
      <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Version History</h3>
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="relative pl-4 border-l border-slate-800">
            <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-amber-500">v{entry.version}</span>
              <span className="text-xs text-slate-600">{formatRelativeDate(entry.created_at)}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
              {entry.feedback_text}
            </p>
          </div>
        ))}
        <div className="relative pl-4 border-l border-amber-500/30">
          <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-amber-400">v{currentVersion} — current</span>
        </div>
      </div>
    </div>
  );
}
