export interface PostTaskPayloadProps {
    // id: string;
    title: string;
    description: string;
    highlights: string[];
    category?: string;
    service: string;
    city: string;
    location: string;
    currency: string;
    budget_type: string;
    budget_from?: number | string | null;
    budget_to: number | string;
    is_negotiable: boolean;
    images: any[];
    imagePreviewUrl?: any[];
    videos: any[];
    videoPreviewUrl?: any[];
    is_online: "true" | "false";
    start_date?: string|null;
    end_date?: string|null;
    start_time?: string | null;
    end_time?: string | null;
    is_active: boolean;
    share_location: boolean;
    is_terms_condition?: boolean;
    budget_choose?: "fixed" | "variable";
    extra_data?: Array<{
        selectedValue?: string;
        latitude?: number | null;
        longitude?: number | null;
    }>;
    // discount_percentage?: number;
    // cost_price?: number;
    // selling_price?: number;
}
