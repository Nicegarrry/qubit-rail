type PageContext = {
    url: string;
    title: string;
    kind: "wiki-page" | "qwork-doc" | "qwork-deck" | "site-page";
    id?: string;
    selection?: string;
    extra?: Record<string, string>;
};
type BubbleOptions = {
    agent?: "qos";
    origin?: string;
    context?: () => Partial<PageContext> | Promise<Partial<PageContext>>;
    label?: string;
};
type BubbleHandle = {
    open(): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    readonly isOpen: boolean;
};
declare function mount(options?: BubbleOptions, target?: HTMLElement): BubbleHandle;

export { type BubbleHandle, type BubbleOptions, type PageContext, mount };
