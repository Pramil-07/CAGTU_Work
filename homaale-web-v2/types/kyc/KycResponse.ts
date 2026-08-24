export type KYCResponse = {
    id: number;
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
    country: {
        name: string;
        code: string;
    };
    created_at: string;
    updated_at: string;
    full_name: string;
    is_company: boolean;
    organization_name: string;
    address: string;
    is_kyc_verified: boolean;
    is_address_verified: boolean;
    is_company_kyc_verified: boolean;
    is_company_address_verified: boolean;
    comment: string;
    logo: string;
};
