import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

export async function callClaude(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected Claude response type");
  return block.text;
}

export async function callClaudeJSON<T>(prompt: string): Promise<T> {
  const raw = await callClaude(prompt);

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude response contained no JSON object");

  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    throw new Error(`Failed to parse Claude JSON: ${raw.slice(0, 200)}`);
  }
}

export { anthropic, MODEL, MAX_TOKENS };
