import { useState, useEffect } from "react";
import apiClient from "@/axiosConfig";

export interface Category {
    id: number;
    name: string;
    slug?: string;
    icon: string;
    product_count?: number;
    sub_category: Category[];
}
  

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    // const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

  // Dummy data for fallback
    const dummyCategories: Category[] = [
        {
            id: 1,
            name: "Women's Clothing",
            slug: "womens-clothing",
            icon: "👗",
            product_count: 0,
            sub_category: [],
        },
        {
            id: 2,
            name: "Men's Clothing",
            slug: "mens-clothing",
            icon: "👕",
            product_count: 0,
            sub_category: [
                {
                    id: 45,
                    name: "Pant",
                    slug: "pant",
                    icon: "👀",
                    sub_category:[],
                },
                {
                    id: 46,
                    name: "Shirt",
                    slug: "Shirt",
                    icon: "👀",
                    sub_category:[],
                }
            ]
        },
        {
            id: 3,
            name: "Cellphones",
            icon: "📱",
            sub_category: [],
        },
        {
            id: 4,
            name: "Computer & Office",
            icon: "💻",
            sub_category: [],
        },
        {
            id: 5,
            name: "Consumer Electronics",
            icon: "🔌",
            sub_category: [],
        },
        {
            id: 6,
            name: "Jewelry & Accessories",
            icon: "💍",
            sub_category: [],
        },
        {
            id: 7,
            name: "Home & Garden",
            icon: "🏡",
            sub_category: [],
        },
        {
            id: 8,
            name: "Shoes",
            icon: "👞",
            sub_category: [],
        },
        {
            id: 9,
            name: "Mother & Kids",
            icon: "👶",
            sub_category: [],
        },
        {
            id: 10,
            name: "Hot & Trending",
            icon: "🔥",
            sub_category: [],
        },
        {
            id: 11,
            name: "Bottoms",
            icon: "👖",
            sub_category: [],
        },
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get("/product/category/?type=product");
                console.log(response.data.result);
                setCategories(response.data.result);
            } catch (err: unknown) {
                // setCategories(dummyCategories);
                console.log(err);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // const toggleDropdown = () => setIsOpen(!isOpen);

    return { categories, isLoading, error };
};