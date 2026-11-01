"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } async function _asyncNullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return await rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/index.ts
var mounted;
var chatIcon = '<path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />';
var closeIcon = '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />';
var css = `
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; }
button { position: fixed; right: var(--qubit-rail-right, 24px); bottom: var(--qubit-rail-bottom, 24px); width: 56px; height: 56px; border: 0; border-radius: 50%; background: #111; color: white; display: grid; place-items: center; cursor: pointer; z-index: 2147483647; }
button svg { width: 24px; height: 24px; }
.dot { position: absolute; top: 3px; right: 3px; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; background: #ed493d; }
[hidden] { display: none !important; }
.panel { position: fixed; right: var(--qubit-rail-right, 24px); bottom: calc(var(--qubit-rail-bottom, 24px) + 72px); width: 400px; height: min(640px, 100vh - 112px); border-radius: 16px; overflow: hidden; background: white; box-shadow: 0 12px 40px rgba(0,0,0,.2); z-index: 2147483646; }
iframe { display: block; width: 100%; height: 100%; border: 0; }
@media (max-width: 639px) { .panel { inset: 0; width: 100%; height: 100%; border-radius: 0; } :host([open]) button { display: none; } }
`;
function mount(options = {}, target = document.body) {
  if (mounted) return mounted;
  const origin = _nullishCoalesce(options.origin, () => ( "https://qos.qubitstudio.app"));
  const expectedOrigin = new URL(origin).origin;
  const host = document.createElement("qubit-rail-bubble");
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${css}</style><div class="panel" hidden></div><button type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${chatIcon}</svg><span class="dot" hidden></span></button>`;
  const button = shadow.querySelector("button");
  const svg = shadow.querySelector("svg");
  const dot = shadow.querySelector(".dot");
  const panel = shadow.querySelector(".panel");
  button.setAttribute("aria-label", _nullishCoalesce(options.label, () => ( "Chat with QOS")));
  button.setAttribute("aria-expanded", "false");
  let iframe;
  let isOpen = false;
  let destroyed = false;
  const send = (type, fields = {}) => _optionalChain([iframe, 'optionalAccess', _ => _.contentWindow, 'optionalAccess', _2 => _2.postMessage, 'call', _3 => _3({ source: "qubit-rail", v: 1, type, ...fields }, expectedOrigin)]);
  const open = () => {
    if (destroyed || isOpen) return;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.src = `${origin.replace(/\/$/, "")}/embed?agent=${_nullishCoalesce(options.agent, () => ( "qos"))}`;
      iframe.title = "QOS chat";
      iframe.allow = "clipboard-write";
      panel.append(iframe);
    }
    isOpen = true;
    host.setAttribute("open", "");
    panel.hidden = false;
    dot.hidden = true;
    svg.innerHTML = closeIcon;
    button.setAttribute("aria-expanded", "true");
    send("opened");
    iframe.focus();
  };
  const close = () => {
    if (destroyed || !isOpen) return;
    isOpen = false;
    host.removeAttribute("open");
    panel.hidden = true;
    svg.innerHTML = chatIcon;
    button.setAttribute("aria-expanded", "false");
    send("closed");
    button.focus();
  };
  const onMessage = async (event) => {
    if (!_optionalChain([iframe, 'optionalAccess', _4 => _4.contentWindow]) || event.origin !== expectedOrigin || event.source !== iframe.contentWindow) return;
    const data = event.data;
    if (!data || data.source !== "qubit-rail" || data.v !== 1) return;
    if (data.type === "ready" && isOpen) send("opened");
    if (data.type === "close") close();
    if (data.type === "unread") dot.hidden = isOpen || !(data.count > 0);
    if (data.type === "context-request") {
      const defaults = { url: location.href, title: document.title, kind: "site-page" };
      let context = defaults;
      try {
        const given = await _asyncNullishCoalesce(await _optionalChain([options, 'access', _5 => _5.context, 'optionalCall', _6 => _6()]), async () => ( {}));
        context = { ...defaults, ...Object.fromEntries(Object.entries(given).filter(([, value]) => value !== void 0)) };
        if (context.selection !== void 0) context.selection = context.selection.slice(0, 4e3);
      } catch (e) {
        context = defaults;
      }
      if (!destroyed) send("context", { id: data.id, context });
    }
  };
  const onKeydown = (event) => {
    if (event.key === "Escape") close();
  };
  const handle = {
    open,
    close,
    toggle: () => isOpen ? close() : open(),
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      isOpen = false;
      window.removeEventListener("message", onMessage);
      document.removeEventListener("keydown", onKeydown);
      host.remove();
      if (mounted === handle) mounted = void 0;
    },
    get isOpen() {
      return isOpen;
    }
  };
  button.addEventListener("click", handle.toggle);
  window.addEventListener("message", onMessage);
  document.addEventListener("keydown", onKeydown);
  target.append(host);
  mounted = handle;
  return handle;
}



exports.mount = mount;
//# sourceMappingURL=chunk-KR5X3OFK.js.map