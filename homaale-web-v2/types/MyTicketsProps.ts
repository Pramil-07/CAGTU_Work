export type MyTicketsProps = {
    total_pages: number;
    count: number;
    next: string;
    previous: string;
    result: Array<{
        id: number;
        type: {
            id: number;
            name: string;
        };
        created_by: {
            id: string;
            username: string;
            email: string;
            phone: string;
            full_name: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            profile_image: string;
            bio: string;
            created_at: string;
            designation: string;
            is_profile_verified: string;
            is_followed: string;
            is_following: string;
            badge: string;
        };
        user: {
            id: string;
            username: string;
            email: string;
            phone: string;
            full_name: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            profile_image: string;
            bio: string;
            created_at: string;
            designation: string;
            is_profile_verified: string;
            is_followed: string;
            is_following: string;
            badge: string;
        };
        attachment: Array<{
            id: number;
            name: string;
            size: string;
            media_type: string;
            media: string;
        }>;
        object: string;
        object_type: string;
        created_at: string;
        updated_at: string;
        is_active: boolean;
        status: string;
        reason: string;
        description: string;
        object_id: string;
        is_resolved: boolean;
    }>;
};
