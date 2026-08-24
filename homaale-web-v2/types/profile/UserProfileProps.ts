export interface UserProfileProps {
    certificationData: {
        count: number;
        next: string;
        previous: string;
        result: {
            id: number;
            name: string;
            issuing_organization: string;
            description: string;
            does_expire: boolean;
            credential_id: string;
            certificate_url: string;
            issued_date: string;
            expire_date: string;
        }[];
    };
    educationData: {
        count: number;
        next: string;
        previous: string;
        result: {
            id: number;
            school: string;
            description: string;
            degree: string;
            field_of_study: string;
            location: string;
            start_date: string;
            end_date: string;
        }[];
    };
    experienceData: {
        count: number;
        next: string;
        previous: string;
        result: {
            id: number;
            title: string;
            description: string;
            employment_type: string;
            company_name: string;
            location: string;
            currently_working: boolean;
            start_date: string;
            end_date: string;
        }[];
    };
    portfolioData: {
        count: number;
        next: string;
        previous: string;
        result: {
            id: number;
            title: string;
            description: string;
            issued_date: string;
            credential_url: string;
            images: string;
            files: string;
        }[];
    };
    profileData: {
        count: number;
        next: string;
        previous: string;
        result: {
            id: number;
            charge_currency: string;
            user: {
                email: string;
            };
            status: string;
            bio: string;
            full_name: string;
            phone: string;
            gender: string;
            profile_image: any;
            date_of_birth: string;
            skill: string;
            active_hour_start: string;
            active_hour_end: string;
            experience_level: string;
            education: string;
            user_type: string;
            hourly_rate: number;
            profile_visibility: string;
            task_preferences: string;
            address_line1: string;
            address_line2: string;
            is_profile_verified: boolean;
            country: {
                code: string;
                name: string;
            };
            language: number;
            subscription: Array<any>;
            message?: string;
        }[];
    };
    documentData: {
        id: number;
        created_at: string;
        updated_at: string;
        document_type: {
            id: number;
            name: string;
            required_for_user: boolean;
            required_for_merchant: boolean;
        };
        document_id: string;
        file: string;
        issuer_organization: string;
        issued_date: string;
        valid_through: string;
        is_verified: boolean;
        kyc: number;
    }[];
    activitiesData: {
        count: number;
        next: string;
        previous: string;
        result: {
            id: number;
            content_type: any;
            action_time: string;
            object_id: any;
            object_repr: string;
            action: string;
            change_message: string;
            user: string;
        }[];
    };
}
