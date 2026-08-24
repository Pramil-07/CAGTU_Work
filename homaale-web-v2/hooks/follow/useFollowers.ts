import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";
import type { MyFollowersProps } from "@/types/profile/MyFollowersProps";
import { getNextPageParam } from "@/utils/getNextPageParam";

export const useFollowers = () => {
    return useInfiniteQuery(
        ["get-followers"],
        async ({ pageParam = 1 }) => {
            const { data } = await axiosClient.get<MyFollowersProps>(
                `${urls.followers.list}?page=${pageParam}`
            );
            return data;
        },
        { getNextPageParam }

        // { enabled: !!isKycTab }
    );
};
