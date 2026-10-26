import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { MarkdownRenderer, RailMessage, RailThread } from "./types";

const urlPattern = /(https?:\/\/[^\s<>"']+)/g;

function LinkedText({ text }: { text: string }) {
  return <>{text.split(urlPattern).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;
    const href = part.replace(/[.,!?;:)]+$/, "");
    return <span key={index}><a href={href} target="_blank" rel="noreferrer">{href}</a>{part.slice(href.length)}</span>;
  })}</>;
}

export function UnreadBadge({ count }: { count: number }) {
  if (count < 1) return null;
  return <span className="rail-unread" aria-label={`${count} unread message${count === 1 ? "" : "s"}`}>{count > 99 ? "99+" : count}</span>;
}

export function ThreadList({ threads, selectedId, busy = false, onChoose, emptyLabel = "No chats yet." }: {
  threads: RailThread[]; selectedId?: string | null; busy?: boolean; onChoose: (id: string) => void; emptyLabel?: string;
}) {
  if (!threads.length) return <p className="rail-status">{emptyLabel}</p>;
  return <div className="rail-threads" aria-label="Chat threads">{threads.map(thread => (
    <button type="button" className="rail-thread" data-selected={thread.id === selectedId || undefined} key={thread.id} disabled={busy}
      onClick={() => onChoose(thread.id)} aria-current={thread.id === selectedId ? "page" : undefined}>
      <span className="rail-thread-title">{thread.title}</span>
      {thread.subtitle && <small>{thread.subtitle}</small>}
      {thread.updatedAt && <time>{thread.updatedAt}</time>}
      <UnreadBadge count={thread.unreadCount ?? 0} />
    </button>
  ))}</div>;
}

export function MessageList({ messages, busy = false, onSend, onThumbUp, renderMarkdown, emptyLabel = "No messages yet." }: {
  messages: RailMessage[]; busy?: boolean; onSend?: (text: string) => void; onThumbUp?: (id: string) => void; renderMarkdown?: MarkdownRenderer; emptyLabel?: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  useLayoutEffect(() => {
    const element = list.current;
    if (element && stickToBottom.current) element.scrollTop = element.scrollHeight;
  }, [messages]);

  if (!messages.length) return <p className="rail-status">{emptyLabel}</p>;
  return <div ref={list} className="rail-messages" aria-live="polite" onScroll={() => {
    const element = list.current;
    if (element) stickToBottom.current = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
  }}>{messages.map(message => (
    <article className={`rail-message rail-${message.role}`} key={message.id}>
      {message.quote && <blockquote className="rail-quote">{message.quote}</blockquote>}
      {message.role === "agent" && message.authorName && <strong className="rail-author">{message.authorName}</strong>}
      <div className={message.role === "agent" ? "rail-markdown" : "rail-plain"}>{message.role === "agent" && renderMarkdown ? renderMarkdown(message.text) : <LinkedText text={message.text} />}</div>
      {message.role === "agent" && message.buttons?.length ? <div className="rail-chips">{message.buttons.map((button, index) => {
        const label = typeof button === "string" ? button : button.label;
        const used = typeof button === "string" ? false : button.used;
        return <button type="button" key={`${label}-${index}`} data-used={used || undefined} disabled={busy || used} onClick={() => onSend?.(label)}>{label}</button>;
      })}</div> : null}
      {message.canThumbUp && <button type="button" className="rail-thumb" disabled={busy} aria-pressed={message.thumbedUp} aria-label="Helpful response" onClick={() => onThumbUp?.(message.id)}>👍</button>}
      {message.receipt && <span className="rail-receipt">{message.receipt === "seen" ? "Seen" : "Sent"}</span>}
    </article>
  ))}</div>;
}

export type ComposerHandle = { focus: () => void };

export type ComposerProps = {
  onSend: (text: string) => void | Promise<void>;
  quote?: string;
  onClearQuote?: () => void;
  sending?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  maxLength?: number;
};

export const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer({ onSend, quote, onClearQuote, sending = false, disabled = false, error, placeholder = "Message the agent", maxLength = 20_000 }, ref) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const blocked = disabled || sending || submitting;
  useImperativeHandle(ref, () => ({ focus: () => textarea.current?.focus() }), []);
  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const value = text.trim();
    if (!value || blocked) return;
    setSubmitting(true);
    try {
      await onSend(value);
      setText("");
    } catch {
      // The host owns error presentation; retain text so the person can retry.
    } finally {
      setSubmitting(false);
    }
  };
  return <form className="rail-composer" onSubmit={submit}>
    {quote && <div className="rail-quote-row"><blockquote className="rail-quote">{quote}</blockquote>{onClearQuote && <button type="button" className="rail-icon" aria-label="Remove quote" disabled={blocked} onClick={onClearQuote}>×</button>}</div>}
    <textarea ref={textarea} aria-label={placeholder} placeholder={placeholder} rows={3} maxLength={maxLength} value={text} disabled={blocked} onChange={event => setText(event.target.value)}
      onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.blur(); } else if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submit(); } }} />
    <div className="rail-composer-end"><span>{sending || submitting ? "Sending…" : "Enter to send · Shift+Enter for a new line"}</span><button type="submit" disabled={blocked || !text.trim()}>{sending || submitting ? "Sending…" : "Send"}</button></div>
    {error && <p className="rail-error" role="alert">{error}</p>}
  </form>;
});

