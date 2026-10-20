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
  buttons?: string[];
  receipt?: "sent" | "seen";
  canThumbUp?: boolean;
  thumbedUp?: boolean;
};

export type MarkdownRenderer = (text: string) => ReactNode;
