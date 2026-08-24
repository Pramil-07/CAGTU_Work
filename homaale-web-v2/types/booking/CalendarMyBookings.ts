// Booking.types.ts
export interface Booking {
    id: string;
    created_by: UserProfile;
    entity_service: EntityService;
    images: Media[];
    videos: Media[];
    progress_percent: number;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    description: string;
    requirements: string[];
    price: string; // String representation of number
    earning: string; // String representation of number
    start_date: string; // YYYY-MM-DD format
    end_date: string; // YYYY-MM-DD format
    start_time: string; // HH:MM:SS format
    end_time: string; // HH:MM:SS format
    location: string;
    is_active: boolean;
    status: string;
    extra_data: any[];
    is_accepted: boolean;
    cancelling_party: string;
    cancellation_reason: string;
    cancellation_description: string;
    is_refunded: boolean;
    is_compensated: boolean;
    is_penalized: boolean;
    updated_by: string; // UUID
    approved_by: null | string;
    owner: string; // UUID
    city:City; // City ID
    cancelled_by: null | string;
  }
  
  export interface UserProfile {
    id: number;
    user: User;
    bio: string;
    profile_image: string;
    stats: UserStats;
    skills: string[];
    charge_currency: Currency;
    city: City;
    address_line1: string;
    address_line2: string;
  }
  
  export interface User {
    id: string; // UUID
    username: string;
    email: string;
    phone: string | null;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    created_at: string; // ISO date string
  }
  
  export interface UserStats {
    success_rate: number;
    happy_clients: number;
    task_completed: number;
    user_reviews: number;
    task_assigned: number;
    task_in_progress: number;
    task_cancelled: number;
  }
  
  export interface Currency {
    code: string;
    name: string;
    symbol: string;
  }
  
  export interface City {
    id: number;
    name: string;
    local_name?: string;
    zip_code?: string;
    latitude: number;
    longitude: number;
    country: string | Country;
  }
  
  export interface Country {
    name: string;
    code: string;
  }
  
  export interface EntityService {
    id: string; // UUID
    created_by: ServiceCreator;
    currency: Currency;
    city: City;
    images: string[];
    videos: string[];
    service: Service;
    event: null | object; // Define more specific type if event structure is known
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    title: string;
    description: string;
    highlights: string[];
    budget_type: string;
    is_range: boolean;
    budget_from: string; // String representation of number
    budget_to: string; // String representation of number
    payable_from: string; // String representation of number
    payable_to: string; // String representation of number
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    share_location: boolean;
    is_negotiable: boolean;
    revisions: number;
    views_count: number;
    location: string;
    is_professional: boolean;
    is_online: boolean;
    is_requested: boolean;
    discount_type: string | null;
    discount_value: string | null;
    extra_data: any[];
    slug: string;
    is_active: boolean;
    needs_approval: boolean;
    is_endorsed: boolean;
    updated_by: string; // UUID
    owner: string; // UUID
  }
  
  export interface ServiceCreator {
    id: string; // UUID
    username: string;
    email: string;
    phone: string;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    profile_image: string;
    bio: string;
    created_at: string; // ISO date string
    designation: string;
    is_profile_verified: boolean;
    is_followed: boolean;
    is_following: boolean;
    badge: null | string;
  }
  
  export interface Service {
    id: string; // UUID
    title: string;
    is_active: boolean;
    is_verified: boolean;
    category: Category;
    images: string[];
    required_documents: string[];
    commission: string; // String representation of number
  }
  
  export interface Category {
    id: number;
    name: string;
    level: number;
    slug: string;
  }
  
  export interface Media {
    id: number;
    name: string;
    size: string;
    media_type: string;
    media: string; // URL
  }