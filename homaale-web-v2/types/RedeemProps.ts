export type OfferDetailProps = {
    id: number;
    title: string;
    image: string;
    description: string;
    start_date: string;
    end_date: any;
    offer_type: string;
    code: any;
    offer_rule: any;
    redeem_points: number;
    entity_services: Array<{
        id: string;
        title: string;
        created_by: {
            id: string;
            full_name: string;
            profile_image: any;
        };
        images: Array<any>;
        description: string;
    }>;
};
