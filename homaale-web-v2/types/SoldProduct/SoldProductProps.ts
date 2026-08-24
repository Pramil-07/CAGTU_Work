export interface SoldData {
    status: string;
    message: string;
    total_count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    average_oder_value: number;
    total_revenue: number;
    total_stock: number;
    product_sold: number;
    sales_analytics: {
        revenue: {
            growth_percent: number;
        };
        products_sold: {
            growth_percent: number;
        };
    };
    data: result[];
}
interface LocalCurrencyDetails {
    code: string;
    name: string;
    minor: number;
    tolerance: string;
    supports_stripe: boolean;
    is_active: boolean;
    current_value: string;
    is_default: boolean;
    enable_currency_configuration: boolean;
    symbol: string;
}

interface CategoryDetails {
    id: number;
    name: string;
}

interface Product {
    id: string;
    is_active: boolean;
    SKU: string;
    name: string;
    product_status: string;
    description: string;
    slug: string;
    price: string;
    stock_quantity: number;
    cost_price: string;
    option_type: string;
    allow_multiple_variants: boolean;
    local_currency_details: LocalCurrencyDetails;
    discount_per: string;
    is_deleted: boolean;
    user: string;
    category_details: CategoryDetails;
    rating: number | null;
    is_pinned: boolean;
    pinned_id: string | null;
    selling_price: number;
    is_pinned_by_owner: boolean;
    created_at: string;
    created_by: string;
    variant_details: any[];
    merchant_premium: boolean;
}

interface CartItem {
    id: string;
    product: Product;
}

interface ProductDetails {
    product_image: string[];
    name: string;
    local_currency: string;
    price: {
        original_price: number;
        discount_percentage: string;
        final_price: number;
    };
    purchased_currency?:{
      code?: string | symbol;
      name?: string;
      symbol?: number | symbol;
    };
    stock: {
        total_quantity: number;
        sold_quantity: number;
        cart_quantity: number;
    };
    sold_details: {
        total_price: number;
        sold_date: string;
        status: string;
    };
}

interface Seller {
    id: string;
    username: string;
    email: string | null;
    product: ProductDetails;
}

interface BuyerInfo {
    id: string;
    user: string;
    full_name: string;
    profile_image: string;
    address_line: string;
    points: number;
    city: string;
    country: string;
    charge_currency: string;
}

interface Buyer {
    info: BuyerInfo[];
}

interface result {
    cart_item: CartItem;
    Seller: Seller;
    Buyer: Buyer;
}

