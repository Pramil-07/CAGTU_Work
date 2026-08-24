export type CategoryDropdownProps = {
    total_pages: number;
    count: number;
    current: number;
    next: string;
    previous: any;
    page_size: number;
    result: Array<{
        id: number;
        name: string;
        slug: string;
        icon: string;
    }>;
};
