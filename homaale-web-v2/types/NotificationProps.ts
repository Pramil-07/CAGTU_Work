export type NotificationProps = {
    result: Array<{
        id: number;
        user: string;
        created_for: {
            id: string;
            full_name: string;
            profile_image: string;
        };
        content_object: {
            entity_service: {
                id: string;
                title: string;
                is_requested: boolean;
                slug: string;
                created_by: string;
            };
            id: string;
            title: string;
            is_requested: boolean;
            slug: string;
            created_by: string;
            status: string;
            task: string;
        };
        title: string;
        created_date: string;
        read_date: string;
    }>;
    unread_count: number;
};
