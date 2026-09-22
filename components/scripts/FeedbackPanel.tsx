"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

interface Props {
  scriptId: string;
  onRevised: () => void;
}

export function FeedbackPanel({ scriptId, onRevised }: Props) {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/scripts/${scriptId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback_text: feedback }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    } else {
      setFeedback("");
      onRevised();
    }

    setSubmitting(false);
  }

  return (
    <div className="card-dark p-5">
      <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Request Revision</h3>
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What should change? Be specific — the more context you give, the better the revision."
          rows={4}
          className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500/60 resize-none transition-colors"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={submitting || feedback.trim().length < 10}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-sm font-medium px-4 py-2 rounded-md transition-colors ml-auto"
        >
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Revise Script
        </button>
      </form>
    </div>
  );
}
