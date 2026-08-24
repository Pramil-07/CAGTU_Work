export type EntityServiceDetailProps = {
    id: string;
    currency: {
        code: string;
        name: string;
        symbol: string;
    };
    city: {
        id: number;
        name: string;
        latitude: number;
        longitude: number;
        country: {
            name: string;
            code: string;
        };

    };

    created_by: {
        id: string;
        username: string;
        email: string;
        phone: any;
        first_name: string;
        middle_name: any;
        last_name: string;
        full_name: string;
        profile_image: string;
        bio: string;
        created_at: string;
        designation: string;
        user_type: string;
        is_profile_verified: string;
        is_followed: boolean;
        is_following: boolean;
        avatar: {
            id: number;
            image: string;
        };
        badge: {
            id: number;
            image: string;
            title: string;
        };
    };
    service: {
        id: string;
        title: string;
        is_active: boolean;
        is_verified: boolean;
        category: {
            id: number;
            name: string;
            level: number;
            slug: string;
            icon: string;
        };
        images: Array<any>;
        commission: string;
    };
    owner: {
        badge: any;
        bio: string;
        created_at: string;
        designation: string;
        email: string;
        first_name: string;
        full_name: string;
        id: string;
        is_followed: boolean;
        is_following: boolean;
        is_profile_verified: boolean;
        last_name: string;
        middle_name?: string | null;
        phone: string;
        profile_image: string;
        username: string;
    }

    images: Array<any>;
    videos: Array<any>;
    rating: Array<{ rating: number; rating_count: number }>;
    count: number;
    offers: Array<{
        id: number;
        title: string;
        description: any;
        image: string;
        offer_type: string;
        code: any;
        offer_rule: any;
        free: any;
    }>;
    endorsements: Array<any>;
    is_redeemable: boolean;
    event: {
        active_dates: Array<string>;
        all_shifts: Array<{
            date: string;
            slots: Array<{
                start: string;
                end: string;
            }>;
        }>;
        id: string;
        title: string;
        start: string;
        end: string;
        is_flexible: boolean;
        is_active: boolean;
        guest_limit: number;
        schedules: Array<{
            title: string;
            total_slots: number;
            id: string;
            event: string;
            repeat_type: number;
            start_date: string;
            end_date: string;
            guest_limit: number;
            is_active: boolean;
            slots: Array<{
                id: string;
                start: string;
                end: string;
            }>;
        }>;
        duration: string;
    };
    rating_stats: {
        average_rating: number;
        five: number;
        four: number;
        three: number;
        two: number;
        one: number;
        total_counts: number;
    };
    created_at: string;
    updated_at: string;
    deleted_at: any;
    title: string;
    description: string;
    highlights: Array<string>;
    budget_type: string;
    budget_from: string;
    budget_to: string;
    payable_from: string;
    payable_to: string;
    is_range: boolean;
    start_date: string;
    end_date: string;
    start_time: string;
    booked_count: number;
    booking_count: number;
    end_time: string;
    share_location: boolean;
    is_negotiable: boolean;
    revisions: number;
    recursion_type: any;
    views_count: number;
    location: string;
    is_professional: boolean;
    is_online: boolean;
    is_requested: boolean;
    is_booked: boolean;
    is_bookable: boolean;
    discount_type: any;
    discount_value: any;
    extra_data: Array<{
        selectedValue: string;
        longitude: number;
        latitude: number;
    }>;
    no_of_reservation: number;
    slug: string;
    is_active: boolean;
    needs_approval: boolean;
    is_endorsed: boolean;
    merchant: any;
    avatar: any;
    is_bookmarked: boolean;
    full_name?: string;
    happy_clients: number;
    success_rate: number;
    status_choice:string;
}

