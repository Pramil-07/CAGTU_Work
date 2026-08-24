export type TaskBookingProps = {
    total_pages: number;
    count: number;
    current: number;
    next: string;
    previous: any;
    page_size: number;
    result: Array<{
        id: string;
        assigner: {
            id: string;
            username: string;
            email: string;
            phone?: string;
            full_name: string;
            first_name: string;
            middle_name?: string;
            last_name: string;
            profile_image: string;
            bio: string;
            created_at: string;
            designation: string;
            user_type: string;
            is_profile_verified: string;
            is_followed: boolean;
            is_following: boolean;
            avatar: {
                image?: string;
                id?: number;
            };
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
            middle_name?: string;
            last_name: string;
            profile_image: string;
            bio: string;
            created_at: string;
            designation: string;
            user_type: string;
            is_profile_verified: string;
            is_followed: boolean;
            is_following: boolean;
            avatar: {
                id?: number;
                image?: string;
            };
            badge: {
                id: number;
                image: string;
                title: string;
            };
        };
        entity_service: {
            is_requested:boolean,
            id: string;
            budget_type: string;
            budget_from?: number;
            budget_to: number;
            images: Array<{
                id: number;
                name: string;
                size: string;
                media_type: string;
                media: string;
            }>;
            videos: Array<any>;
            created_by: {
                id: string;
                username: string;
                email: string;
                phone: any;
                full_name: string;
                first_name: string;
                middle_name?: string;
                last_name: string;
                profile_image: string;
                bio: string;
                created_at: string;
                designation: string;
                user_type: string;
                is_profile_verified: string;
                is_followed: boolean;
                is_following: boolean;
                avatar: {
                    image?: string;
                    id?: number;
                };
                badge: {
                    id: number;
                    image: string;
                    title: string;
                };
            };
        };
        currency: {
            code: string;
            name: string;
            symbol: string;
        };
        created_at: string;
        updated_at: string;
        is_active: boolean;
        status: string;
        title: string;
        description: string;
        requirements: Array<string>;
        price: string;
        earning: string;
        location: string;
        estimated_time: number;
        slug: string;
        start_date?: string;
        end_date: string;
        completed_on: any;
        start_time?: string;
        end_time?: string;
        extra_data: Array<any>;
        is_paid: boolean;
        booking: number;
        booked_count: number;
        city: number;
        images: Array<any>;
        videos: Array<any>;
    }>;
};
