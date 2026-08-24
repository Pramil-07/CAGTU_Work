export interface ProductSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: ProductResult[];
}

export interface ProductResult {
    id?: number;
    name: string;
    thumbnail_image: string;
    status: string;
    is_active: boolean;
    added_by: string;
    model_no: string;
    video_url: string;
    product_status: string;
    warranty_type: string;
    warranty_period: string;
    stock_count: number;
    quantity_count: number;
    notes: string;
    meta_title: string;
    meta_discription: string;
    meta_keyword: string;
    rating: {
        rating__avg: number;
        count: number;
    };
    user: string;
    brand: {
        name: string;
        image: string;
    };
    category: {
        name: string;
    };
    stock: {
        price: number;
        mrp: number;
        discount: number;
    };
}
