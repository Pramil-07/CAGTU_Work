import { useState, useEffect } from "react";
import apiClient from "@/axiosConfig";

export interface Tag {
    id: number;
    name: string;
    slug?: string;
}

export const useTags = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Dummy data for fallback (optional)
    const dummyTags: Tag[] = [
        { id: 1, name: "New Arrival", slug: "new-arrival" },
        { id: 2, name: "Discount", slug: "discount"},
        { id: 3, name: "Best Seller", slug: "best-seller"},
    ];

    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get("/tags/");
              console.log("product tags",response.data);
                setTags(response.data);
            } catch (err: unknown) {
                console.log(err);
                setTags(dummyTags);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTags();
    }, []);
    console.log("tags", tags)


    return { tags, isLoading, error };
};
