import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AwayNotice, Composer, type ComposerHandle, MessageList, RailHeader, RailShell, ThreadList, ThreadSwitcher, UnreadBadge } from "../src";

afterEach(cleanup);

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
      { id: "a", role: "agent", text: "Hello", authorName: "qOS", quote: "Source", buttons: [{ label: "Previously asked", used: true }, "Continue"], canThumbUp: true, receipt: "seen" },
      { id: "p", role: "person", text: "See https://example.com", receipt: "sent" },
    ]} />);
    expect(screen.getByText("markdown: Hello")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://example.com" })).toHaveAttribute("href", "https://example.com");
    expect(screen.getByRole("button", { name: "Previously asked" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previously asked" })).toHaveAttribute("data-used");
    fireEvent.click(screen.getByRole("button", { name: "Continue" })); fireEvent.click(screen.getByRole("button", { name: "Helpful response" }));
    expect(send).toHaveBeenCalledWith("Continue"); expect(thumb).toHaveBeenCalledWith("a"); expect(screen.getByText("Seen")).toBeInTheDocument();
    render(<MessageList busy onSend={send} messages={[{ id: "busy", role: "agent", text: "Busy", buttons: ["Wait"] }]} />);
    expect(screen.getByRole("button", { name: "Wait" })).toBeDisabled();
  });

  it("sends on Enter, keeps a newline on Shift+Enter, and respects busy state", async () => {
    const send = vi.fn(); const clear = vi.fn();
    const { rerender } = render(<Composer onSend={send} quote="Quoted" onClearQuote={clear} />);
    const box = screen.getByRole("textbox");
    fireEvent.change(box, { target: { value: "Hello" } }); fireEvent.keyDown(box, { key: "Enter", isComposing: true });
    expect(send).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: "Enter" });
    expect(send).toHaveBeenCalledWith("Hello");
    await waitFor(() => expect(box).not.toBeDisabled());
    fireEvent.change(box, { target: { value: "one" } }); fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    expect(send).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Remove quote" })); expect(clear).toHaveBeenCalled();
    rerender(<Composer onSend={send} sending error="No connection" />);
    expect(screen.getByRole("textbox")).toBeDisabled(); expect(screen.getByRole("alert")).toHaveTextContent("No connection");
  });

  it("blurs on Escape without changing the draft or quote", () => {
    const send = vi.fn(); const clear = vi.fn();
    render(<Composer onSend={send} quote="Quoted" onClearQuote={clear} />);
    const box = screen.getByRole("textbox");
    fireEvent.change(box, { target: { value: "Draft message" } });
    box.focus(); expect(box).toHaveFocus();
    fireEvent.keyDown(box, { key: "Escape" });
    expect(box).not.toHaveFocus();
    expect(box).toHaveValue("Draft message");
    expect(screen.getByText("Quoted")).toBeInTheDocument();
    expect(send).not.toHaveBeenCalled(); expect(clear).not.toHaveBeenCalled();
  });

  it("awaits sends before clearing, keeps rejected text, supports limits and exposes focus", async () => {
    let resolve!: () => void;
    let reject!: (reason?: unknown) => void;
    const send = vi.fn()
      .mockImplementationOnce(() => new Promise<void>(done => { resolve = done; }))
      .mockImplementationOnce(() => new Promise<void>((_, fail) => { reject = fail; }));
    const ref = createRef<ComposerHandle>();
    render(<Composer ref={ref} onSend={send} maxLength={3} />);
    const box = screen.getByRole("textbox");
    expect(box).toHaveAttribute("maxlength", "3");
    ref.current?.focus(); expect(document.activeElement).toBe(box);
    fireEvent.change(box, { target: { value: "one" } }); fireEvent.submit(box.closest("form")!);
    expect(box).toHaveValue("one");
    resolve();
    await waitFor(() => expect(box).toHaveValue(""));
    fireEvent.change(box, { target: { value: "two" } }); fireEvent.submit(box.closest("form")!);
    reject(new Error("offline"));
    await waitFor(() => expect(box).toHaveValue("two"));
  });

  it("scrolls new and opened message lists to the bottom only while the reader is there", () => {
    const message = (id: string) => ({ id, role: "agent" as const, text: id });
    const { container, rerender } = render(<MessageList messages={[message("one")]} />);
    const list = container.querySelector<HTMLDivElement>(".rail-messages")!;
    Object.defineProperties(list, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1000 },
    });
    rerender(<MessageList messages={[message("one"), message("two")]} />);
    expect(list.scrollTop).toBe(1000);
    list.scrollTop = 200; fireEvent.scroll(list);
    rerender(<MessageList messages={[message("one"), message("two"), message("three")]} />);
    expect(list.scrollTop).toBe(200);
    list.scrollTop = 900; fireEvent.scroll(list);
    rerender(<MessageList messages={[message("one"), message("two"), message("three"), message("four")]} />);
    expect(list.scrollTop).toBe(1000);
  });

  it("keeps untrusted markdown text inert while linking only safe URLs", () => {
    const { container } = render(<MessageList messages={[{ id: "unsafe", role: "agent", text: '<a href="javascript:alert(1)">unsafe</a> https://example.com' }]} />);
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(container.textContent).toContain('<a href="javascript:alert(1)">unsafe</a>');
    expect(screen.getByRole("link", { name: "https://example.com" })).toHaveAttribute("href", "https://example.com");
  });

  it("renders the header, switcher and away notice callbacks", () => {
    const close = vi.fn(), back = vi.fn(), next = vi.fn();
    render(<><RailHeader title="Page chat" subtitle="A page" onClose={close} /><ThreadSwitcher title="Thread" onBack={back} onNew={next} /><AwayNotice>Waiting</AwayNotice></>);
    fireEvent.click(screen.getByRole("button", { name: "Close chat" })); fireEvent.click(screen.getByRole("button", { name: "Back to threads" })); fireEvent.click(screen.getByRole("button", { name: "New" }));
    expect(close).toHaveBeenCalledOnce(); expect(back).toHaveBeenCalledOnce(); expect(next).toHaveBeenCalledOnce(); expect(screen.getByRole("status")).toHaveTextContent("Waiting");
  });

  it("renders a close control only when supplied and marks the desktop option", () => {
    const { rerender } = render(<RailHeader title="No close" />);
    expect(screen.queryByRole("button", { name: "Close chat" })).not.toBeInTheDocument();
    rerender(<RailHeader title="Close" onClose={() => undefined} closeOnDesktop />);
    expect(screen.getByRole("button", { name: "Close chat" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveAttribute("data-close-on-desktop");
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

  it("closes the sheet when Escape bubbles from the composer", () => {
    Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
    function Example() { const [open, setOpen] = useState(true); return <RailShell open={open} onOpenChange={setOpen}><Composer onSend={() => undefined} /></RailShell>; }
    render(<Example />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const box = screen.getByRole("textbox"); box.focus(); expect(box).toHaveFocus();
    fireEvent.keyDown(box, { key: "Escape" }); expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
  });
});
