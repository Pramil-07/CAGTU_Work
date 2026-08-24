export type MyBookingProps = {
    total_pages: number;
    count: number;
    current: number;
    next: string;
    previous: any;
    page_size: number;
    result: Array<{
        id?: number;
        currency?: {
            code?: string;
            name?: string;
            symbol?: string;
        };
        booking?: number;
        created_by: {
            id: number;
            user: {
                id: string;
                username: string;
                email: string;
                phone: any;
                full_name: string;
                first_name: string;
                middle_name: string;
                last_name: string;
                created_at: string;
            };
            bio: string;
            user_type: string;
            profile_image: string;
            stats: {
                success_rate: number;
                happy_clients: number;
                task_completed: number;
                user_reviews: number;
                task_assigned: number;
                task_in_progress: number;
                task_cancelled: number;
            };
            skill: string;
            charge_currency: {
                code: string;
                name: string;
                symbol: string;
            };
            hourly_rate: number;
        };
        entity_service: {
            id: string;
            created_by: {
                id: string;
                username: string;
                email: string;
                phone: any;
                full_name: string;
                first_name: string;
                middle_name: string;
                last_name: string;
                profile_image?: string;
                bio: string;
                created_at: string;
                designation: string;
                user_type: string;
                is_profile_verified: boolean;
                is_followed: boolean;
                is_following: boolean;
                badge: {
                    id: number;
                    image: string;
                    title: string;
                };
            };
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
            images: Array<{
                id: number;
                name: string;
                size: string;
                media_type: string;
                media: string;
            }>;
            videos: Array<any>;
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
            };
            created_at: string;
            updated_at: string;
            title: string;
            description: string;
            highlights: Array<string>;
            budget_type: string;
            budget_from?: number;
            budget_to: number;
            start_date?: string;
            end_date?: string;
            start_time?: string;
            end_time?: string;
            share_location: boolean;
            is_negotiable: boolean;
            revisions: number;
            recursion_type: any;
            views_count: number;
            location: string;
            is_professional: boolean;
            is_online: boolean;
            is_requested: boolean;
            discount_type: any;
            discount_value: any;
            extra_data: Array<any>;
            no_of_reservation: number;
            slug: string;
            is_active: boolean;
            needs_approval: boolean;
            is_endorsed: boolean;
            merchant: any;
            event?: string;
            avatar: any;
            is_range?: boolean;
        };
        images: Array<{
            id: number;
            name: string;
            size: string;
            media_type: string;
            media: string;
        }>;
        videos: Array<any>;
        progress_percent: number;
        created_at: string;
        updated_at: string;
        description: string;
        requirements: Array<string>;
        // budget_from: string;
        // budget_to: string;
        price: string;
        earning: string;
        start_date?: string;
        end_date: string;
        start_time?: string;
        end_time?: string;
        location: string;
        is_active: boolean;
        status: string;
        extra_data: any;
        is_accepted: boolean;
        booking_merchant: any;
        city?: number;
    }>;
};
