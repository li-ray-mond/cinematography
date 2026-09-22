import type { Pitch } from "@/types";

export function buildScriptPrompt(pitch: Pitch): string {
  return `You are a script architect for Mundy, a solo short-form cinematography channel. The channel explores psychology and philosophy through atmospheric 15–45 second videos. Constraints: voiceover-led, beginner camera gear, no actors, minimal settings, open/unresolved endings.

PITCH TO SCRIPT:
Title: ${pitch.title}
Mundane Moment: ${pitch.mundane_moment}
Psychological Reframe: ${pitch.psychological_reframe}
Visual Metaphor: ${pitch.visual_metaphor}

Create a complete script. Return ONLY valid JSON — no markdown, no wrapper text:

{
  "opening_shot": "string — the very first frame: describe camera position, subject, lighting, and what the viewer sees in 1-2 sentences",
  "visual_sequence": "string — 3-5 distinct shots in sequence that build the atmosphere, described specifically enough to film solo",
  "voiceover_line": "string — the exact words spoken over the visuals. Short, poetic, resonant. Under 60 words.",
  "closing_shot": "string — the final image that lingers. Unresolved. No tidy bow.",
  "sound_design": "string — ambient audio, music texture, silence cues. Be specific (e.g. 'distant highway hum fading under piano room tone').",
  "cherry_on_top": "string — one optional detail that elevates the piece: a color grade note, a prop, a camera movement, a timing beat.",
  "moral": "string — the idea the viewer is left with. Not a lesson, but an open question or quiet observation. Under 30 words.",
  "themes": ["string", "string"],
  "shot_analysis": {
    "shots": [
      {
        "description": "string — what is filmed",
        "type": "string — e.g. 'wide', 'close-up', 'rack focus', 'handheld', 'static', 'over-shoulder'",
        "effectiveness_rating": 8,
        "why_effective": "string — why this shot works for the concept",
        "execution_tip": "string — how to pull it off solo with basic gear"
      }
    ]
  }
}`;
}

export function buildScriptRevisionPrompt(
  pitch: Pitch,
  currentScript: Record<string, unknown>,
  feedbackText: string,
  feedbackHistory: Array<{ version: number; feedback_text: string }>
): string {
  const historyText = feedbackHistory
    .map((f) => `Version ${f.version}: "${f.feedback_text}"`)
    .join("\n");

  return `You are revising a short-form video script for Mundy (psychology/philosophy cinematography channel, 15-45s, solo filmmaker, voiceover-led, no actors).

ORIGINAL PITCH:
Title: ${pitch.title}
Mundane Moment: ${pitch.mundane_moment}
Psychological Reframe: ${pitch.psychological_reframe}
Visual Metaphor: ${pitch.visual_metaphor}

CURRENT SCRIPT:
${JSON.stringify(currentScript, null, 2)}

FEEDBACK HISTORY (most recent is primary):
${historyText || "No prior feedback."}

NEW FEEDBACK TO ADDRESS:
"${feedbackText}"

Revise the script addressing the new feedback while preserving elements the previous feedback did not flag. Return ONLY valid JSON using the same structure as the current script — no markdown, no explanation.`;
}
