import type { ReactNode } from "react";

export type CollapsedNavLinkProps = {
    icon: React.FC<any>;
    label: string;
    active?: boolean;
    onClick?(): void;
    link: string;
    id: string;
};
