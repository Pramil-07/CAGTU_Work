export interface OfferRuleResult {
    id: number | null;
    is_active: boolean;
    title: string;
    description: string;
    has_discount: boolean;
    has_free_items: boolean;
    has_quantity: boolean;
}

export interface ShopResult {
    id:string;
    is_active: boolean;
    owner: string;
    name: string;
    category: string;
    location: string;
    about: string;
    status: string;
    images: File | null
}

export interface ShopFilterFormValuesProps {
    name:string;
    is_active:string,
    category: string,
    status: string,
}

export interface ProductsResults {
    id:string;
    user: string;
    SKU: string,
    name: string;
   product_status: string;
   discount_per : string;
   stock_quantity: number;
   cost_price: number;
   price:number;
   shop: string;
   shop_id:string;
   is_active: boolean;
   description: string
   category: string
local_currency_details:{
    code:string;
    name:string;
},
category_details: {
  id: string
  name :string
},
   local_currency: string
   images: File | null
}

export interface ProductFilterValuesProps {
    category: string;
    shop: string;
    is_active: string;
}

export interface MerchantResult {
    // API  Fields
    id:string;
    owner: string;
    user: string;
    full_name: string;
    active_hour_start: string;
    active_hour_end: string;
    category: number;
    logo: File | null;
    default_currency: string;
    city: string;
    country: string;
    address_line1: string;
    address_line2: string;
    commission: string;
    is_premium:boolean;
    // Extra Data Fields (will go into extra_data)
    extra_data: {
    businessName?: string;
    legalStructure?: string;
    industryType?: string;
    taxId?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    bankName?: string;
    accountNumber?: string;
    paypalEmail?: string;
    businessDescription?: string;
    businessRegistration?: File | null;
    taxDocuments?: File | null;
    governmentId?: File | null;
    }
}

  
export interface ServiceOfferResult {
    id: number | null;
    services: {
        id: string;
        title: string;
    }[];
    entity_services: {
        id: string;
        title: string;
        is_range: boolean;
        budget_from: string;
        budget_to: string;
        payable_from: string;
        payable_to: string;
        currency: {
            symbol: string;
        };
        created_by: {
            id: string;
            username: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            profile_image: string;
            email: string;
            full_name: string;
        };
        service: {
            title: string;
            category: {
                name: string;
            };
        };
    }[];
    categories: { id: number; name: string }[];
    created_by: {
        id: string;
        username: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        profile_image: string;
        email: string;
        full_name: string;
    };
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
    title: string;
    description: string;
    image: any[];
    start_date: Date;
    end_date: Date;
    is_common: boolean;
    is_consumable: boolean;
    discount: string;
    discount_type: string;
    discount_limit: string;
    quantity: string;
    offer_type: string;
    code: string;
    redeem_points: string;
    offer_rule: {
        id: number;
        title: string;
        is_active: boolean;
        has_discount: boolean;
        has_free_items: boolean;
        has_quantity: boolean;
    };
    country: {
        code: string;
        name: string;
    };
    free: {
        id: number;
        title: string;
    };
}

export interface ServiceOfferFormValuesProps {
    id: number | null;
    title: string;
    description: string;
    discount_type: string;
    image: any[];
    profilePreviewUrl?: any[];
    start_date: string;
    end_date: string;
    discount: string;
    discount_limit: string;
    quantity: string;
    offer_rule: string;
    country: string;
    is_common: boolean;
    is_consumable: boolean;
    is_active: boolean;
    free: string;
    offer_type: string;
    code: string;
    redeem_points: string;
    offer_scope?: {
        entity_service: string;
        service: string;
        category: string;
    }[];
    entity_services?: string[];
    services?: string[];
    categories?: string[];
}
export interface ServiceOfferFilterFormValuesProps {
    created_range?: string;
    date_from: string;
    date_to: string;
    created_by: string;
    ordering: string;
    is_consumable: string;
    offer_rule: string;
}

export interface OfferRedeemResult {
    id: number | null;
    redeem_by: {
        id: string;
        username: string;
        full_name: string;
        last_name: string;
        profile_image: string;
    };
    offer: {
        id: number;
        title: string;
        start_date: Date;
        end_date: Date;
        offer_type: string;
        redeem_points: string;
        image: string;
    };
    booking: {
        entity_service: {
            id: number;
            title: string;
        };
    };
    redeem_date: Date;
    is_redeemed: boolean;
    is_active: boolean;
}

export interface OfferRedeemFilterFormValuesProps {
    redeem_by: string;
    redeem_date: string;
    ordering: string;
    is_active: string;
    is_redeemed: string;
}
export interface RewardsListResult {
    id: number | null;
    user: {
        id: string;
        username: string;
        email: string;
        phone: string;
        full_name: string;
        profile_image: string;
        created_at: Date;
    };
    created_at: Date;
    object_repr: string;
    points: number;
    status: string;
}
export interface RewardsListFilterFormValuesProps {
    created_at_after: Date | null;
    created_at_before: Date | null;
    points_max: string;
    points_min: string;
    status: string;
}
export interface RewardsRuleResult {
    id: number | null;
    model: string;
    type?: string;
    created_at?: Date;
    updated_at?: Date;
    action: string;
    reward_points: string | number | null;
    // reward_percentage: string | number | null;
    is_active: boolean;
}
export interface BadgeResult {
    id: number | null;
    created_at: Date;
    updated_at: Date;
    image: unknown[];
    title: string;
    progress_level_start: string;
    progress_level_end: string;
    active_user: number;
}
export interface BadgeFormValuesProps {
    id?: number | null;
    title: string;
    progress_level_start: string;
    progress_level_end: string;
    image: any[];
    profilePreviewUrl?: any[];
}
