export interface ServicesSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: ServicesResult[];
}

export interface ServicesPackageSchema {
    count: number;
    current: number;
    next: string | null | undefined;
    page_size: number;
    previous: string | null | undefined;
    result: ServicesPackageResult[];
}

export interface ServicesResult {
    id: string;
    title: string;
    description: string;
    // highlights: string;
    // is_professional: boolean;
    // is_online: boolean;
    // budget_from: string;
    // budget_to: string;
    // budget_type: string;
    // discount_type: string;
    // discount_value: string;
    // location: string;
    // status: string;
    // highlights_list: string;
    created_at: Date;
    updated_at: Date;
    // happy_clients?: number;
    // success_rate?: number;
    is_active: boolean;
    is_verified: boolean;
    meta_title: string;
    meta_description: string;
    meta_keyword: string;
    images?: {
        id: number;
        media: string;
        size: number;
        name: string;
        media_type: string;
    }[];
    views_count?: number;
    videos?: {
        id: number;
        media: string;
        size: number;
        name: string;
        media_type: string;
    }[];
    created_by?: {
        email?: string;
        username?: string;
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        profile_image?: string;
        phone?: string;
    };
    // city?: {
    //     name?: string;
    //     country?: string;
    // };
    category?: {
        id: number;
        name: string;
    };
}

export interface ServicesFormValuesProps {
    id: string;
    title: string;
    description: string;
    category: string;
    meta_title: string;
    meta_description: string;
    meta_keyword: string;
    is_active: boolean;
    // budget_select?: string;
    // highlights: string;
    // is_professional: boolean;
    // is_online: boolean;
    // budget_from: string;
    // budget_to: string;
    // budget_type: string;
    // discount_value: string;
    // discount_type: string;
    // location: string;
    // status: string;
    // highlights_list: string;
    // is_discount_offer: boolean;
    videos?: any[];
    videosPreviewUrl?: any[];
    images: any[];
    imagePreviewUrl: any[];
}

export interface ServicesPackageResult {
    id: number | null;
    title: string;
    // service: string;
    description: string;
    budget: string;
    no_of_revision: string;
    service_offered: string;
    is_active: boolean;
    service_offered_list: string;
    is_recommended: boolean;
    discount_type: string;
    discount_value: string;
}
export interface ServicesPackageFormValuesProps {
    id: number | null;
    title: string;
    // service: string;
    description: string;
    budget: string;
    no_of_revision: string;
    service_offered: string;
    is_active: boolean;
    service_offered_list: string;
    discount_type: string;
    discount_value: string;
    is_recommended: boolean;
    is_discount_offer: boolean;
}
