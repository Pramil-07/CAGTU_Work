export interface CategorySchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: CategoryResult[];
}

export interface SubCategorySchema extends CategorySchema {
    result: CategoryResult[];
}

export interface SubCategoryResult {
    id?: number | null;
    name: string;
    parent?: {
        id: number;
        name: string;
        icon: string;
    };
}

export interface CategoryResult {
    id: string;
    name: string;
    icon?: string;
}
export interface SubCategoriesFormValueProps {
    id?: number | null;
    name: string;
    parent?: number | null;
    product_attribute?: string[];
    stock_attribute?: string[];
}

// Category Listing
export interface CategoriesListProps {
    id: string;
    name: string;
    sub_category: {
        id: string;
        name: string;
        sub_sub_category: {
            id: string;
            name: string;
        }[];
    }[];
}
