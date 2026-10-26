// src/rail.tsx
import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var urlPattern = /(https?:\/\/[^\s<>"']+)/g;
function LinkedText({ text }) {
  return /* @__PURE__ */ jsx(Fragment, { children: text.split(urlPattern).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;
    const href = part.replace(/[.,!?;:)]+$/, "");
    return /* @__PURE__ */ jsxs("span", { children: [
      /* @__PURE__ */ jsx("a", { href, target: "_blank", rel: "noreferrer", children: href }),
      part.slice(href.length)
    ] }, index);
  }) });
}
function UnreadBadge({ count }) {
  if (count < 1) return null;
  return /* @__PURE__ */ jsx("span", { className: "rail-unread", "aria-label": `${count} unread message${count === 1 ? "" : "s"}`, children: count > 99 ? "99+" : count });
}
function ThreadList({ threads, selectedId, busy = false, onChoose, emptyLabel = "No chats yet." }) {
  if (!threads.length) return /* @__PURE__ */ jsx("p", { className: "rail-status", children: emptyLabel });
  return /* @__PURE__ */ jsx("div", { className: "rail-threads", "aria-label": "Chat threads", children: threads.map((thread) => /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className: "rail-thread",
      "data-selected": thread.id === selectedId || void 0,
      disabled: busy,
      onClick: () => onChoose(thread.id),
      "aria-current": thread.id === selectedId ? "page" : void 0,
      children: [
        /* @__PURE__ */ jsx("span", { className: "rail-thread-title", children: thread.title }),
        thread.subtitle && /* @__PURE__ */ jsx("small", { children: thread.subtitle }),
        thread.updatedAt && /* @__PURE__ */ jsx("time", { children: thread.updatedAt }),
        /* @__PURE__ */ jsx(UnreadBadge, { count: thread.unreadCount ?? 0 })
      ]
    },
    thread.id
  )) });
}
function MessageList({ messages, busy = false, onSend, onThumbUp, renderMarkdown, emptyLabel = "No messages yet." }) {
  const list = useRef(null);
  const stickToBottom = useRef(true);
  useLayoutEffect(() => {
    const element = list.current;
    if (element && stickToBottom.current) element.scrollTop = element.scrollHeight;
  }, [messages]);
  if (!messages.length) return /* @__PURE__ */ jsx("p", { className: "rail-status", children: emptyLabel });
  return /* @__PURE__ */ jsx("div", { ref: list, className: "rail-messages", "aria-live": "polite", onScroll: () => {
    const element = list.current;
    if (element) stickToBottom.current = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
  }, children: messages.map((message) => /* @__PURE__ */ jsxs("article", { className: `rail-message rail-${message.role}`, children: [
    message.quote && /* @__PURE__ */ jsx("blockquote", { className: "rail-quote", children: message.quote }),
    message.role === "agent" && message.authorName && /* @__PURE__ */ jsx("strong", { className: "rail-author", children: message.authorName }),
    /* @__PURE__ */ jsx("div", { className: message.role === "agent" ? "rail-markdown" : "rail-plain", children: message.role === "agent" && renderMarkdown ? renderMarkdown(message.text) : /* @__PURE__ */ jsx(LinkedText, { text: message.text }) }),
    message.role === "agent" && message.buttons?.length ? /* @__PURE__ */ jsx("div", { className: "rail-chips", children: message.buttons.map((button, index) => {
      const label = typeof button === "string" ? button : button.label;
      const used = typeof button === "string" ? false : button.used;
      return /* @__PURE__ */ jsx("button", { type: "button", "data-used": used || void 0, disabled: busy || used, onClick: () => onSend?.(label), children: label }, `${label}-${index}`);
    }) }) : null,
    message.canThumbUp && /* @__PURE__ */ jsx("button", { type: "button", className: "rail-thumb", disabled: busy, "aria-pressed": message.thumbedUp, "aria-label": "Helpful response", onClick: () => onThumbUp?.(message.id), children: "\u{1F44D}" }),
    message.receipt && /* @__PURE__ */ jsx("span", { className: "rail-receipt", children: message.receipt === "seen" ? "Seen" : "Sent" })
  ] }, message.id)) });
}
var Composer = forwardRef(function Composer2({ onSend, quote, onClearQuote, sending = false, disabled = false, error, placeholder = "Message the agent", maxLength = 2e4 }, ref) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textarea = useRef(null);
  const blocked = disabled || sending || submitting;
  useImperativeHandle(ref, () => ({ focus: () => textarea.current?.focus() }), []);
  const submit = async (event) => {
    event?.preventDefault();
    const value = text.trim();
    if (!value || blocked) return;
    setSubmitting(true);
    try {
      await onSend(value);
      setText("");
    } catch {
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { className: "rail-composer", onSubmit: submit, children: [
    quote && /* @__PURE__ */ jsxs("div", { className: "rail-quote-row", children: [
      /* @__PURE__ */ jsx("blockquote", { className: "rail-quote", children: quote }),
      onClearQuote && /* @__PURE__ */ jsx("button", { type: "button", className: "rail-icon", "aria-label": "Remove quote", disabled: blocked, onClick: onClearQuote, children: "\xD7" })
    ] }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        ref: textarea,
        "aria-label": placeholder,
        placeholder,
        rows: 3,
        maxLength,
        value: text,
        disabled: blocked,
        onChange: (event) => setText(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Escape") {
            event.currentTarget.blur();
          } else if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void submit();
          }
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "rail-composer-end", children: [
      /* @__PURE__ */ jsx("span", { children: sending || submitting ? "Sending\u2026" : "Enter to send \xB7 Shift+Enter for a new line" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: blocked || !text.trim(), children: sending || submitting ? "Sending\u2026" : "Send" })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "rail-error", role: "alert", children: error })
  ] });
});
function RailHeader({ title, subtitle, onClose, closeOnDesktop = false }) {
  return /* @__PURE__ */ jsxs("header", { className: "rail-header", "data-close-on-desktop": closeOnDesktop || void 0, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { children: subtitle })
    ] }),
    onClose && /* @__PURE__ */ jsx("button", { type: "button", className: "rail-icon rail-close", "aria-label": "Close chat", onClick: onClose, children: "\xD7" })
  ] });
}
function ThreadSwitcher({ title = "Chats", onBack, onNew, busy = false }) {
  return /* @__PURE__ */ jsxs("div", { className: "rail-switcher", children: [
    onBack && /* @__PURE__ */ jsx("button", { type: "button", className: "rail-icon", "aria-label": "Back to threads", disabled: busy, onClick: onBack, children: "\u2190" }),
    /* @__PURE__ */ jsx("h3", { children: title }),
    onNew && /* @__PURE__ */ jsx("button", { type: "button", className: "rail-new", disabled: busy, onClick: onNew, children: "New" })
  ] });
}
function AwayNotice({ children = "The agent may be offline; this chat has not been picked up yet." }) {
  return /* @__PURE__ */ jsx("p", { className: "rail-away", role: "status", children });
}
var focusable = 'button:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';
function RailShell({ children, label = "Chat", open, onOpenChange, triggerLabel = "Open chat", breakpoint = 1024 }) {
  const [narrow, setNarrow] = useState(false);
  const panel = useRef(null);
  const trigger = useRef(null);
  const headingId = useId();
  const sheetOpen = narrow && open;
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [breakpoint]);
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.activeElement;
    const initial = panel.current?.querySelector(focusable);
    initial?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = [...panel.current?.querySelectorAll(focusable) ?? []];
      const first = items[0], last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previous?.isConnected) previous.focus();
      else trigger.current?.focus();
    };
  }, [sheetOpen, onOpenChange]);
  return /* @__PURE__ */ jsxs("div", { className: "rail-shell", "data-open": sheetOpen || void 0, children: [
    narrow && !sheetOpen && /* @__PURE__ */ jsx("button", { ref: trigger, type: "button", className: "rail-trigger", "aria-label": triggerLabel, "aria-expanded": false, onClick: () => onOpenChange(true), children: "Chat" }),
    sheetOpen && /* @__PURE__ */ jsx("button", { type: "button", className: "rail-backdrop", "aria-label": "Close chat", onClick: () => onOpenChange(false) }),
    /* @__PURE__ */ jsxs("aside", { ref: panel, className: "rail", role: sheetOpen ? "dialog" : "complementary", "aria-modal": sheetOpen || void 0, "aria-label": label, "aria-labelledby": headingId, children: [
      /* @__PURE__ */ jsx("span", { id: headingId, className: "rail-sr-only", children: label }),
      children
    ] })
  ] });
}
export {
  AwayNotice,
  Composer,
  MessageList,
  RailHeader,
  RailShell,
  ThreadList,
  ThreadSwitcher,
  UnreadBadge
};
//# sourceMappingURL=index.mjs.map