export interface PostKycPayloadProps {
    full_name: string;
    address?: string;
    country?: string;
    is_company: boolean;
    organization_name?: string;
    user_type?: string;
    logo?: string | File;
}
