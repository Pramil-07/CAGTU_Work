import { UserProfile } from './support';

export interface EmailResult {
    id: number;
    created_at: Date;
    updated_at: Date;
    status: string;
    username: string;
    email: string;
    type: string;
    is_active: boolean;
}
export interface EmailFormValuesProps extends Pick<EmailResult, 'username' | 'email' | 'type' | 'is_active'> {
    id: number | null;
    password?: string;
}

export interface NewsletterResult {
    id: number;
    email: string;
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
}

export interface EmailTemplateResult {
    id: number;
    name: string;
    content: string;
    subject: string;
    sender: {
        id: number;
        email: string;
    };
    created_at: Date;
    updated_at: Date;
    created_by: UserProfile;
    is_active: boolean;
}

export interface EmailTemplateFormvaluesProps {
    id: number | null;
    name: string;
    content: string;
    subject: string;
    sender?: string;
    is_active: boolean;
}
