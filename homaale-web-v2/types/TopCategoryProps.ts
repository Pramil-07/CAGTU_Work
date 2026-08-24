export type TopCategoryProps = {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Array<{
        id: number;
        category: string;
        slug: string;
        icon: string;
        main_id?:string
    }>;
};
