import {
  mount
} from "./chunk-OC57BTSE.mjs";

// src/react.ts
import { useEffect, useRef } from "react";
function QubitBubble(props) {
  const context = useRef(props.context);
  context.current = props.context;
  const auth = useRef(props.auth);
  auth.current = props.auth;
  useEffect(() => {
    const bubble = mount({ ...props, context: () => context.current?.() ?? {}, auth: props.auth ? () => auth.current?.() : void 0 });
    return () => bubble.destroy();
  }, [props.agent, props.origin, props.label]);
  return null;
}
export {
  QubitBubble
};
//# sourceMappingURL=react.mjs.map