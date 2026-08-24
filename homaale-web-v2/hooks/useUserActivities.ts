import { useInfiniteQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { UserActivityApiResponse } from "@/types/UserActivitiesProps";
import { getNextPageParam } from "@/utils/getNextPageParam";

enum ReactQueryKeys {
    TASKS = "tasks",
    SERVICES = "services",
    TASKERS = "taskers",
    TASK_DETAIL = "task-detail",
    SERVICE_DETAIL = "service-detail",
    NEARBY_SERVICES = "nearby-services",
    USER_ACTIVITIES = "user-activities",
}

export const useUserActivities = () => {
    return useInfiniteQuery(
        [ReactQueryKeys.USER_ACTIVITIES],
        ({ pageParam = 1 }) =>
            axiosClient
                .get<UserActivityApiResponse>(
                    `${urls.auth.activity}?page=${pageParam}`
                )
                .then((response) => response.data),
        {
            getNextPageParam,
        }
    );
};
