export interface Badge {
    id: number;
    image: string;
    title: string;
  }
  
  export interface UserProfile {
    id: string;
    username: string;
    email: string;
    phone: string;
    full_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    profile_image: string;
    bio: string;
    created_at: string;
    designation: string;
    is_profile_verified: string;
    is_followed: string;
    is_following: string;
    badge: Badge;
  }
  
  // export interface Country {
  //   name: string;
  //   code: string;
  // }
  
  export interface City {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: Country;
  }
  
  export interface Currency {
    code: string;
    name: string;
    symbol: string;
  }
  
  export interface Media {
    id: number;
    name: string;
    size: string;
    media_type: string;
    media: string;
  }
  
  export interface RequiredDocument {
    id: number;
    name: string;
    required_for_user: boolean;
    required_for_merchant: boolean;
  }
  
  export interface Category {
    id: number;
    name: string;
    level: number;
    slug: string;
  }
  
  export interface Service {
    id: string;
    title: string;
    is_active: boolean;
    is_verified: boolean;
    category: Category;
    images: Media[];
    required_documents: RequiredDocument[];
    commission: string;
  }
  
  export interface EntityService {
    id: string;
    slug: string;
    created_at: string;
    created_by: UserProfile;
    owner: UserProfile;
    title: string;
    currency: Currency;
    city: City;
    is_online: boolean;
    service: Service;
    images: Media[];
    budget_type: 'Hourly';
    is_requested: boolean;
    location: string;
    is_range: boolean;
    is_endorsed: boolean;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    videos: Media[];
    budget_from: string;
    budget_to: string;
    payable_from: string;
    payable_to: string;
  }
  
  export interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
    icon: string;
    extra_data: Record<string, string>;
    commission: string;
    inherits_commission: boolean;
  }
  
  export interface Merchant {
    id: string;
    user: string;
    owner: string;
    service_area: string;
    active_hour_start: string;
    active_hour_end: string;
    category: number;
    full_name: string;
    description: string;
    logo: string;
    default_currency: string;
    city: number;
    country: Country;
    address_line1: string;
    address_line2: string;
    staffs: string[];
    extra_data: Record<string, string>;
    commission: number;
  }
  
  export interface OfferRule {
    id: number;
    is_active: boolean;
    title: string;
    description: string;
    extra_data: Record<string, string>;
    has_discount: boolean;
    has_free_items: boolean;
    has_quantity: boolean;
  }
  
  export interface ServiceOffer {
    length: number;
    id: number;
    services: {
      id: string;
      title: string;
      views_count: number;
    }[];
    entity_services: EntityService[];
    categories: ServiceCategory[];
    created_by: string|undefined;
    merchant: string|undefined;
    country: Country;
    free: string;
    offer_rule: number|undefined;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    title: string;
    description: string;
    offer_type: OfferType;
    code: string;
    image: File|null;
    start_date: string;
    end_date: string;
    is_consumable: boolean;
    discount: string;
    discount_type: DiscountType;
    discount_limit: string;
    quantity: number;
    is_common: boolean;
    redeem_points: number;
    organizations: string[];
    redeems: string[];
  }
  
  export interface ServiceOfferResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ServiceOffer[];
  }
  export enum OfferType{
         GIFT_CARD = 'gift_card',
         PROMO_CODE='promo_code',
        }
        
  export enum DiscountType{
    PERCENTAGE='Percentage',
    AMOUNT='Amount'
          }
 export enum Country{
    NEPAL ='NP'
}