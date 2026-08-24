 interface StockDetails {
    color: string;
    size_unit: string;
    size: number;
}

interface CartItem {
    product_name: string;
    product_price: number;
    product_id: number;
    product_image: string | null;
    product_images: string[];
    quantity: number;
    sub_total: number;
    store_name: string;
    stock: StockDetails;
}

 export interface CartResponse {
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    result: CartItem[];
}

