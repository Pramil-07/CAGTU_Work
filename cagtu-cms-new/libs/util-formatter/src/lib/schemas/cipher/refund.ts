export interface RefundResult {
    id: string;
    cancellation_description: string;
    cancellation_reason: string;
    cancelled_by: {
        profile_image: string;
        email: string;
        full_name: string;
        username: string;
        phone: string;
        id: string;
    };
    approved_by: {
        profile_image: string;
        email: string;
        full_name: string;
        username: string;
        phone: string;
        id: string;
    };
    created_by: {
        profile_image: string;
        user: {
            id: string;
            username: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            profile_image: string;
            email: string;
            full_name: string;
        };
    };
    cancelling_party: string;
    price: string;
    earning: string;
    entity_service: {
        id: string;
        title: string;
        is_range: boolean;
        budget_from: string;
        budget_to: string;
        payable_from: string;
        payable_to: string;
        currency: {
            symbol: string;
        };
        created_by: {
            id: string;
            username: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            profile_image: string;
            email: string;
            full_name: string;
        };
        service: {
            title: string;
            category: {
                name: string;
            };
        };
    };
    status: string;
    created_at: Date;
    start_date: Date;
    start_time: string;
    end_date: Date;
    end_time: string;
    location: string;
    is_accepted: boolean;
    is_active: boolean;
    description: string;
    requirements: string[];
    is_compensated: boolean;
    is_penalized: boolean;
    is_refunded: boolean;
    is_paid: boolean;
}

export interface RefundFilterFormValuesProps {
    is_compensated: string;
    is_penalized: string;
    is_refunded: string;
    user_type: string;
}

export interface RefundFormValueProps {
    booking: string;
    charge: string;
    penalized_user: string;
    type: string;
}

export interface PenalizedUserOptionsProps {
    value: string;
    label: string;
    profile_image: string;
    username: string;
}
