import Anthropic from "@anthropic-ai/sdk";
import { MODEL, MAX_TOKENS } from "./claude";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export function streamClaude(prompt: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export function streamClaudeAsResponse(prompt: string): Response {
  return new Response(streamClaude(prompt), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
