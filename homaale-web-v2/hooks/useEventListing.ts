import { useQuery } from "@tanstack/react-query";

import urls from "@/constants/urls";
import type { EventGetProps } from "@/types/event/EventGetProps";
import { axiosClient } from "@/utils/axiosClient";

export const useEventListing = (id: string) => {
    return useQuery(
        ["event-schedule-listing", id],
        async () => {
            try {
                const { data } = await axiosClient.get<EventGetProps>(
                    `${urls.event.initial}${id}/`
                );
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: [id].tsx:20 ~ const{data}=useQuery ~ error",
                    error
                );
            }
        },
        { enabled: !!id }
    );
};
