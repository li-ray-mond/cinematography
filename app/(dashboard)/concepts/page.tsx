"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import type { Concept, ConceptCategory } from "@/types";
import { Plus, Sparkles, Loader2 } from "lucide-react";

const CATEGORIES: ConceptCategory[] = [
  "Psychological",
  "Philosophical",
  "Experiential",
  "Relational",
  "Medicine",
];

const CATEGORY_COLORS: Record<ConceptCategory, string> = {
  Psychological: "text-blue-400 bg-blue-500/10 border-blue-800/50",
  Philosophical: "text-purple-400 bg-purple-500/10 border-purple-800/50",
  Experiential: "text-green-400 bg-green-500/10 border-green-800/50",
  Relational: "text-pink-400 bg-pink-500/10 border-pink-800/50",
  Medicine: "text-amber-400 bg-amber-500/10 border-amber-800/50",
};

export default function ConceptsPage() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [filter, setFilter] = useState<ConceptCategory | "all">("all");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    name: string;
    category: string;
    description: string;
    why_complementary: string;
  }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const res = await fetch("/api/concepts");
    if (res.ok) setConcepts(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? concepts : concepts.filter((c) => c.category === filter);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function suggest() {
    if (selected.size === 0) return;
    setSuggesting(true);
    setSuggestions([]);
    const res = await fetch("/api/concepts/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept_ids: Array.from(selected) }),
    });
    if (res.ok) setSuggestions(await res.json());
    setSuggesting(false);
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Concept Matrix"
        subtitle={`${concepts.length} concepts across ${CATEGORIES.length} categories`}
        action={
          selected.size > 0 ? (
            <button
              onClick={suggest}
              disabled={suggesting}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              {suggesting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Suggest from {selected.size} selected
            </button>
          ) : undefined
        }
      />

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
              filter === cat
                ? "bg-amber-500 text-slate-950 border-amber-500 font-medium"
                : "text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300"
            }`}
          >
            {cat === "all" ? "All" : cat}
            <span className="ml-1.5 opacity-60">
              {cat === "all" ? concepts.length : concepts.filter((c) => c.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Concept grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {filtered.map((concept) => (
          <button
            key={concept.id}
            onClick={() => toggleSelect(concept.id)}
            className={`text-left card-dark p-4 transition-all ${
              selected.has(concept.id)
                ? "border-amber-500/60 bg-amber-500/5"
                : "hover:border-slate-700"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-slate-100 text-sm">{concept.name}</h3>
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[concept.category as ConceptCategory]}`}>
                {concept.category}
              </span>
            </div>
            {concept.description && (
              <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                {concept.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="font-serif text-lg text-slate-300 mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" /> Suggested Expansions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map((s) => (
              <div key={s.name} className="card-dark p-4 border-amber-500/20">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-slate-100 text-sm">{s.name}</h3>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[s.category as ConceptCategory] ?? "text-slate-400 bg-slate-800 border-slate-700"}`}>
                    {s.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                <p className="text-xs text-amber-500/70 mt-2 italic">{s.why_complementary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
