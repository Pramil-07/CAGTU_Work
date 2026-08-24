import type { LoginResponseProps } from "./LoginResponseProps";

export interface User extends LoginResponseProps {
    id: string;
    email: string;
    phone: any;
    full_name: string;
    profile_image: string;
    is_active: boolean;
    is_verified: boolean;
    groups: Array<{
        id: number;
        permissions: Array<{
            id: number;
            name: string;
            codename: string;
        }>;
        name: string;
    }>;
    permissions: Array<any>;
    is_kyc_verified: boolean;
    social_only: boolean;
    created_at: string;
    is_suspended: boolean;
    has_profile: boolean;
}
