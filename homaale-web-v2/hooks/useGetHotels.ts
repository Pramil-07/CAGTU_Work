// hooks/useGetHotels.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { getNextPageParam } from "@/utils/getNextPageParam";
import { store } from "@/store";

export const useGetHotels = (enabled = true) => {
    return useInfiniteQuery(
        [
            "hotels",
            store.getState().locationReducer.data.latitude,
            store.getState().locationReducer.data.longitude,
            store.getState().locationReducer.radius,
        ],
        async ({ pageParam = 1 }) => {
            const { latitude, longitude } = store.getState().locationReducer.data;
            const { radius } = store.getState().locationReducer;

            const params = new URLSearchParams({
                page: pageParam.toString(),
                page_size: "9",
                near_by: "true",
            });

            if (latitude && longitude) {
                params.append("latitude", latitude.toString());
                params.append("longitude", longitude.toString());
            }
            if (radius) {
                params.append("radius", radius.toString());
            }

            const res = await axiosClient.get(`/hotel/list/?${params.toString()}`);
            return res.data;
        },
        {
            getNextPageParam,
            enabled, // Important: only run when enabled
        }
    );
};
