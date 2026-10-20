"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AwayNotice: () => AwayNotice,
  Composer: () => Composer,
  MessageList: () => MessageList,
  RailHeader: () => RailHeader,
  RailShell: () => RailShell,
  ThreadList: () => ThreadList,
  ThreadSwitcher: () => ThreadSwitcher,
  UnreadBadge: () => UnreadBadge
});
module.exports = __toCommonJS(index_exports);

// src/rail.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var urlPattern = /(https?:\/\/[^\s<>"']+)/g;
function LinkedText({ text }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: text.split(urlPattern).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;
    const href = part.replace(/[.,!?;:)]+$/, "");
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, target: "_blank", rel: "noreferrer", children: href }),
      part.slice(href.length)
    ] }, index);
  }) });
}
function UnreadBadge({ count }) {
  if (count < 1) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rail-unread", "aria-label": `${count} unread message${count === 1 ? "" : "s"}`, children: count > 99 ? "99+" : count });
}
function ThreadList({ threads, selectedId, busy = false, onChoose, emptyLabel = "No chats yet." }) {
  if (!threads.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "rail-status", children: emptyLabel });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rail-threads", "aria-label": "Chat threads", children: threads.map((thread) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: "rail-thread",
      "data-selected": thread.id === selectedId || void 0,
      disabled: busy,
      onClick: () => onChoose(thread.id),
      "aria-current": thread.id === selectedId ? "page" : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rail-thread-title", children: thread.title }),
        thread.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: thread.subtitle }),
        thread.updatedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", { children: thread.updatedAt }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnreadBadge, { count: thread.unreadCount ?? 0 })
      ]
    },
    thread.id
  )) });
}
function MessageList({ messages, busy = false, onSend, onThumbUp, renderMarkdown, emptyLabel = "No messages yet." }) {
  if (!messages.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "rail-status", children: emptyLabel });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rail-messages", "aria-live": "polite", children: messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { className: `rail-message rail-${message.role}`, children: [
    message.quote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", { className: "rail-quote", children: message.quote }),
    message.role === "agent" && message.authorName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "rail-author", children: message.authorName }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: message.role === "agent" ? "rail-markdown" : "rail-plain", children: message.role === "agent" && renderMarkdown ? renderMarkdown(message.text) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkedText, { text: message.text }) }),
    message.role === "agent" && message.buttons?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rail-chips", children: message.buttons.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => onSend?.(label), children: label }, label)) }) : null,
    message.canThumbUp && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "rail-thumb", disabled: busy, "aria-pressed": message.thumbedUp, "aria-label": "Helpful response", onClick: () => onThumbUp?.(message.id), children: "\u{1F44D}" }),
    message.receipt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rail-receipt", children: message.receipt === "seen" ? "Seen" : "Sent" })
  ] }, message.id)) });
}
function Composer({ onSend, quote, onClearQuote, sending = false, disabled = false, error, placeholder = "Message the agent" }) {
  const [text, setText] = (0, import_react.useState)("");
  const blocked = disabled || sending;
  const submit = (event) => {
    event?.preventDefault();
    const value = text.trim();
    if (!value || blocked) return;
    onSend(value);
    setText("");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", { className: "rail-composer", onSubmit: submit, children: [
    quote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rail-quote-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", { className: "rail-quote", children: quote }),
      onClearQuote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "rail-icon", "aria-label": "Remove quote", disabled: blocked, onClick: onClearQuote, children: "\xD7" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "textarea",
      {
        "aria-label": placeholder,
        placeholder,
        rows: 3,
        value: text,
        disabled: blocked,
        onChange: (event) => setText(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
          }
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rail-composer-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: sending ? "Sending\u2026" : "Enter to send \xB7 Shift+Enter for a new line" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "submit", disabled: blocked || !text.trim(), children: sending ? "Sending\u2026" : "Send" })
    ] }),
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "rail-error", role: "alert", children: error })
  ] });
}
function RailHeader({ title, subtitle, onClose }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "rail-header", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }),
      subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: subtitle })
    ] }),
    onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "rail-icon rail-close", "aria-label": "Close chat", onClick: onClose, children: "\xD7" })
  ] });
}
function ThreadSwitcher({ title = "Chats", onBack, onNew, busy = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rail-switcher", children: [
    onBack && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "rail-icon", "aria-label": "Back to threads", disabled: busy, onClick: onBack, children: "\u2190" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: title }),
    onNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "rail-new", disabled: busy, onClick: onNew, children: "New" })
  ] });
}
function AwayNotice({ children = "The agent may be offline; this chat has not been picked up yet." }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "rail-away", role: "status", children });
}
var focusable = 'button:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';
function RailShell({ children, label = "Chat", open, onOpenChange, triggerLabel = "Open chat", breakpoint = 1024 }) {
  const [narrow, setNarrow] = (0, import_react.useState)(false);
  const panel = (0, import_react.useRef)(null);
  const trigger = (0, import_react.useRef)(null);
  const headingId = (0, import_react.useId)();
  const sheetOpen = narrow && open;
  (0, import_react.useEffect)(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [breakpoint]);
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rail-shell", "data-open": sheetOpen || void 0, children: [
    narrow && !sheetOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { ref: trigger, type: "button", className: "rail-trigger", "aria-label": triggerLabel, "aria-expanded": false, onClick: () => onOpenChange(true), children: "Chat" }),
    sheetOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "rail-backdrop", "aria-label": "Close chat", onClick: () => onOpenChange(false) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { ref: panel, className: "rail", role: sheetOpen ? "dialog" : "complementary", "aria-modal": sheetOpen || void 0, "aria-label": label, "aria-labelledby": headingId, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { id: headingId, className: "rail-sr-only", children: label }),
      children
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AwayNotice,
  Composer,
  MessageList,
  RailHeader,
  RailShell,
  ThreadList,
  ThreadSwitcher,
  UnreadBadge
});
//# sourceMappingURL=index.js.map