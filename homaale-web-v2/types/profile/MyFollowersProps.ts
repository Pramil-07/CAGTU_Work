export type MyFollowersProps = {
    count: number;
    next: string;
    previous: string;
    result: Array<{
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
    }>;
};
