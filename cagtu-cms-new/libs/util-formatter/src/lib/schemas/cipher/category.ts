export interface CipherCategoryResult {
    id: number | null;
    level?: number;
    name: string;
    icon?: string;
    parent: number | null;
    is_active?: boolean;
    child?: unknown[];
    commission?: string;
    inherits_commission?: boolean;
    slug?: string;
    avatars: {
        id: number;
        image: string;
        name: string;
        size: number;
    }[];
}
//top-categories list type
export interface TopCategoriesResult {
    id: number | null;
    category: string;
    priority: number;
    icon: string;
}
//top-categories formdata type
export interface TopCategoryFormValuesProps {
    category: string;
    priority: number;
}
export interface CipherCategoryFormValueProps {
    id: number | null;
    name: string;
    icon?: string;
    parent: number | null;
    is_active?: boolean;
    avatar_images: any[];
    avatarPreviewUrl?: any[];
    commission?: string;
    inherits_commission?: boolean;
}
