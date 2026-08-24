 export interface ProductProps {
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    result: {
        id: number;
        name: string;
        description: string;
        slug: string;
        type: string;
        is_active: boolean;
        is_bookmarked: boolean;
        status: string;
        created_at: string;
        currency : {
            code: string;
            current_value: number | string;
            enable_currency_configuration: boolean;
            is_active: boolean;
            is_default: boolean;
            name: string;
            supports_stripe: boolean;
            symbol: string;
        };
        updated_at: string;
        added_by: string;
        model_no: string | null;
        meta_title: string | null;
        meta_description: string | null;
        meta_keyword: string | null;
        notes: string | null;
        warranty_type: string | null;
        warranty_period: string | null;
        video_url: string | null;
        images: {
            id: number;
            image: string;
        }[];
        product_status: string;
        brand: string | null;
        category: {
            id: number;
            name: string;
            parent: string | null;
            slug: string;
        };
        rating: {
            rating__avg: number | null;
            count: number;
        };
        stock: {
            id: number;
            price: number;
            mrp: number;
            slug: string;
            discount: number;
            stock_attributes: [];
        };
        product_attributes: [];
    }[];
}