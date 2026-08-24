export interface BrandSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: BrandResult[];
}

export interface BrandResult {
    id?: number;
    slug: string;
    name: string;
    image: unknown[];
    banner: string;
}
