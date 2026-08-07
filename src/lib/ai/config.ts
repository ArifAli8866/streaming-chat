import { anthropic } from "@ai-sdk/anthropic"

/**
 * All model/prompt configuration for the streaming chat lives here, in one
 * file, per the assignment brief ("Keep system prompt and model config in
 * one well-commented module"). If FE-07 extends this route handler later,
 * this is the file to touch.
 */

/**
 * The model used for every chat completion. `@ai-sdk/anthropic` reads
 * `ANTHROPIC_API_KEY` from the server environment automatically — the key
 * never reaches the client because this module is only ever imported by the
 * server-side route handler (`src/app/api/chat/route.ts`), never by a
 * client component.
 *
 * Swap the model string here to change models app-wide.
 */
export const chatModel = anthropic("claude-sonnet-4-6")

/**
 * The system prompt that defines the assistant's behavior for this
 * capstone's central AI interaction. Edit this — not the route handler —
 * when the assistant's persona or task needs to change.
 */
export const systemPrompt = `You are a helpful assistant embedded in a product demo.

- Keep answers concise and skimmable: short paragraphs, and bullet lists for
  anything with more than two items.
- Use Markdown (headings, bold, code fences with a language tag) when it
  actually clarifies the answer — not for its own sake.
- If a question is ambiguous, make a reasonable assumption, state it in one
  short sentence, and answer anyway rather than only asking for clarification.
- Never claim to browse the web, access files, or run code. You cannot do
  any of those things in this interface.`

/**
 * Generation settings passed straight into `streamText`. Centralized here so
 * the route handler stays focused on request/response plumbing.
 */
export const generationConfig = {
  /** Hard ceiling on response length; keeps latency and cost predictable. */
  maxOutputTokens: 2048,
  /** Slightly below 1 for answers that are consistent but not robotic. */
  temperature: 0.7,
} as const
