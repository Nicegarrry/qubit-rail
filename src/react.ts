import { useEffect, useRef } from "react";
import { mount, type BubbleOptions } from "./index";

export function QubitBubble(props: BubbleOptions): null {
  const context = useRef(props.context);
  context.current = props.context;
  useEffect(() => {
    const bubble = mount({ ...props, context: () => context.current?.() ?? {} });
    return () => bubble.destroy();
  }, [props.agent, props.origin, props.label]);
  return null;
}
