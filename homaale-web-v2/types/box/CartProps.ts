export type CartProps = {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Array<{
        id: string;
        booking: number;
        title: string;
        price: string;
        status?: string;
        earning?: string;
        entity_service: {
            id: string;
            slug: string;
            created_at: string;
            created_by: {
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
                images: Array<any>;
            };
            images: Array<{
                id: number;
                name: string;
                size: string;
                media_type: string;
                media: string;
            }>;
            rating?: Array<{
                rating: number;
                rating_count: number;
            }>;
            budget_type: string;
            is_requested: boolean;
            budget_from?: string;
            budget_to: string;
            location: string;
            count: number;
            is_endorsed: boolean;
            end_date?: string;
            videos: Array<any>;
        };
        assigner: {
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
        images: Array<any>;
        videos: Array<any>;
        start_date?: string;
        end_date: string;
        start_time?: string;
        end_time: string;
    }>;
};
