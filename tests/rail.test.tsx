import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AwayNotice, Composer, MessageList, RailHeader, RailShell, ThreadList, ThreadSwitcher, UnreadBadge } from "../src";

describe("rail components", () => {
  it("chooses a thread and shows unread state", () => {
    const choose = vi.fn();
    render(<ThreadList selectedId="one" onChoose={choose} threads={[{ id: "one", title: "First", unreadCount: 2, updatedAt: "Now" }]} />);
    fireEvent.click(screen.getByRole("button", { name: /first/i }));
    expect(choose).toHaveBeenCalledWith("one");
    expect(screen.getByLabelText("2 unread messages")).toBeInTheDocument();
    expect(render(<UnreadBadge count={0} />).container).toBeEmptyDOMElement();
  });

  it("renders messages, injected markdown, links, chips and receipts", () => {
    const send = vi.fn(); const thumb = vi.fn();
    render(<MessageList onSend={send} onThumbUp={thumb} renderMarkdown={text => <em>markdown: {text}</em>} messages={[
      { id: "a", role: "agent", text: "Hello", authorName: "qOS", quote: "Source", buttons: ["Continue"], canThumbUp: true, receipt: "seen" },
      { id: "p", role: "person", text: "See https://example.com", receipt: "sent" },
    ]} />);
    expect(screen.getByText("markdown: Hello")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://example.com" })).toHaveAttribute("href", "https://example.com");
    fireEvent.click(screen.getByRole("button", { name: "Continue" })); fireEvent.click(screen.getByRole("button", { name: "Helpful response" }));
    expect(send).toHaveBeenCalledWith("Continue"); expect(thumb).toHaveBeenCalledWith("a"); expect(screen.getByText("Seen")).toBeInTheDocument();
    render(<MessageList busy onSend={send} messages={[{ id: "busy", role: "agent", text: "Busy", buttons: ["Wait"] }]} />);
    expect(screen.getByRole("button", { name: "Wait" })).toBeDisabled();
  });

  it("sends on Enter, keeps a newline on Shift+Enter, and respects busy state", () => {
    const send = vi.fn(); const clear = vi.fn();
    const { rerender } = render(<Composer onSend={send} quote="Quoted" onClearQuote={clear} />);
    const box = screen.getByRole("textbox");
    fireEvent.change(box, { target: { value: "Hello" } }); fireEvent.keyDown(box, { key: "Enter" });
    expect(send).toHaveBeenCalledWith("Hello");
    fireEvent.change(box, { target: { value: "one" } }); fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    expect(send).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Remove quote" })); expect(clear).toHaveBeenCalled();
    rerender(<Composer onSend={send} sending error="No connection" />);
    expect(screen.getByRole("textbox")).toBeDisabled(); expect(screen.getByRole("alert")).toHaveTextContent("No connection");
  });

  it("renders the header, switcher and away notice callbacks", () => {
    const close = vi.fn(), back = vi.fn(), next = vi.fn();
    render(<><RailHeader title="Page chat" subtitle="A page" onClose={close} /><ThreadSwitcher title="Thread" onBack={back} onNew={next} /><AwayNotice>Waiting</AwayNotice></>);
    fireEvent.click(screen.getByRole("button", { name: "Close chat" })); fireEvent.click(screen.getByRole("button", { name: "Back to threads" })); fireEvent.click(screen.getByRole("button", { name: "New" }));
    expect(close).toHaveBeenCalledOnce(); expect(back).toHaveBeenCalledOnce(); expect(next).toHaveBeenCalledOnce(); expect(screen.getByRole("status")).toHaveTextContent("Waiting");
  });

  it("traps sheet focus and closes on Escape", () => {
    Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
    function Example() { const [open, setOpen] = useState(true); return <RailShell open={open} onOpenChange={setOpen}><button>First</button><button>Last</button></RailShell>; }
    render(<Example />);
    const first = screen.getByRole("button", { name: "First" }); const last = screen.getByRole("button", { name: "Last" });
    first.focus(); fireEvent.keyDown(document, { key: "Tab", shiftKey: true }); expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: "Escape" }); expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
  });
});
