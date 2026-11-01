# @qubit/rail

A small, isolated bubble that opens the QOS embedded chat in a floating iframe. The plain DOM entry has no runtime dependencies; React is an optional peer. The host must render the bubble only for signed-in Qubit people.

```sh
pnpm add github:Nicegarrry/qubit-rail#v1.0.0
```

Plain DOM:

```ts
import { mount } from "@qubit/rail";

const bubble = mount({ context: () => ({ kind: "wiki-page", id: "page-1" }) });
bubble.open(); // also: close(), toggle(), isOpen, destroy()
```

React:

```tsx
import { QubitBubble } from "@qubit/rail/react";

<QubitBubble context={() => ({ kind: "qwork-doc", id: documentId })} />
```

Both accept `agent` (defaults to `"qos"`), `origin` (defaults to `https://qos.qubitstudio.app`), `label` (defaults to `"Chat with QOS"`), and a synchronous or asynchronous `context` callback. Context defaults to the current URL, document title, and `kind: "site-page"`; optional fields are `id`, `selection`, and `extra` (a string map). Selection is limited to 4,000 characters. `mount` accepts an optional target element as its second argument and returns the existing handle if already mounted.

The iframe loads `/embed?agent=qos` on the configured origin. All messages are objects with `source: "qubit-rail"`, `v: 1`, and `type`. Only messages from the configured origin and the iframe window are accepted; replies use that origin as their target.

- Embed → host: `ready`, `context-request` with `id`, `unread` with `count`, `close`, and `signed-out`.
- Host → embed: `opened` on each open and in reply to `ready` while open; `context` with the request `id` and merged `context` in reply to `context-request`. If the callback fails, the defaults are sent.

The embed owns sign-in UI; the host controls whether the bubble is rendered. The iframe is created on first open and retained until destruction.
