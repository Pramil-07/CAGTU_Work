export type EntityServiceLisitngProps = {
    total_pages: number;
    count: number;
    current: number;
    next: string;
    previous: any;
    page_size: number;
    result: Array<{
        id: string;
        slug: string;
        created_at: string;
        created_by: {
            id: string;
            username: string;
            email: string;
            phone?: string;
            full_name: string;
            first_name: string;
            middle_name?: string;
            last_name: string;
            profile_image?: string;
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
        owner: {
            id: string;
            username: string;
            email: string;
            phone?: string;
            full_name: string;
            first_name: string;
            middle_name?: string;
            last_name: string;
            profile_image?: string;
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
        title: string;
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

        is_online: boolean;
        is_open?: boolean;
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
            };
            images: Array<{
                id: number;
                name: string;
                size: string;
                media_type: string;
                media: string;
            }>;
            required_documents: Array<any>;
            commission: string;
        };
        images: Array<{
            id: number;
            name: string;
            size: string;
            media_type: string;
            media: string;
        }>;
        rating: number;
        budget_type: string;
        is_requested: boolean | null;
        location: string;
        is_range: boolean;
        count: number;
        booked_count: number;
        is_endorsed: boolean;
        is_new?: boolean;
        start_date: any;
        end_date: any;
        start_time: any;
        end_time: any;
        videos: Array<any>;
        is_bookmarked: boolean;
        budget_from: string;
        budget_to: string;
        payable_from: string;
        payable_to: string;
        rating_count: number;
        extra_data: Array<{
            latitude: number;
            longitude: number;
        }>
        icon: any;
    }>;
};
