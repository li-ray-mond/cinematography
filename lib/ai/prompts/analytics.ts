import type { Script, Video } from "@/types";

export function buildThemeAnalysisPrompt(scripts: Script[]): string {
  const scriptData = scripts.map((s) => ({
    id: s.id,
    themes: s.themes,
    moral: s.moral,
    voiceover: s.voiceover_line,
  }));

  return `You are an editorial analyst for Mundy, a short-form psychology/philosophy cinematography channel.

Analyze these ${scripts.length} scripts for thematic patterns:
${JSON.stringify(scriptData, null, 2)}

Return ONLY valid JSON:
{
  "theme_groups": [
    { "theme": "string", "count": number, "scripts": ["script_id", ...] }
  ],
  "emotional_depth_score": number between 1-10,
  "content_gaps": ["string — themes or emotions absent from current catalog"],
  "summary": "string — 2-3 sentence editorial overview of the channel's current thematic identity"
}`;
}

export function buildViralAnalysisPrompt(
  videos: Video[],
  scripts: Script[]
): string {
  const scriptMap = Object.fromEntries(scripts.map((s) => [s.id, s]));
  const enriched = videos.map((v) => ({
    id: v.id,
    title: v.title,
    platform: v.platform,
    views: v.views,
    likes: v.likes,
    shares: v.shares,
    comments: v.comments,
    saves: v.saves,
    watch_time_seconds: v.watch_time_seconds,
    engagement_rate:
      v.views > 0
        ? (((v.likes + v.shares + v.comments + v.saves) / v.views) * 100).toFixed(2)
        : "0",
    themes: v.script_id ? scriptMap[v.script_id]?.themes ?? [] : [],
    moral: v.script_id ? scriptMap[v.script_id]?.moral ?? null : null,
  }));

  return `You are a performance analyst for Mundy's short-form video channel.

Analyze engagement anomalies and patterns across ${videos.length} videos:
${JSON.stringify(enriched, null, 2)}

Return ONLY valid JSON:
{
  "top_performers": [
    {
      "video_id": "string",
      "title": "string",
      "engagement_rate": number,
      "anomalies": ["string — what made this outperform"]
    }
  ],
  "engagement_patterns": ["string — recurring patterns in high-performing videos"],
  "recommendations": ["string — actionable content direction shifts"],
  "summary": "string — 2-3 sentence diagnosis of what drives engagement on this channel"
}`;
}

export function buildShotAnalysisPrompt(scripts: Script[]): string {
  const allShots = scripts.flatMap((s) =>
    s.shot_analysis.shots.map((sh) => ({
      script_id: s.id,
      type: sh.type,
      description: sh.description,
    }))
  );

  return `You are a cinematography analyst reviewing shot choices across ${scripts.length} scripts for Mundy (solo short-form filmmaker, psychology/philosophy channel).

All shots in the database:
${JSON.stringify(allShots, null, 2)}

Return ONLY valid JSON:
{
  "shot_frequencies": [
    { "shot_type": "string", "count": number, "percentage": number }
  ],
  "overused_types": ["string — shot types appearing in >40% of scripts"],
  "recommendations": ["string — shot types to explore for variety"],
  "summary": "string — 2-3 sentence assessment of visual diversity and blind spots"
}`;
}

export function buildOverlapAnalysisPrompt(scripts: Script[]): string {
  const themeData = scripts.map((s) => ({
    id: s.id,
    themes: s.themes,
    moral: s.moral,
  }));

  return `Analyze thematic overlap and clustering across these ${scripts.length} scripts for Mundy:
${JSON.stringify(themeData, null, 2)}

Return ONLY valid JSON:
{
  "concept_overlaps": [
    { "concept_a": "string", "concept_b": "string", "overlap_score": number between 0-1 }
  ],
  "thematic_clusters": [["theme1", "theme2"], ["theme3", "theme4"]],
  "summary": "string — 2-3 sentences on how well the catalog's concepts differentiate from each other"
}`;
}
