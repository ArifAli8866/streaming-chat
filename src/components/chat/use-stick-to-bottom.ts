import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Auto-scroll behavior for the message list.
 *
 * Rules (per the assignment's mentor tip — this is the part most
 * submissions get wrong):
 * - While the user is at (or very near) the bottom, new content — including
 *   token-by-token streaming updates — keeps them pinned to the bottom.
 * - The instant the user scrolls up, even by a little, the pin releases and
 *   we stop forcing scroll position. Streaming a paragraph must not fight a
 *   user who scrolled up to reread something.
 * - While unpinned, we surface a "jump to latest" affordance instead of
 *   silently doing nothing.
 *
 * This is deliberately a plain scroll-event + ref implementation rather than
 * relying on a layout library, since the container's scrollHeight changes on
 * every streamed token and needs to be re-measured each time regardless.
 */
export function useStickToBottom<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // How close to the bottom (in px) still counts as "at the bottom" — a
  // little slack avoids flicker from sub-pixel rounding during streaming.
  const BOTTOM_THRESHOLD = 48

  const checkIsAtBottom = useCallback((el: HTMLElement) => {
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight
    return distanceFromBottom <= BOTTOM_THRESHOLD
  }, [])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setIsAtBottom(checkIsAtBottom(el))
  }, [checkIsAtBottom])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
    setIsAtBottom(true)
  }, [])

  // Re-pin to the bottom on every render while the user hasn't scrolled up.
  // This runs on every message/content update (streaming included) because
  // the parent re-renders on each token; when isAtBottom is false this is a
  // no-op, which is exactly the "release the pin" behavior we want.
  useEffect(() => {
    if (!isAtBottom) return
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  })

  return {
    containerRef,
    isAtBottom,
    handleScroll,
    scrollToBottom,
  }
}
