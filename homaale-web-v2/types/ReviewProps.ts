export type ReviewProps = {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Array<{
        rated_by: {
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
            is_profile_verified: boolean;
            is_followed: boolean;
            is_following: boolean;
            badge: {
                id: number;
                image: string;
                title: string;
            };
        };
        id: number;
        rating: number;
        review: string;
        reply: any;
        is_verified: boolean;
        created_at: string;
        replied_date: any;
    }>;
};
