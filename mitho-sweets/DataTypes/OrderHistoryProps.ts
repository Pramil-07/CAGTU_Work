 export interface Order {
    id: number;
    order_items: OrderItem[];
    user: User;
    delivery_address: DeliveryAddress | null;
    billing_adderess: DeliveryAddress | null;
    created_at: string;
    updated_at: string;
    status: string;
    order_id: number;
    coupon_used: boolean;
    coupon_name: string | null;
    discount: number | null;
    sub_total: number;
    total_price: number;
    order_status: string;
    is_paid: boolean;
    ordered: boolean;
    delivered_date: string | null;
    payment_method: string | null;
}

interface OrderItem {
    product_name: string;
    product_price: number;
    product_image: string | null;
    stock: number;
    quantity: number;
    sub_total: number;
    store_name: string;
    stock_details: StockDetails;
}

interface StockDetails {
    color: string;
    size_unit: string;
    size: number;
}

interface User {
    username: string;
    email: string;
    first_name: string;
    last_name?: string;
}

interface DeliveryAddress {
    id: number;
    country: string;
    state: string;
    city: string;
    street_address: string;
    postal_code: string | null;
    contact_number: string;
    delivery_option: string | null;
    first_name: string;
    last_name?: string;
    email: string;
    company_name: string | null;
    user: string | null;
}

interface OrderResponse {
    status: string;
    data: Order[];
}