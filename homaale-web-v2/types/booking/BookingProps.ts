import type { EntityServiceDetailProps } from "../EntityServiceDetailProps";

export interface BookingProps {
    total_pages: number;
    count: number;
    current: number;
    next: string;
    previous: any;
    page_size: number;
    result: Array<{
        id: number;
        created_by: {
            id: number;
            charge_currency: {
                code: string;
                name: string;
                symbol: string;
            };
            user: {
                id: string;
                username: string;
                email: string;
                phone?: string;
                first_name: string;
                middle_name?: string;
                last_name: string;
                full_name: string;
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
                files: Array<any>;
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
                end_date: any;
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
                avg_rating: number;
            };
            country: {
                name: string;
                code: string;
            };
            language: {
                code: string;
                name: string;
            };
            city: {
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
            avatar: {
                image: string;
            };
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
            status: string;
            bio: string;
            gender: string;
            profile_image?: string;
            date_of_birth: string;
            skill: string;
            active_hour_start: string;
            active_hour_end: string;
            experience_level: string;
            user_type: string;
            hourly_rate: number;
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
            subscription: Array<any>;
            security_questions: Array<any>;
        };
        entity_service: EntityServiceDetailProps;
        images: Array<{
            id: number;
            name: string;
            size: string;
            media_type: string;
            media: string;
        }>;
        videos: Array<any>;
        progress_percentage: number;
        created_at: string;
        updated_at: string;
        description: string;
        requirements: Array<string>;
        budget_from: string;
        budget_to: string;
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
        service:{
            category:{
                icon:"string";
                name: string;
                slug: string;
            }
        }
        price: string;
        earning: string;
        owner?: string;
    }>;
}
