export interface CipherCurrentUserSchema {
    userId?: string;
    roles?: any[];
    groups?: Roles[];
    user_permissions?: any[];
    last_login?: string;
    is_superuser?: boolean;
    email?: string;
    username?: string;
    phone?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    is_active?: boolean;
    is_phone_verified?: boolean;
    is_email_verified?: boolean;
    is_verified?: boolean;
    created_at?: Date;
    updated_at?: Date;
    mfa_enabled?: boolean;
    social_only?: boolean;
}

export interface Roles {
    id: number;
    permissions: Permission[];
    name: string;
}

export interface Permission {
    id: number;
    name: string;
    codename: string;
}
