import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { chatModel, systemPrompt, generationConfig } from "@/lib/ai/config"

// Stream responses rather than buffering the whole thing before sending —
// this is what makes token-by-token rendering possible on the client.
export const runtime = "nodejs"
// This route calls a third-party API and can legitimately run longer than a
// typical request; raise the max duration accordingly (Vercel Hobby default
// is 10s, which is not enough for a full streamed answer).
export const maxDuration = 30

interface ChatRequestBody {
  messages: UIMessage[]
}

export async function POST(req: Request) {
  const { messages }: ChatRequestBody = await req.json()

  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    // UIMessage[] (what useChat sends) has to be converted to the plain
    // ModelMessage[] shape the language model actually expects.
    messages: await convertToModelMessages(messages),
    ...generationConfig,
    // Lets the client's stop() button actually cancel the upstream request
    // to Anthropic instead of just hiding the UI while generation continues
    // server-side.
    abortSignal: req.signal,
  })

  // toUIMessageStreamResponse() emits the typed message-part stream that
  // useChat on the client knows how to consume (text deltas, start/finish
  // markers, etc.), as SSE.
  return result.toUIMessageStreamResponse({
    // If the request was aborted (stop button), surface that as a clean
    // partial message instead of an error state.
    onError: (error) => {
      if (error instanceof Error && error.name === "AbortError") {
        return "Generation stopped."
      }
      console.error("Chat route error:", error)
      return "Something went wrong while generating a response. Please try again."
    },
  })
}
