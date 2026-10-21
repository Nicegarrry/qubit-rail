import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { AwayNotice, Composer, MessageList, RailHeader, RailShell, ThreadList, ThreadSwitcher } from "../src";
import "./example.css";

function Example() {
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<string | null>(null);
  const [quote, setQuote] = useState("A selected passage from the host page.");
  return <main className="example"><section><h1>Page content</h1><p>The host controls threads, messages, routes and mutations. This static page only demonstrates the shared presentation layer.</p></section>
    <RailShell open={open} onOpenChange={setOpen} label="Page chat"><RailHeader title="Page chat" subtitle="Design notes" onClose={() => setOpen(false)} />
      <ThreadSwitcher title={thread ? "Design notes" : "Chats"} onBack={thread ? () => setThread(null) : undefined} onNew={() => setThread("new")} />
      {!thread ? <ThreadList selectedId={thread} onChoose={setThread} threads={[{ id: "design", title: "Design notes", subtitle: "From a selection", updatedAt: "Just now", unreadCount: 2 }, { id: "launch", title: "Launch questions", updatedAt: "18m ago" }]} /> : <MessageList onSend={() => undefined} renderMarkdown={text => <p>{text}</p>} messages={[{ id: "1", role: "agent", authorName: "qOS", text: "I can help turn this into a concise decision.", quote, buttons: [{ label: "Draft a summary", used: true }, "Find risks"], canThumbUp: true }, { id: "2", role: "person", text: "Please make it practical.", receipt: "seen" }]} />}
      <AwayNotice />{thread && <Composer quote={quote} onClearQuote={() => setQuote("")} onSend={() => undefined} />}
    </RailShell></main>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><Example /></StrictMode>);
