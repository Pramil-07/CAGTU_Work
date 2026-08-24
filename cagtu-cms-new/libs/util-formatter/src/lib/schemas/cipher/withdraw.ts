export interface WithdrawRequestResult {
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

export interface WithdrawRequestFilterFormValuesProps {
    amount_max: string;
    amount_min: string;
    currency: string;
    date_after: string;
    date_before: string;
    ordering: string;
    payment_method: string;
    receiver: string;
    sender: string;
    status: string;
    transaction_type: string;
}

export interface WithdrawFormValueProps {
    payment_method: string;
    intent_id: string;
}

export interface UserWalletResult {
    id: string;
    user: {
        id: string;
        username: string;
        email: string;
        phone: string;
        full_name: string;
        profile_image: string;
    };
    currency: string;
    available_balance: string;
    frozen_amount: string;
}

export interface UserWalletFormValueProps {
    description: string;
    receiver: string;
}
