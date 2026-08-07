/**
 * Shown in place of the assistant bubble between the user hitting send and
 * the first token arriving. It shares the same bubble shell as a real
 * assistant message so the transition into streamed text reads as a
 * handoff (one fades as the other fades in via the `streaming-fade-in`
 * animation in globals.css) rather than a jarring swap.
 */
export function ThinkingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
        <span className="sr-only">Assistant is thinking</span>
      </div>
    </div>
  )
}
