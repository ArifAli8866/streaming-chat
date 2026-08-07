import { Streamdown } from "streamdown"
import type { UIMessage } from "ai"

interface ChatMessageProps {
  message: UIMessage
  /** True only for the most recent assistant message while it is still streaming. */
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === "user"
  const textParts = message.parts.filter((part) => part.type === "text")
  const text = textParts.map((part) => part.text).join("")

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      data-role={message.role}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${
          isUser
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
        }`}
      >
        {isUser ? (
          // User input is plain text, not markdown — render as-is, no
          // markdown parsing needed and no risk of it being misinterpreted.
          <p className="whitespace-pre-wrap break-words">{text}</p>
        ) : (
          <div
            className={`prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${
              isStreaming ? "streaming-fade-in" : ""
            }`}
          >
            {/* Streamdown buffers/parses markdown block-by-block, so an
                unclosed code fence or a dangling ** mid-stream doesn't
                render broken — it holds that block until it's complete. */}
            <Streamdown>{text}</Streamdown>
          </div>
        )}
      </div>
    </div>
  )
}
