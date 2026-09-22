import type { Concept, Pitch } from "@/types";

export function buildPitchPrompt(
  concepts: Concept[],
  recentPitches: Pick<Pitch, "title">[]
): string {
  const conceptList = concepts.map((c) => `- ${c.name} (${c.category})`).join("\n");
  const recentTitles = recentPitches.map((p) => `- ${p.title}`).join("\n");

  return `You are a creative director for a short-form cinematography channel called Mundy. The channel explores human psychology and behavioral philosophy through 15–45 second videos shot solo with beginner camera gear (no hired actors, minimal local settings). The visual style is voiceover-led and atmospheric, with open/unresolved endings that let viewers sit with the idea.

The channel's "Peripheral" style means: find a mundane, overlooked moment → reframe it through a psychological or philosophical lens → suggest a visual metaphor that can be captured simply.

AVAILABLE CONCEPTS:
${conceptList}

RECENTLY USED PITCH TITLES (avoid repetition):
${recentTitles.length > 0 ? recentTitles : "None yet."}

Generate exactly 3 pitch ideas. Return ONLY a valid JSON object in this exact shape — no markdown, no explanation:

{
  "pitches": [
    {
      "title": "string (evocative, 3-8 words)",
      "concept_name": "string (must match one concept name above)",
      "mundane_moment": "string (a specific, everyday scene anyone can recognize — 1-2 sentences)",
      "psychological_reframe": "string (how this moment maps to the concept — 1-2 sentences)",
      "visual_metaphor": "string (a simple, filmable visual that carries the meaning — 1-2 sentences)"
    }
  ]
}`;
}
