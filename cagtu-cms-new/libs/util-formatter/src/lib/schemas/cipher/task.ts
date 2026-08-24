export interface TaskSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: TaskResult[];
}

export interface TaskResult {
    id: string;
    service?: {
        id: string;
        title: string;
        category?: {
            id: number;
            name: string;
        };
        commission: string;
    };
    city?: {
        country?: {
            code: string;
            name: string;
        };
        id: number;
        name: string;
    };
    currency?: {
        code: string;
        name: string;
        symbol: string;
    };
    created_by?: {
        id: string;
        username: string;
        email: string;
        phone: string;
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        profile_image: string;
    };
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
    highlights: string[];
    highlights_list: string;
    revisions: string;
    recursion_type: string;
    location: string;
    start_date: Date;
    end_date: Date;
    start_time: Date;
    end_time: Date;
    share_location: boolean;
    is_negotiable: boolean;
    budget_type: string;
    budget_from: string | number;
    budget_to: string | number;
    views_count: string;
    discount_value: string | number;
    discount_type: string;
    images?: {
        id: number;
        media: string;
        size: number;
        name: string;
        media_type: string;
    }[];
    videos?: {
        id: number;
        media: string;
        size: number;
        name: string;
        media_type: string;
    }[];
    is_endorsed: boolean;
    is_professional: boolean;
    is_online: boolean;
    is_requested: boolean;
    no_of_reservation: string;
    payable_from: string;
    payable_to: string;
    is_range: boolean;
    price: string;
    earning: string;
}

export interface ServiceBookingResult extends Pick<TaskResult, 'images' | 'videos' | 'created_at' | 'price' | 'earning'> {
    id: string;
    created_by: {
        user: {
            username: string;
            email: string;
            phone: string;
            first_name: string;
            middle_name: string;
            last_name: string;
        };
        profile_image: string;
    };
    entity_service: {
        created_by: {
            username: string;
            email: string;
            phone: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            profile_image: string;
        };
        currency: {
            name: string;
            code: string;
            symbol: string;
        };
        city: {
            name: string;
            country: {
                name: string;
            };
        };
        service: {
            title: string;
            category: {
                name: string;
            };
        };
        title: string;
        created_at: Date;
    };
    status: string;
}
export interface AssignedTaskResult
    extends Pick<TaskResult, 'images' | 'videos' | 'created_at' | 'title' | 'description' | 'start_date' | 'end_date' | 'price' | 'earning'> {
    assigner: {
        username: string;
        email: string;
        phone: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        profile_image: string;
    };
    assignee: {
        username: string;
        email: string;
        phone: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        profile_image: string;
    };
    status: string;
}

export interface TaskFormValuesProps {
    id: string;
    title: string;
    description: string;
    user: string;
    service: string;
    country: string;
    city: string;
    currency: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    budget_type: string;
    budget_from: string | number;
    budget_to: string | number;
    recursion_type: string;
    revisions: string;
    location: string;
    highlights_list: string;
    discount_type: string;
    discount_value: string | number;
    no_of_reservation: string;
    budget_select: string;
    task_type: string;
    is_professional: boolean;
    is_online: boolean;
    is_requested: boolean;
    share_location: boolean;
    is_negotiable: boolean;
    is_discount_offer: boolean;
    videos?: any[];
    videosPreviewUrl?: any[];
    images: any[];
    imagePreviewUrl: any[];
}

export interface TaskFilterFormValuesProps {
    budget_from: string;
    budget_to: string;
    city: string;
    category: string;
    is_online: string;
    is_requested: string;
    service: string;
    created_by: string;
    ordering: string;
}
export interface AssignedTaskFilterFormValuesProps {
    is_requested: string;
    status: string;
    assignee: string;
    assigner: string;
    date_range: string;
    assigned_from: string;
    assigned_to: string;
    end_date: string;
    ordering: string;
}
export interface BookingsFilterFormValuesProps extends Pick<TaskFilterFormValuesProps, 'category' | 'is_requested' | 'service'> {
    booked_from: string;
    booked_to: string;
    requested_from: string;
    requested_to: string;
    created_by: string; // booked by
    entity_service__created_by: string; //requested by
    booked_range: string;
    requested_range: string;
    ordering: string;
}

export interface TaskRecommendResult {
    id: number | null;
    title: string;
    entity_services: {
        id: string;
        title: string;
    }[];
}

export interface TaskRecommendFormValuesProps {
    id: number | null;
    title: string;
    entity_services: string[];
}

export interface OrderResult {
    id: number;
    order_items: [
        {
            id: string;
            task: string;
            user: string;
            currency: string;
            offer: {
                id: string;
                code: string;
                description: string;
                end_date: Date;
                image: string;
                offer_rule: string;
                offer_type: string;
                start_date: Date;
                title: string;
            };
            offer_value: string;
            platform_charge: string;
            amount: number;
        }
    ];
    currency: string;
    grand_total: number;
    is_active: boolean;
    status: string;
    user: {
        full_name: string;
        profile_image: string;
        email: string;
        username: string;
    };
}
