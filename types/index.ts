export type ConceptCategory =
  | "Psychological"
  | "Philosophical"
  | "Experiential"
  | "Relational"
  | "Medicine";

export type PitchStatus = "pending" | "approved" | "rejected";

export type ScriptStatus = "draft" | "final";

export type VideoPlatform = "instagram" | "tiktok" | "youtube" | "other";

export type AnalysisType = "themes" | "viral" | "shots" | "overlap";

// ── Database rows ────────────────────────────────────────────

export interface Concept {
  id: string;
  name: string;
  category: ConceptCategory;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Pitch {
  id: string;
  concept_id: string | null;
  title: string;
  mundane_moment: string;
  psychological_reframe: string;
  visual_metaphor: string;
  status: PitchStatus;
  created_at: string;
  updated_at: string;
  concept?: Concept;
}

export interface ShotAnalysisItem {
  description: string;
  type: string;
  effectiveness_rating: number;
  why_effective: string;
  execution_tip: string;
}

export interface ShotAnalysis {
  shots: ShotAnalysisItem[];
}

export interface Script {
  id: string;
  pitch_id: string | null;
  version: number;
  opening_shot: string | null;
  visual_sequence: string | null;
  voiceover_line: string | null;
  closing_shot: string | null;
  sound_design: string | null;
  cherry_on_top: string | null;
  moral: string | null;
  themes: string[];
  shot_analysis: ShotAnalysis;
  status: ScriptStatus;
  created_at: string;
  updated_at: string;
  pitch?: Pitch;
}

export interface ScriptFeedback {
  id: string;
  script_id: string;
  version: number;
  content_snapshot: Omit<
    Script,
    "id" | "pitch_id" | "created_at" | "updated_at" | "pitch"
  >;
  feedback_text: string;
  created_at: string;
}

export interface Video {
  id: string;
  script_id: string | null;
  title: string;
  platform: VideoPlatform;
  published_at: string | null;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  saves: number;
  watch_time_seconds: number;
  created_at: string;
  updated_at: string;
  script?: Script;
}

export interface AnalyticsCache {
  id: string;
  analysis_type: AnalysisType;
  result: AnalysisResult;
  generated_at: string;
  expires_at: string;
}

// ── AI result shapes ─────────────────────────────────────────

export interface GeneratedPitch {
  title: string;
  mundane_moment: string;
  psychological_reframe: string;
  visual_metaphor: string;
  concept_name?: string;
}

export interface GeneratedScript {
  opening_shot: string;
  visual_sequence: string;
  voiceover_line: string;
  closing_shot: string;
  sound_design: string;
  cherry_on_top: string;
  moral: string;
  themes: string[];
  shot_analysis: ShotAnalysis;
}

export interface ThemeAnalysisResult {
  theme_groups: Array<{ theme: string; count: number; scripts: string[] }>;
  emotional_depth_score: number;
  content_gaps: string[];
  summary: string;
}

export interface ViralAnalysisResult {
  top_performers: Array<{ video_id: string; title: string; engagement_rate: number; anomalies: string[] }>;
  engagement_patterns: string[];
  recommendations: string[];
  summary: string;
}

export interface ShotAnalysisResult {
  shot_frequencies: Array<{ shot_type: string; count: number; percentage: number }>;
  overused_types: string[];
  recommendations: string[];
  summary: string;
}

export interface OverlapAnalysisResult {
  concept_overlaps: Array<{ concept_a: string; concept_b: string; overlap_score: number }>;
  thematic_clusters: string[][];
  summary: string;
}

export type AnalysisResult =
  | ThemeAnalysisResult
  | ViralAnalysisResult
  | ShotAnalysisResult
  | OverlapAnalysisResult;
