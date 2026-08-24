import {useInfiniteQuery} from "@tanstack/react-query";
import {axiosClient} from "utils/axiosClient";
import {getNextPageParam} from "utils/getNextPageParam";

import urls from "@/constants/urls";

export const useGetReview = (
    id: string,
    filter: string,
    sort: string,
    count: number,
    is_service: boolean
) => {

    return useInfiniteQuery(
        ["review", id, filter, sort, is_service],
        async ({pageParam = 1}) => {
            if (is_service) {
                const res = await axiosClient.get(
                    `${urls.rating.service}${id}/?page=${pageParam}&rating=${filter}&ordering=${sort}`
                );
                return res.data;
            } else {
                const res = await axiosClient.get(
                    `${urls.rating.tasker}${id}/?page=${pageParam}&rating=${filter}&ordering=${sort}`
                );
                return res.data;
            }
        },
        {
            getNextPageParam,
            enabled: !!id && count > 0,
        }
    );
};
