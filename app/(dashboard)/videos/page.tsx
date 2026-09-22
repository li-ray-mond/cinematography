"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { formatDate, formatNumber, engagementRate } from "@/lib/utils/format";
import type { Video } from "@/types";
import { Plus, X } from "lucide-react";

const PLATFORMS = ["instagram", "tiktok", "youtube", "other"] as const;

const emptyForm = {
  title: "",
  platform: "instagram" as const,
  published_at: "",
  views: 0,
  likes: 0,
  shares: 0,
  comments: 0,
  saves: 0,
  watch_time_seconds: 0,
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/videos");
    if (res.ok) setVideos(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, published_at: form.published_at || undefined }),
    });
    await load();
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  }

  const intField = (key: keyof typeof emptyForm) => ({
    type: "number" as const,
    min: 0,
    value: form[key] as number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: parseInt(e.target.value) || 0 })),
    className:
      "bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/60 w-full",
  });

  return (
    <div className="animate-fade-in">
      <Header
        title="Videos"
        subtitle="Track performance across platforms"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cancel" : "Add Video"}
          </button>
        }
      />

      {/* Add form */}
      {showForm && (
        <form onSubmit={submit} className="card-dark p-6 mb-6 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500">New Video Entry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-slate-600 block mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/60 w-full"
                placeholder="Video title"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as typeof form.platform }))}
                className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/60 w-full"
              >
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Published</label>
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/60 w-full"
              />
            </div>
            {(["views", "likes", "shares", "comments", "saves"] as const).map((k) => (
              <div key={k}>
                <label className="text-xs text-slate-600 block mb-1 capitalize">{k}</label>
                <input {...intField(k)} />
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-600 block mb-1">Watch Time (sec)</label>
              <input {...intField("watch_time_seconds")} />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-medium px-6 py-2 rounded-md transition-colors"
          >
            {saving ? "Saving…" : "Save Video"}
          </button>
        </form>
      )}

      {/* Video table */}
      {videos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
          <p className="text-slate-500 text-sm">No videos logged yet.</p>
        </div>
      ) : (
        <div className="card-dark overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Title", "Platform", "Published", "Views", "Likes", "Shares", "Engagement"].map((h) => (
                  <th key={h} className="text-left text-xs text-slate-600 uppercase tracking-wider px-4 py-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {videos.map((v, i) => (
                <tr key={v.id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 ${i % 2 === 0 ? "" : "bg-slate-900/30"}`}>
                  <td className="px-4 py-3 text-slate-200">{v.title}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{v.platform}</td>
                  <td className="px-4 py-3 text-slate-500">{v.published_at ? formatDate(v.published_at) : "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{formatNumber(v.views)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatNumber(v.likes)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatNumber(v.shares)}</td>
                  <td className="px-4 py-3 text-amber-400 font-medium">{engagementRate(v)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
