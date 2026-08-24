import { UserProfile } from './support';

export interface LegalResult {
    id: number;
    created_by: UserProfile;
    updated_by: UserProfile[];
    updates: LegalUpdatesResult[];
    title: string;
    content: string;
    new_version: {
        id: number;
        slug: string;
    } | null;
    slug: string;
    is_current: boolean;
    is_latest_draft: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface LegalUpdatesResult {
    id: number | null;
    updated_at: Date;
    user: UserProfile;
}
export interface LegalFormValuesProps {
    id: number | null;
    title: string;
    content: string;
}
