export interface Merchant {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: Array<{
        id: string;
        user: string;
        owner: string;
        service_area: string;
        active_hour_start: string;
        active_hour_end: string;
        category: number;
        full_name: string;
        description: string;
        logo: string | null;
        default_currency: string | null;
        city: number | string;
        country: string | null;
        is_premium: boolean;
        address_line1: string;
        address_line2: string | null;
        staffs: Array<string>;
        extra_data: Record<string, unknown>;
        commission: number;
        about: string;
        stats: {
            success_rate: number;
            happy_clients: number;
        }
        staff_count:number;
    }>;
}
