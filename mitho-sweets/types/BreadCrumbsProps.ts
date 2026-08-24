export interface BreadcrumbProps {
    currentTitle: string;
    items?: BreadcrumbItems[];
    className?: string;
}

export interface BreadcrumbItems {
    name: string;
    href: string;
}
