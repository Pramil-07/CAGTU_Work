export interface RatingListResult {
    id: number | null;
    rated_by: {
        email: string;
        full_name: string;
        phone: string;
        profile_image: string;
        username: string;
    };
    rated_to: {
        email: string;
        full_name: string;
        phone: string;
        profile_image: string;
        username: string;
    };
    entity_service: string;
    service_type: string;
    is_requested: boolean;
    is_verified: boolean;
    rating: number;
    review: string;
    reply: string;
    created_at: Date;
    replied_date: Date;
}

export interface RatingListFilterFormValuesProps {
    rated_by: string;
    rated_to: string;
    rating: string;
    service: string;
    service_type: string;
}
