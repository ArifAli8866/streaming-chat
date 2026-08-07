"use client"

import { useState, type FormEvent, type KeyboardEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ChatMessage } from "./chat-message"
import { ThinkingIndicator } from "./thinking-indicator"
import { JumpToLatest } from "./jump-to-latest"
import { useStickToBottom } from "./use-stick-to-bottom"

export function Chat() {
  const [input, setInput] = useState("")

  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const { containerRef, isAtBottom, handleScroll, scrollToBottom } =
    useStickToBottom<HTMLDivElement>()

  // "submitted": request sent, no tokens yet (thinking indicator).
  // "streaming": tokens are actively arriving.
  const isBusy = status === "submitted" || status === "streaming"
  const lastMessage = messages[messages.length - 1]
  const showThinkingIndicator =
    status === "submitted" &&
    (!lastMessage || lastMessage.role === "user")

  function handleSend(e?: FormEvent) {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isBusy) return
    clearError()
    sendMessage({ text: trimmed })
    setInput("")
    // Sending should always feel like it re-anchors to the bottom, even if
    // the user had scrolled up to read something earlier.
    scrollToBottom("smooth")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter inserts a newline — matches the convention
    // most chat UIs use, and avoids the mobile soft-keyboard "Enter always
    // submits" ambiguity by not being the only way to send (there's a
    // visible Send button too).
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <header className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h1 className="text-sm font-semibold">Streaming Chat</h1>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full space-y-4 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-neutral-400">
              Ask anything to start the conversation.
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={
                status === "streaming" && index === messages.length - 1
              }
            />
          ))}

          {showThinkingIndicator && <ThinkingIndicator />}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {error.message || "Something went wrong. Please try again."}
            </div>
          )}
        </div>

        {!isAtBottom && <JumpToLatest onClick={() => scrollToBottom()} />}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-neutral-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-neutral-800"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the assistant…"
            rows={1}
            disabled={isBusy}
            className="max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-visible:ring-neutral-600"
          />
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              aria-label="Stop generating"
            >
              <span aria-hidden="true" className="block h-3 w-3 rounded-[2px] bg-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              aria-label="Send message"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M10 16V4M10 4L4.5 9.5M10 4l5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
