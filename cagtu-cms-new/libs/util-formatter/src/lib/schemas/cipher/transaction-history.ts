export interface TransactionResult {
    id: string;
    order: string;
    payment_method: {
        name: string;
        logo: string;
    };
    sender: {
        full_name: string;
        profile_image: string;
        email: string;
        phone: number;
        is_profile_verified: boolean;
    };
    receiver: {
        full_name: string;
        profile_image: string;
        email: string;
        phone: number;
        is_profile_verified: boolean;
    };
    currency: {
        name: string;
        symbol: string;
    };
    status: string;
    transaction_type: string;
    amount: number;
    created_at: Date;
}
export interface TransactionFilterFormValuesProps {
    date_after: string;
    date_before: string;
    payment_method: string;
    amount_max: string;
    amount_min: string;
    sender: string;
    receiver: string;
    status: string;
    transaction_type: string;
}
