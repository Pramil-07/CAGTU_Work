interface Location {
    latitude?: number;
    longitude?: number;
    customer_location?: string;
}

export type TaskBookDetailProps = {
    id: string;
    assigner: {
        id: string;
        username: string;
        email: string;
        phone: any;
        full_name: string;
        first_name: string;
        middle_name: any;
        last_name: string;
        profile_image: string;
        bio: string;
        created_at: string;
        designation: string;
        is_profile_verified: boolean;
        is_followed: boolean;
        is_following: boolean;
        badge: {
            id: number;
            image: string;
            title: string;
        };
    };
    assignee: {
        id: string;
        username: string;
        email: string;
        phone: any;
        full_name: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        profile_image: string;
        bio: string;
        created_at: string;
        designation: string;
        is_profile_verified: boolean;
        is_followed: boolean;
        is_following: boolean;
        badge: {
            id: number;
            image: string;
            title: string;
        };
    };
    entity_service: {
        id: string;
        budget_type: string;
        budget_from: string;
        budget_to: string;
        images: Array<any>;
        videos: Array<any>;
        created_by: {
            id: string;
            username: string;
            email: string;
            phone: any;
            full_name: string;
            first_name: string;
            middle_name: any;
            last_name: string;
            profile_image: string;
            bio: string;
            created_at: string;
            designation: string;
            is_profile_verified: boolean;
            is_followed: boolean;
            is_following: boolean;
            badge: {
                id: number;
                image: string;
                title: string;
            };
        };
        highlights: Array<string>;
        location: string;
    };
    currency: {
        code: string;
        name: string;
        symbol: string;
    };
    is_rated: boolean;
    cancellation_reason: string;
    cancellation_description: string;
    cancelled_by: {
        id: string;
        username: string;
        email: string;
        phone: any;
        full_name: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        profile_image: string;
        bio: string;
        created_at: string;
        designation: string;
        is_profile_verified: boolean;
        is_followed: boolean;
        is_following: boolean;
        badge: {
            id: number;
            image: string;
            title: string;
        };
    };
    created_at: string;
    updated_at: string;
    is_active: boolean;
    status: string;
    title: string;
    description: string;
    price: string;
    earning: string;
    estimated_time: number;
    start_date: any;
    end_date: string;
    completed_on: any;
    start_time: any;
    end_time: any;
    is_paid: boolean;
    approved_by: string;
    booking: number;
    extra_data?: {
        location: Location;
        [key: string]: any;
    };
};
