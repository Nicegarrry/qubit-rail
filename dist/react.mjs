import {
  mount
} from "./chunk-OX6KLHT4.mjs";

// src/react.ts
import { useEffect, useRef } from "react";
function QubitBubble(props) {
  const context = useRef(props.context);
  context.current = props.context;
  useEffect(() => {
    const bubble = mount({ ...props, context: () => context.current?.() ?? {} });
    return () => bubble.destroy();
  }, [props.agent, props.origin, props.label]);
  return null;
}
export {
  QubitBubble
};
//# sourceMappingURL=react.mjs.map