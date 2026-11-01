"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunk3D4AT25Wjs = require('./chunk-3D4AT25W.js');

// src/react.ts
var _react = require('react');
function QubitBubble(props) {
  const context = _react.useRef.call(void 0, props.context);
  context.current = props.context;
  const auth = _react.useRef.call(void 0, props.auth);
  auth.current = props.auth;
  _react.useEffect.call(void 0, () => {
    const bubble = _chunk3D4AT25Wjs.mount.call(void 0, { ...props, context: () => _nullishCoalesce(_optionalChain([context, 'access', _ => _.current, 'optionalCall', _2 => _2()]), () => ( {})), auth: props.auth ? () => _optionalChain([auth, 'access', _3 => _3.current, 'optionalCall', _4 => _4()]) : void 0 });
    return () => bubble.destroy();
  }, [props.agent, props.origin, props.label]);
  return null;
}


exports.QubitBubble = QubitBubble;
//# sourceMappingURL=react.js.map