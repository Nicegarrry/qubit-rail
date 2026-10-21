# @qubit/rail

Presentational React chat rail shared by qWork and qubit-site. It has no Next,
Convex, router, or data-fetching dependency: the host owns all state and passes
threads, messages, status, and callbacks as props.

```tsx
import { Composer, MessageList, RailHeader, RailShell, ThreadList } from "@qubit/rail";
import "@qubit/rail/style.css";

<RailShell open={open} onOpenChange={setOpen}>
  <RailHeader title="Page chat" onClose={() => setOpen(false)} />
  <ThreadList threads={threads} selectedId={threadId} onChoose={chooseThread} />
  <MessageList messages={messages} renderMarkdown={renderMarkdown} onSend={send} />
  <Composer quote={quote} onClearQuote={clearQuote} sending={sending} error={error} onSend={send} />
</RailShell>
```

Set the `--rail-*` variables on `.rail-shell` (for example `--rail-bg` and
`--rail-accent`) to apply a host theme. `RailShell` is a right rail on desktop
and a focus-trapped, Escape-closeable bottom sheet at its configurable 1024px
breakpoint. The committed `dist/` build makes git-dependency installs reliable
without relying on consumers to run lifecycle scripts.

`RailHeader` renders no close control without `onClose`. With `onClose`, the
control is shown on the mobile sheet; pass `closeOnDesktop` to show it in the
desktop rail too. `Composer` accepts a ref with `focus()` for returning focus
after a host handles a quick reply or Ask action, and defaults to a 20,000
character `maxLength`. Quick replies can be strings or `{ label, used }`;
used replies remain visible but are disabled and greyed out.
