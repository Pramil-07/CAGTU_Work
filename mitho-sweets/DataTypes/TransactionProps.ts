export interface TransactionResponse {
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    result: Transaction[];
}
export interface User {
    email: string;
    extra_details: {
        phone: string | null;
        profile_image: string | null;
    };
    first_name: string | null;
    last_name: string | null;
    role: string[];
    username: string;
}
export interface Transaction {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    status: string;
    amount: number;
    currency: string;
    provider: string;
    intent_id: string;
    description: string | null;
    payment_status: string;
    transaction_type: string;
    extra_data: ExtraData;
    order: string | null;
    order_item: string | null;
    sender: string;
    receiver: string;
}

export interface ExtraData {
    id: string;
    links: Link[];
    intent: string;
    status: string;
    create_time: string;
    purchase_units: PurchaseUnit[];
}

export interface Link {
    rel: string;
    href: string;
    method: string;
}

export interface PurchaseUnit {
    items: Item[];
    payee: Payee;
    amount: Amount;
    reference_id: string;
}

export interface Item {
    name: string;
    quantity: string;
    unit_amount: UnitAmount;
}

export interface Payee {
    merchant_id: string;
    email_address: string;
}

export interface Amount {
    value: string;
    breakdown: Breakdown;
    currency_code: string;
}

export interface Breakdown {
    item_total: UnitAmount;
}

export interface UnitAmount {
    value: string;
    currency_code: string;
}