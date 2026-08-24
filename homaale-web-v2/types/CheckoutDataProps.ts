export type CheckoutDataProps = {
    id: string;
    user: string;
    currency: number;
    status: string;
    is_active: boolean;
    order_item: Array<{
        id: string;
        task: {
            price:string
            id: string;
            assigner: {
                id: string;
                username: string;
                email: string;
                phone: any;
                first_name: string;
                middle_name: string;
                last_name: string;
                profile_image: any;
                bio: string;
                created_at: string;
            };
            assignee: {
                id: string;
                username: string;
                email: string;
                phone: any;
                first_name: string;
                middle_name: string;
                last_name: string;
                profile_image: any;
                bio: string;
                created_at: string;
            };
            entity_service: string;
            currency: string;
            created_at: string;
            updated_at: string;
            is_active: boolean;
            status: string;
            title: string;
            description: string;
            requirements: string;
            charge: number;
            location: string;
            estimated_time: number;
            slug: string;
            start_date: string;
            end_date: string;
            completed_on: any;
            start_time: string;
            end_time: any;
            extra_data: Array<any>;
            booking: number;
            city: number;
            entity_service_images: Array<any>;
            videos: Array<any>;
          
        };
        created_at: string;
        updated_at: string;
        offer_value: string;
        object_id: string;
        amount: string;
        tax: string;
        vat: string;
        offer: number;
        discount: number;
        platform_charge: string;
        platform_charge_discount: number;
        equipment_charges: number;
        revision_charges: number;
        other_charges: number;
        other_discounts: number;
        extra_data: any;
        is_active: boolean;
        content_type: number;
        order: string;
    }>;
    product_order: {
        created_at: number;
        currency: string | number | symbol;
        id: number;
        items: Array<{
            available_discount: number;
            id: number;
            price: number;
            product: number;
            product_images: Array<{
                image_url:string;
            }>
            product_name: string;
            quantity: number;
            unit_price: number;
            shop: number;
            shop_location: string;
            shop_name: string;
        }>;
        status: string | boolean;
        total_price: number;
        user: string | number;
    };
    grand_total: number;
};
