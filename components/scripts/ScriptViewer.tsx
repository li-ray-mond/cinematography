import type { Script } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Camera, Eye, Mic, Film, Music, Star, Heart } from "lucide-react";

const SECTIONS = [
  { key: "opening_shot" as const, label: "Opening Shot", icon: Eye, color: "text-blue-400" },
  { key: "visual_sequence" as const, label: "Visual Sequence", icon: Film, color: "text-purple-400" },
  { key: "voiceover_line" as const, label: "Voiceover", icon: Mic, color: "text-amber-400" },
  { key: "closing_shot" as const, label: "Closing Shot", icon: Camera, color: "text-green-400" },
  { key: "sound_design" as const, label: "Sound Design", icon: Music, color: "text-pink-400" },
  { key: "cherry_on_top" as const, label: "Cherry on Top", icon: Star, color: "text-yellow-400" },
  { key: "moral" as const, label: "Moral", icon: Heart, color: "text-red-400" },
];

interface Props {
  script: Script;
}

export function ScriptViewer({ script }: Props) {
  return (
    <div className="space-y-6">
      {SECTIONS.map(({ key, label, icon: Icon, color }) => {
        const value = script[key];
        if (!value) return null;
        return (
          <div key={key} className="card-dark p-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} className={color} />
              <h3 className={cn("text-xs uppercase tracking-widest", color)}>{label}</h3>
            </div>
            <p className="font-serif text-slate-200 leading-relaxed text-[15px]">{value}</p>
          </div>
        );
      })}

      {/* Themes */}
      {script.themes.length > 0 && (
        <div className="card-dark p-6">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Themes</h3>
          <div className="flex flex-wrap gap-2">
            {script.themes.map((t) => (
              <span key={t} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Shot analysis */}
      {script.shot_analysis.shots.length > 0 && (
        <div className="card-dark p-6">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Shot Analysis</h3>
          <div className="space-y-4">
            {script.shot_analysis.shots.map((shot, i) => (
              <div key={i} className="border-l-2 border-amber-500/30 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-amber-400 uppercase">{shot.type}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div
                        key={j}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          j < shot.effectiveness_rating ? "bg-amber-400" : "bg-slate-700"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-1">{shot.description}</p>
                <p className="text-xs text-slate-500 mb-1">{shot.why_effective}</p>
                <p className="text-xs text-slate-600 italic">{shot.execution_tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
