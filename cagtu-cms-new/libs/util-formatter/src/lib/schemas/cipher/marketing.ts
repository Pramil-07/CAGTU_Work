export interface SuccessStoriesResult {
    id: number | null;
    full_name: string;
    email: string;
    specialities: string;
    content: string;
    profile_image: string;
    created_by: string;
    created_at: Date;
    status: boolean;
}
export interface SuccessStoriesFormValuesProps {
    id?: number | null;
    full_name: string;
    email: string;
    specialities: string;
    content: string;
    profile_image: any[];
    profilePreviewUrl?: any[];
    status: boolean;
}
export interface TrustedPartnersResult {
    id: number | null;
    alt_text: string;
    logo: string;
    redirect_url: string;
    created_at: Date;
    is_active: boolean;
}
export interface TrustedPartnersFormValuesProps {
    id?: number | null;
    alt_text: string;
    redirect_url: string;
    logo: any[];
    profilePreviewUrl?: any[];
    is_active: boolean;
}

export interface EndorsementResult {
    id: number;
    title: string;
    image: unknown[];
    url: string;
    services: {
        id: string;
        title: string;
    }[];
    categories: {
        id: number;
        name: string;
    }[];
    created_by: string;
    updated_by: string;
    created_at: Date;
    updated_at: Date;
}

export interface EndorsementFormValuesProps {
    id?: number | null;
    title: string;
    categories: string[];
    services: string[];
    url: string;
    image: any[];
    profilePreviewUrl?: any[];
}

export interface AdvertisementResult {
    id: number | null;
    title: string;
    content: string;
    source: string | null;
    type: string;
    is_closable: boolean;
    web_shape: string;
    mobile_shape: string;
    behaviour: string;
    image: any[];
    redirect_url: string;
    page_url: string;
    is_active: boolean;
    priority: string;
}

export interface AdvertisementFormValuesProps {
    id: number | null;
    title: string;
    content: string;
    source: string | null;
    type: string;
    is_closable: boolean;
    web_shape: string;
    mobile_shape: string;
    behaviour: string;
    image: any[];
    redirect_url: string;
    page_url: string;
    is_active: boolean;
    profilePreviewUrl?: any[];
    priority: string;
}

export interface advertisementFilterFormValuesProps {
    source: string;
    type: string;
    shape: string;
    behaviour: string;
}
