export type TaskerProps = {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Array<{
        id: number;
        profile_image?: string;
        full_name: string;
        charge_currency: {
            code: string;
            name: string;
            symbol: string;
        };
        user: {
            id: string;
            username: string;
            email: string;
            phone: any;
            full_name: string;
            first_name: string;
            middle_name?: string;
            last_name: string;
            created_at: string;
        };
        portfolio: Array<{
            id: number;
            images: Array<{
                id: number;
                name: string;
                size: string;
                media_type: string;
                media: string;
            }>;
            files: Array<{
                id: number;
                name: string;
                size: string;
                media_type: string;
                media: string;
            }>;
            title: string;
            description: string;
            issued_date: string;
            credential_url: string;
        }>;
        experience: Array<{
            id: number;
            title: string;
            description: string;
            employment_type: string;
            company_name: string;
            location: string;
            currently_working: boolean;
            start_date: string;
            end_date?: string;
        }>;
        education: Array<{
            id: number;
            school: string;
            description: string;
            degree: string;
            field_of_study: string;
            location: string;
            start_date: string;
            end_date: string;
        }>;
        certificates: Array<{
            id: number;
            name: string;
            issuing_organization: string;
            description: string;
            does_expire: boolean;
            credential_id: string;
            certificate_url: string;
            issued_date: string;
            expire_date: any;
        }>;
        stats: {
            success_rate: number;
            happy_clients: number;
            task_completed: number;
            user_reviews: number;
            task_assigned: number;
            task_in_progress: number;
            task_cancelled: number;
        };
        rating: {
            user_rating_count: number;
            avg_rating?: number;
        };
        country: {
            name: string;
            code: string;
        };
        language: {
            code: string;
            name: string;
        };
        city?: {
            id: number;
            name: string;
            local_name: string;
            zip_code: string;
            latitude: number;
            longitude: number;
            country: string;
        };
        interests: Array<{
            id: number;
            name: string;
        }>;
        is_followed: boolean;
        badge: {
            id: number;
            next: {
                id: number;
                image: string;
                title: string;
                progress_level_start: number;
                progress_level_end: number;
            };
            image: string;
            title: string;
            progress_level_start: number;
            progress_level_end: number;
        };
        is_bookmarked: boolean;
        status: string;
        bio: string;
        gender: string;
        date_of_birth: string;
        skill: string;
        active_hour_start: string;
        active_hour_end: string;
        experience_level: string;
        profile_visibility: string;
        task_preferences: string;
        address_line1: string;
        address_line2: string;
        is_profile_verified: boolean;
        designation: string;
        points: number;
        remaining_points: number;
        followers_count: number;
        following_count: number;
        avatar?: number;
        subscription: Array<any>;
        security_questions: Array<number>;
    }>;
};
