export type BookingPayload = {
    end_date: string;
    requirements: Array<string>;
    location: string | undefined | null;
    offer: Array<number>;
    description: string;
    price: number;
    start_date: string | null;
    start_time: string;
    end_time: string;
    extra_data: any[];
    owner?: string;
    entity_service: string;
    city: string;
    images: any[];
    videos: any[];
};

export interface BookingExtendedPayload extends BookingPayload {
    imagePreviewUrl?: any[];
    videoPreviewUrl?: any[];
    is_online?: string;
    is_terms_condition?: boolean;
    latitude?: number | null;
    longitude?: number | null;
    customer_location?: string;
}

export type ApplyPayload = Pick<
    BookingPayload,
    "entity_service" | "description" | "price"
>;
