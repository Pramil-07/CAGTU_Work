export interface ProductFormValueProps {
    id?: number | null;
    name: string;
    description: string;
    brand: string;
    category: string;
    thumbnail_image: any[];
    model_no: string;
    video_url: string;
    product_status: string;
    warranty_type: string;
    warranty_period: string;
    meta_title: string;
    meta_discription: string;
    meta_keyword: string;
    notes: string;
    is_active: boolean;
    no_brand?: boolean;
    productPreviewUrl?: any[];
    product_attribute?: any;
}
export interface ProductsResult {
    id?: number | null;
    name: string;
    description: string;
    brand: number;
    category: number;
    thumbnail_image: string;
    model_no: string;
    video_url: string;
    product_status: string;
    warranty_type: string;
    warranty_period: string;
    meta_title: string;
    meta_discription: string;
    meta_keyword: string;
    notes: string;
    is_active: boolean;
}
