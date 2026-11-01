import { useEffect, useRef } from "react";
import { mount, type BubbleOptions } from "./index";

export function QubitBubble(props: BubbleOptions): null {
  const context = useRef(props.context);
  context.current = props.context;
  const auth = useRef(props.auth);
  auth.current = props.auth;
  useEffect(() => {
    const bubble = mount({ ...props, context: () => context.current?.() ?? {}, auth: props.auth ? () => auth.current?.() : undefined });
    return () => bubble.destroy();
  }, [props.agent, props.origin, props.label]);
  return null;
}
