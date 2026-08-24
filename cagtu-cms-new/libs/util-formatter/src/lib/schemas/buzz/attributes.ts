export interface AttributesSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: AttributesResult[];
}

export interface AttributesResult {
    id?: number | null;
    name: string;
    type: string;
    options?: string[];
    unit: string;
    info: string | null;
    category_count?: number;
    slug?: string;
}
export interface ProductAttributesResult {
    attribute: number;
    value: string;
}
