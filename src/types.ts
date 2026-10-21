import type { ReactNode } from "react";

export type RailThread = {
  id: string;
  title: string;
  updatedAt?: string;
  subtitle?: string;
  unreadCount?: number;
};

export type RailMessage = {
  id: string;
  role: "agent" | "person";
  text: string;
  authorName?: string;
  quote?: string;
  buttons?: RailQuickReply[];
  receipt?: "sent" | "seen";
  canThumbUp?: boolean;
  thumbedUp?: boolean;
};

/** A quick reply may be kept visible after use so its conversational context remains clear. */
export type RailQuickReply = string | {
  label: string;
  used?: boolean;
};

export type MarkdownRenderer = (text: string) => ReactNode;
