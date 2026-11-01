import { afterEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { mount, type BubbleHandle } from "../src";
import { QubitBubble } from "../src/react";

const origin = "https://chat.example";
let handle: BubbleHandle | undefined;
const shadow = () => document.querySelector("qubit-rail-bubble")!.shadowRoot!;
const frame = () => shadow().querySelector("iframe")!;
const mockWindow = () => { const post = vi.fn(); Object.defineProperty(frame(), "contentWindow", { value: { postMessage: post }, configurable: true }); return post; };
const message = (type: string, fields: object = {}, from = origin, source: MessageEventSource | null = frame().contentWindow) => window.dispatchEvent(new MessageEvent("message", { origin: from, source, data: { source: "qubit-rail", v: 1, type, ...fields } }));
afterEach(() => { handle?.destroy(); handle = undefined; document.querySelector("qubit-rail-bubble")?.remove(); vi.restoreAllMocks(); });

describe("bubble", () => {
  it("mounts once, lazily creates and retains the iframe, and destroys", () => {
    handle = mount({ origin });
    expect(mount()).toBe(handle);
    expect(shadow().querySelector("iframe")).toBeNull();
    handle.open();
    const iframe = frame();
    expect(iframe.src).toBe(`${origin}/embed?agent=qos`);
    expect(iframe.title).toBe("QOS chat");
    expect(iframe.allow).toBe("clipboard-write");
    expect(shadow().activeElement).toBe(iframe);
    handle.close();
    expect(shadow().activeElement).toBe(shadow().querySelector("button"));
    handle.open();
    expect(frame()).toBe(iframe);
    handle.destroy();
    expect(document.querySelector("qubit-rail-bubble")).toBeNull();
    expect(mount()).not.toBe(handle);
    mount().destroy();
  });
  it("checks origin and source, clears unread on open, and handles close and Escape", () => {
    handle = mount({ origin }); handle.open(); mockWindow(); handle.close();
    const dot = shadow().querySelector<HTMLElement>(".dot")!;
    message("unread", { count: 2 }, "https://wrong.example");
    message("unread", { count: 2 }, origin, window);
    expect(dot.hidden).toBe(true);
    message("unread", { count: 2 });
    expect(dot.hidden).toBe(false);
    handle.open(); expect(dot.hidden).toBe(true);
    message("close", {}, "https://wrong.example"); expect(handle.isOpen).toBe(true);
    message("close"); expect(handle.isOpen).toBe(false);
    handle.open(); document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handle.isOpen).toBe(false);
  });
  it("replies to ready and context requests with merged defaults and trimmed selection", async () => {
    handle = mount({ origin, context: async () => ({ kind: "wiki-page", selection: "x".repeat(4001) }) }); handle.open();
    const post = mockWindow();
    message("ready");
    expect(post).toHaveBeenCalledWith({ source: "qubit-rail", v: 1, type: "opened" }, origin);
    message("context-request", { id: "a" });
    await waitFor(() => expect(post).toHaveBeenCalledWith({ source: "qubit-rail", v: 1, type: "context", id: "a", context: { url: location.href, title: document.title, kind: "wiki-page", selection: "x".repeat(4000) } }, origin));
  });
  it("tells the embed when the panel closes", () => {
    handle = mount({ origin }); handle.open();
    const post = mockWindow();
    handle.close();
    expect(post).toHaveBeenCalledWith({ source: "qubit-rail", v: 1, type: "closed" }, origin);
  });
  it("keeps defaults for context keys given as undefined", async () => {
    handle = mount({ origin, context: () => ({ url: undefined, kind: "qwork-doc", id: "f1" }) }); handle.open();
    const post = mockWindow();
    message("context-request", { id: "u" });
    await waitFor(() => expect(post).toHaveBeenCalledWith({ source: "qubit-rail", v: 1, type: "context", id: "u", context: { url: location.href, title: document.title, kind: "qwork-doc", id: "f1" } }, origin));
  });
  it("uses defaults when context throws", async () => {
    handle = mount({ origin, context: () => { throw new Error("oops"); } }); handle.open();
    const post = mockWindow();
    message("context-request", { id: 3 });
    await waitFor(() => expect(post).toHaveBeenCalledWith({ source: "qubit-rail", v: 1, type: "context", id: 3, context: { url: location.href, title: document.title, kind: "site-page" } }, origin));
  });
  it("mounts and unmounts the React wrapper and uses the latest context", async () => {
    const view = render(<QubitBubble origin={origin} context={() => ({ title: "old" })} />);
    shadow().querySelector("button")!.click();
    const post = mockWindow();
    view.rerender(<QubitBubble origin={origin} context={() => ({ title: "new" })} />);
    message("context-request", { id: 1 });
    await waitFor(() => expect(post).toHaveBeenCalledWith({ source: "qubit-rail", v: 1, type: "context", id: 1, context: { url: location.href, title: "new", kind: "site-page" } }, origin));
    view.unmount();
    expect(document.querySelector("qubit-rail-bubble")).toBeNull();
  });
});
