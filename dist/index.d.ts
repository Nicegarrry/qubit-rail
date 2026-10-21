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
    buttons?: RailQuickReply[];
    receipt?: "sent" | "seen";
    canThumbUp?: boolean;
    thumbedUp?: boolean;
};
/** A quick reply may be kept visible after use so its conversational context remains clear. */
type RailQuickReply = string | {
    label: string;
    used?: boolean;
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
type ComposerHandle = {
    focus: () => void;
};
type ComposerProps = {
    onSend: (text: string) => void | Promise<void>;
    quote?: string;
    onClearQuote?: () => void;
    sending?: boolean;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    maxLength?: number;
};
declare const Composer: react.ForwardRefExoticComponent<ComposerProps & react.RefAttributes<ComposerHandle>>;
declare function RailHeader({ title, subtitle, onClose, closeOnDesktop }: {
    title: string;
    subtitle?: string;
    onClose?: () => void;
    closeOnDesktop?: boolean;
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

export { AwayNotice, Composer, type ComposerHandle, type ComposerProps, type MarkdownRenderer, MessageList, RailHeader, type RailMessage, type RailQuickReply, RailShell, type RailThread, ThreadList, ThreadSwitcher, UnreadBadge };
