import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";
import { getNextPageParam } from "utils/getNextPageParam";

import { useGetCookieUser } from "./useGetCookieUser";

export const useGetNotification = () => {
    const user_id = useGetCookieUser();
    return useInfiniteQuery(
        ["notifications"],
        async ({ pageParam = 1 }) => {
            const res = await axiosClient.get(
                "/notification/?page=" + pageParam
            );
            return res.data;
        },
        {
            getNextPageParam,
            enabled: !!user_id,
        }
    );
};
