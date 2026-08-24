export interface ProductDetailProps {
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    result: {
        id: number;
        stocks: Array<{
                id: number;
                stock_attributes: [];
                created_at: number | string;
                updated_at: number | string;
                status: string;
                slug: string;
                mrp: number;
                price: number;
                sku: string | symbol | number;
                color: string;
                availability: boolean;
                size_unit: string | number;
                size: number;
                quantity: number | null;
                image: string;
                is_default: boolean;
                product: number;
            }>;
        category: {
            id: number;
            name: string;
            parent: number | string;
            slug: string;
        };
        brand: {
            id: number;
            product_count: string;
            slug: string;
            name: string;
            image: string;
            banner: string;
    };
        added_by: string;
        rating: {
            avg_rating: {
                rating__avg: number;
            };
            total_count: number;
            rating_data: []
        };
        created_at: number | string;
        updated_at: number | string;
        status: string;
        is_active: boolean;
        name: string;
        type: string;
        model_no:  number | string;
        thumbnail_image: string;
        video_url: string
        product_status: string;
        description: string;
        warranty_type: string;
        warranty_period:  number | string;
        slug: string;
        notes: string;
        meta_title: string;
        meta_description: string;
        meta_keyword:  number | string;
        attributes: []
    }[];
}