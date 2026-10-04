# Streaming Chat

A streaming AI chat interface built with Next.js, the Vercel AI SDK
(`streamText` + `useChat`), and Claude — built for the "Build (core)" capstone
assignment.

## Where things are

| What | Where |
|---|---|
| Route handler (server) | `src/app/api/chat/route.ts` |
| Model config + system prompt (one module) | `src/lib/ai/config.ts` |
| Chat UI (client) | `src/components/chat/chat.tsx` |
| Message rendering (streaming-safe markdown) | `src/components/chat/chat-message.tsx` |
| Auto-scroll behavior | `src/components/chat/use-stick-to-bottom.ts` |
| Thinking indicator | `src/components/chat/thinking-indicator.tsx` |

## Running it locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your real key:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```


Open http://localhost:3000. The API key is read server-side only, inside
`src/lib/ai/config.ts`, which is only ever imported by the route handler —
never by a client component — so it's never sent to the browser.

## How the requirements map to the code

- **Streams token by token**: `streamText(...).toUIMessageStreamResponse()`
  on the server, consumed by `useChat` on the client — this is SSE under the
  hood, not a buffered response.
- **Stop mid-stream without breaking state**: the stop button calls
  `stop()` from `useChat`, which aborts the fetch. The route handler passes
  `abortSignal: req.signal` into `streamText`, so the abort actually cancels
  the upstream Anthropic request too, not just the client-side read. The
  partial assistant message stays in `messages` — nothing gets rolled back —
  and the input re-enables so the next send works immediately.
- **Conversation state survives multiple turns**: `useChat` keeps the full
  `messages` array client-side and resends it (converted via
  `convertToModelMessages`) on every request.
- **API key server-side only**: see above — `ANTHROPIC_API_KEY` is read by
  `@ai-sdk/anthropic` in a module only imported by the route handler.
- **Usable at phone width**: `h-dvh` layout (correct on mobile Safari, unlike
  `100vh`), `env(safe-area-inset-bottom)` padding on the input so it clears
  the home indicator, and a textarea + button sized for touch targets.
- **Auto-scroll robustness**: `use-stick-to-bottom.ts` re-pins to the bottom
  on every render *only* while the user hasn't scrolled up (tracked via a
  scroll listener + threshold), and shows a "Jump to latest" pill the moment
  they're not at the bottom — tested by scrolling up mid-stream, not just
  after a message finishes.
- **No broken markdown mid-stream**: message text renders through
  `Streamdown`, which parses/animates markdown block-by-block instead of
  re-parsing the whole raw string on every token, so an unclosed code fence
  or a dangling `**` doesn't visually break while it's still arriving.

## Deploying (Vercel)

1. Push this repo to GitHub (see the main assignment thread for the
   step-by-step git commands — same flow as the playground repo).
2. Go to vercel.com → **Add New... → Project** → import the GitHub repo.
3. Vercel auto-detects Next.js; no build command changes needed.
4. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your real key
5. Deploy. The preview URL Vercel gives you is what you submit.

## Manual test checklist (what a reviewer will do)

- [ ] Send a message — thinking indicator appears, then fades into streamed
      text (not an abrupt swap).
- [ ] Send a message, then scroll up while it's still streaming — it should
      stop auto-scrolling immediately, and a "Jump to latest" pill appears.
- [ ] Click "Jump to latest" — scrolls smoothly back to the bottom and
      re-pins.
- [ ] Send a message, click Stop partway through — the partial text stays
      on screen, the input re-enables, and you can immediately send another
      message.
- [ ] Send at least 3 turns in a row — earlier turns stay visible and the
      model's replies stay contextually consistent with them.
- [ ] Resize to phone width (or open on an actual phone) — input stays
      reachable above the keyboard/home indicator, bubbles wrap instead of
      overflowing.


the project is realted to a intership of FlyRank AI