export function RailHeader({ title, subtitle, onClose, closeOnDesktop = false }: { title: string; subtitle?: string; onClose?: () => void; closeOnDesktop?: boolean }) {
  return <header className="rail-header" data-close-on-desktop={closeOnDesktop || undefined}><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{onClose && <button type="button" className="rail-icon rail-close" aria-label="Close chat" onClick={onClose}>×</button>}</header>;
}

export function ThreadSwitcher({ title = "Chats", onBack, onNew, busy = false }: { title?: string; onBack?: () => void; onNew?: () => void; busy?: boolean }) {
  return <div className="rail-switcher">{onBack && <button type="button" className="rail-icon" aria-label="Back to threads" disabled={busy} onClick={onBack}>←</button>}<h3>{title}</h3>{onNew && <button type="button" className="rail-new" disabled={busy} onClick={onNew}>New</button>}</div>;
}

export function AwayNotice({ children = "The agent may be offline; this chat has not been picked up yet." }: { children?: ReactNode }) {
  return <p className="rail-away" role="status">{children}</p>;
}

const focusable = 'button:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

export function RailShell({ children, label = "Chat", open, onOpenChange, triggerLabel = "Open chat", breakpoint = 1024 }: {
  children: ReactNode; label?: string; open: boolean; onOpenChange: (open: boolean) => void; triggerLabel?: string; breakpoint?: number;
}) {
  const [narrow, setNarrow] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const sheetOpen = narrow && open;

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setNarrow(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [breakpoint]);
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const initial = panel.current?.querySelector<HTMLElement>(focusable);
    initial?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onOpenChange(false); return; }
      if (event.key !== "Tab") return;
      const items = [...(panel.current?.querySelectorAll<HTMLElement>(focusable) ?? [])];
      const first = items[0], last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", onKeyDown); if (previous?.isConnected) previous.focus(); else trigger.current?.focus(); };
  }, [sheetOpen, onOpenChange]);

  return <div className="rail-shell" data-open={sheetOpen || undefined}>
    {narrow && !sheetOpen && <button ref={trigger} type="button" className="rail-trigger" aria-label={triggerLabel} aria-expanded={false} onClick={() => onOpenChange(true)}>Chat</button>}
    {sheetOpen && <button type="button" className="rail-backdrop" aria-label="Close chat" onClick={() => onOpenChange(false)} />}
    <aside ref={panel} className="rail" role={sheetOpen ? "dialog" : "complementary"} aria-modal={sheetOpen || undefined} aria-label={label} aria-labelledby={headingId}>
      <span id={headingId} className="rail-sr-only">{label}</span>{children}
    </aside>
  </div>;
}
