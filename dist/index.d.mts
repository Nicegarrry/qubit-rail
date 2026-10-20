import * as react from 'react';
import { ReactNode } from 'react';

type RailThread = {
    id: string;
    title: string;
    updatedAt?: string;
    subtitle?: string;
    unreadCount?: number;
};
type RailMessage = {
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
type MarkdownRenderer = (text: string) => ReactNode;

declare function UnreadBadge({ count }: {
    count: number;
}): react.JSX.Element | null;
declare function ThreadList({ threads, selectedId, busy, onChoose, emptyLabel }: {
    threads: RailThread[];
    selectedId?: string | null;
    busy?: boolean;
    onChoose: (id: string) => void;
    emptyLabel?: string;
}): react.JSX.Element;
declare function MessageList({ messages, busy, onSend, onThumbUp, renderMarkdown, emptyLabel }: {
    messages: RailMessage[];
    busy?: boolean;
    onSend?: (text: string) => void;
    onThumbUp?: (id: string) => void;
    renderMarkdown?: MarkdownRenderer;
    emptyLabel?: string;
}): react.JSX.Element;
declare function Composer({ onSend, quote, onClearQuote, sending, disabled, error, placeholder }: {
    onSend: (text: string) => void | Promise<void>;
    quote?: string;
    onClearQuote?: () => void;
    sending?: boolean;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
}): react.JSX.Element;
declare function RailHeader({ title, subtitle, onClose }: {
    title: string;
    subtitle?: string;
    onClose?: () => void;
}): react.JSX.Element;
declare function ThreadSwitcher({ title, onBack, onNew, busy }: {
    title?: string;
    onBack?: () => void;
    onNew?: () => void;
    busy?: boolean;
}): react.JSX.Element;
declare function AwayNotice({ children }: {
    children?: ReactNode;
}): react.JSX.Element;
declare function RailShell({ children, label, open, onOpenChange, triggerLabel, breakpoint }: {
    children: ReactNode;
    label?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    triggerLabel?: string;
    breakpoint?: number;
}): react.JSX.Element;

export { AwayNotice, Composer, type MarkdownRenderer, MessageList, RailHeader, type RailMessage, RailShell, type RailThread, ThreadList, ThreadSwitcher, UnreadBadge };
