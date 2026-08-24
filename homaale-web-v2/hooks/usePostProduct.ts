import { useMutation } from '@tanstack/react-query';
import { axiosClient } from '@/utils/axiosClient';
import { toast } from '@/components/common/Toast';

export interface Variant {
    id?: number; // ✅ ID for existing variants
    images: [];
    SKU: string;
    size: string | null;
    color: string | null;
    label: string;
    price: string | null;
    stock_quantity: number | null;
    qr_code: string;
}

export enum optionType {
    color = "COLOR",
    size = "SIZE",
    colorSize = "COLOR_SIZE",
    none = "NONE"
}

export interface ProductData {
    product?: string;
    is_active: boolean | null;
    SKU: string;
    name: string;
    product_status: string;
    category?: string;
    description: string;
    shop?: string|null;
    price: number | undefined|string;
    stock_quantity: number | undefined;
    cost_price: number | undefined | string;
    local_currency: string;
    discount_per: number | undefined | string;
    rating: number | null;
    key_feature: string[];
    images: any[];
    option_type: optionType;
    variants: Variant[]|any;
    allow_multiple_variants:boolean
    extra_data?: Array<{
        longitude: number;
        latitude: number;
    }>;
}

export const usePostProduct = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id?: string; data: ProductData }) => {
            const formData = new FormData();

            // Append basic fields
            formData.append('name', data.name ?? '');
            formData.append('SKU', data.SKU ?? '');
            formData.append('product_status', data.product_status ?? '');
            formData.append('description', data.description ?? '');
            formData.append('stock_quantity', String(data.stock_quantity ?? ''));
            formData.append('rating', String(data.rating ?? ''));
            formData.append('price', String(data.price ?? ''));
            formData.append('key_feature', JSON.stringify(data.key_feature ?? []));
            formData.append('cost_price', String(data.cost_price ?? ''));
            formData.append('discount_per', String(data.discount_per ?? ''));
            formData.append('local_currency', data.local_currency ?? '');
            formData.append('option_type', data.option_type ?? optionType.none);
            formData.append('allow_multiple_variants', String(data.allow_multiple_variants ?? false));

            // Append conditional fields
            if (data.category && !id) {
                formData.append('category', data.category);
            }
            if (data.shop) {
                formData.append('shop', data.shop);
            }
            if (data.product) {
                formData.append('product', data.product);
            }
            if (data.is_active !== undefined) {
                formData.append('is_active', data.is_active ? 'True' : 'False');

            }
            if (data.extra_data) {
                formData.append('extra_data', JSON.stringify(data.extra_data));
            }
            if (data.variants && data.variants.length > 0) {
                formData.append('variants', JSON.stringify(data.variants));
            }

            // Append images as files
            if (data.images?.length > 0) {
                data.images.forEach((img: File) => {
                    if (img instanceof File) {
                        formData.append('images', img);
                    }
                });
            }

            const response = id
                ? await axiosClient.put(`/product/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                : await axiosClient.post(`/product/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            return response.data;
        },

        onSuccess: (data, variables) => {
            const message = variables.id
                ? 'Product updated successfully'
                : 'Product created successfully';
            toast.success(message);
        },

               onError: (error: any, variables) => {
            const action = variables.id ? 'update' : 'create';
            const errorMessages: string[] = [];

            // Simple formatter: discount_per → Discount (%), stock_quantity → Stock Quantity, etc.
            const niceName = (field: string) => {
                if (field.startsWith('variants.')) {
                    const match = field.match(/variants\.(\d+)\.(.*)/);
                    if (match) {
                        const num = Number(match[1]) + 1;
                        const sub = match[2].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return `Variant ${num} - ${sub}`;
                    }
                }
                return field === 'discount_per' ? 'Discount (%)' :
                       field === 'cost_price' ? 'Cost Price' :
                       field === 'stock_quantity' ? 'Stock Quantity' :
                       field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            };

            if (error.response?.data) {
                const errorData = error.response.data;

                if (typeof errorData === 'object' && !Array.isArray(errorData)) {
                    Object.entries(errorData).forEach(([field, errors]) => {
                        if (Array.isArray(errors)) {
                            errors.forEach((err: string) => {
                                errorMessages.push(`${niceName(field)}: ${err}`);
                            });
                        } else if (typeof errors === 'string') {
                            errorMessages.push(`${niceName(field)}: ${errors}`);
                        }
                    });
                }

                if (errorData.detail) {
                    errorMessages.push(errorData.detail);
                } else if (typeof errorData === 'string') {
                    errorMessages.push(errorData);
                }
            } else {
                errorMessages.push(error.message || `Failed to ${action} product`);
            }

            errorMessages.forEach((msg) => toast.error(msg));
        },
    });
};
