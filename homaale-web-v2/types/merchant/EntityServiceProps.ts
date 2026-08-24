// entity service interface

export interface EntityServiceProps {
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    result: Result[];
}

export interface Result {
    id: string;
    slug: string;
    created_at: string;
    created_by: User;
    owner: User;
    title: string;
    currency: Currency;
    city: City;
    is_online: boolean;
    service: Service;
    images: any[]; // Replace `any[]` with the specific type if known
    rating: number;
    budget_type: string;
    is_requested: boolean;
    location: string | null;
    is_range: boolean;
    count: number;
    is_endorsed: boolean;
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    videos: any[]; // Replace `any[]` with the specific type if known
    is_bookmarked: boolean;
    budget_from: string;
    budget_to: string;
    payable_from: string;
    payable_to: string;
    rating_count: number;
    booked_count: number;
}

interface User {
    id: string;
    username: string;
    email: string | null;
    phone: string | null;
    full_name: string;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    profile_image: string | null;
    bio: string | null;
    created_at: string;
    designation: string | null;
    is_profile_verified: boolean;
    is_followed: boolean;
    is_following: boolean;
    badge: string | null;
}

interface Currency {
    code: string;
    name: string;
    symbol: string;
}

interface City {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: Country;
}

interface Country {
    name: string;
    code: string;
}
interface Category {
    id: number;
    name: string;
    level: number;
    slug: string;
}
interface Service {
    id: string;
    title: string;
    is_active: boolean;
    is_verified: boolean;
    category: Category;
    images: any[]; // Replace `any[]` with the specific type if known
    required_documents: any[]; // Replace `any[]` with the specific type if known
    commission: string;
}
