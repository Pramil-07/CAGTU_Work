export type ApplicantsProps = {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Array<{
        id: number;
        created_at: string;
        status: string;
        currency: string;
        price: string;
        earning: string;
        budget_type: string;
        description: string;
        created_by: {
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
            profile_image: string;
            bio: string;
            designation: string;
            is_profile_verified: boolean;
            stats: {
                success_rate: number;
                happy_clients: number;
                user_reviews: number;
                avg_rating: number;
            };
        };
    }>;
};
