export interface UserSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: UserResult[];
}

export interface UserResult {
    id?: number;
    username: string;
    email: string;
    created_at?: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
    contact_number: string;
    address: string;
    employeeType: string;
    dob: string;
    facebook_URL: string;
    linkedin_URL: string;
    twitter_URL: string;
}
