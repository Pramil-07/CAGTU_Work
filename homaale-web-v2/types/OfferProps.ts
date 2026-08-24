export type OffersProps = {
    total_pages: number;
    count: number;
    current: number;
    next: null;
    previous: null;
    page_size: number;
    result: Array<{
        id: number;
        title: string;
        image: string;
        description: string;
        start_date: Date;
        end_date: Date | null;
        offer_type: string;
        code: string;
        offer_rule: number | null;
        redeem_points: number;
    }>;
};
