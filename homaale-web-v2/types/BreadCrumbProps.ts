export interface BreadcrumbProps {
    currentTitle: string;
    items?: BreadcrumbItems[];
}

export interface BreadcrumbItems {
    name: string;
    href: string;
}
