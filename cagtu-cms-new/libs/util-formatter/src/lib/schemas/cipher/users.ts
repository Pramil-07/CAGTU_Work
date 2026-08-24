import { UserProfile } from './support';

export interface UsersSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: UsersResult[];
}

export interface UsersResult {
    id: string;
    username: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    profile_image: string;
    email: string;
    phone: string;
    is_active: boolean;
    is_phone_verified: boolean;
    is_email_verified: boolean;
    is_kyc_verified: boolean;
    is_verified: boolean;
    mfa_enabled: boolean;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
    profile: {
        id: number;
        active_hour_end: string;
        active_hour_start: string;
        address_line1: string;
        address_line2: string;
        charge_currency: {
            id: number;
            name: string;
            code: string;
            symbol: string;
        };
        bio: string;
        city: {
            id: number;
            name: string;
        };
        country: {
            id: number;
            name: string;
        };
        language: {
            id: number;
            name: string;
        };
        date_of_birth: string;
        designation: string;
        experience_level: string;
        gender: string;
        hourly_rate: string;
        is_profile_verified: boolean;
        points: string;
        profile_visibility: string;
        skill: string;
        task_preferences: string;
        user_type: string;
        profile_image: string;
        created_at: Date;
        updated_at: Date;
    };
    is_superuser?: boolean;
    roles?: {
        id: number;
        name: string;
    }[];
    groups?: {
        id: number;
        name: string;
    }[];
    suspension_details: {
        to_date: Date;
        reason: string;
        from_date: Date;
        created_by: string;
    };
}
export interface UserFilterFormValuesProps {
    created_range: string;
    date_from: string;
    date_to: string;
    group: string;
    is_suspended: string;
    is_active: string;
    is_verified: string;
    role: string;
    ordering: string;
}

export interface UsersFormValuesProps {
    id: string;
    // username: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    password: string;
    roles: string[];
    groups: string[];
}

export interface KYCDocUnverifyResult {
    is_verified: boolean;
    comment: string;
    id: number;
}

export interface KYCResult {
    id: number | null;
    full_name: string;
    comment: string | null;
    company_address_comment: string | null;
    is_company: boolean;
    organization_name: string;
    address: string;
    is_kyc_verified: boolean;
    is_address_verified: boolean;
    is_company_kyc_verified: boolean;
    is_company_address_verified: boolean;
    created_at: Date;
    updated_at: Date;
    country: {
        id: number;
        name: string;
    };
    user: {
        id: string;
        bio: string;
        email: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        profile_image: string;
        username: string;
        phone: string;
    };
    kyc_documents: {
        id: number;
        file: string;
        document_type: {
            name: string;
        };
        document_id: string;
        issuer_organization: string;
        issued_date: string;
        valid_through: string;
        is_verified: boolean;
        comment: string | null;
        created_at: Date;
        updated_at: Date;
    }[];
    bank_details: {
        id: number;
        bank_account_name: string;
        bank_account_number: string;
        bank_name: string;
        branch_name: string;
        is_primary: boolean;
        is_verified: boolean;
    }[];
    company: {
        id: number;
        manager: {
            id: string;
            username: string;
            email: string;
            phone: string;
            full_name: string;
            profile_image: string;
        };
        charge_currency: {
            id: number;
            name: string;
        };
        available_hour: {
            id: number;
            status: string;
            from_hour: string;
            to_hour: string;
            created_at: Date;
            updated_at: Date;
        };
        organization_name: string;
        description: string;
        profile_image: string;
        established_date: Date;
        hourly_rate: number;
        address_line1: string;
        address_line2: string;
        is_profile_verified: boolean;
        status: string;
        created_at: Date;
        updated_at: Date;
    };
}

export interface KYCFilterFormValueProps {
    // company: string;
    kyc_verified: string;
    address_verified: string;
    // company_address_verified: string;
    // company_kyc_verified: string;
    ordering: string;
}

export interface UserHistoryResult {
    id: number;
    user: UserProfile;
    from_date: Date;
    to_date: Date;
    reactivate_date: Date;
    reason: string;
}

export interface UserHistoryFilterFormValueProps {
    created_range: string;
    start_date: string;
    end_date: string;
    ordering: string;
    user: string;
}
