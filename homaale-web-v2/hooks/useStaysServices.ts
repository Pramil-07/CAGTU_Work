import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";

export const useStaysServices = () => {
    const STAYS_CATEGORY_ID = 1;

    return useQuery({
        queryKey: ["stays-services"],
        queryFn: async () => {
            const { data } = await axiosClient.get(
                `/task/service/list/options/?page=-1&category_id=${STAYS_CATEGORY_ID}`
            );
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 min
    });
};
