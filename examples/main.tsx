import { createRoot } from "react-dom/client";
import { QubitBubble } from "../src/react";
import "./example.css";

createRoot(document.getElementById("root")!).render(
  <main className="example">
    <section><p className="eyebrow">QUBIT STUDIO</p><h1>Ideas, in context.</h1><p>Chat with QOS about the page you are looking at. Open the bubble to see the embedded chat.</p></section>
    <QubitBubble origin="https://qos.example.test" />
  </main>,
);
