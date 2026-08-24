import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";

interface ShopOption {
    value: string;
    label: string;
}

export const useShopOptions = () => {
    return useQuery<ShopOption[], Error>(
        ["active-shops"],
        async () => {
            try {
                const { data } = await axiosClient.get("/product/shops/?is_active=true");
                // console.log("Raw shop data:", data);
                // Check if data.results exists and is an array
                if (!data.results || !Array.isArray(data.results)) {
                    throw new Error("Expected results array in API response");
                }
                return data.results.map((shop: { id: string; name: string }) => ({
                    value: shop.id,
                    label: shop.name,
                }));
            } catch (error) {
                console.error("Failed to fetch shop options:", error);
                throw error;
            }
        },
    );
};
