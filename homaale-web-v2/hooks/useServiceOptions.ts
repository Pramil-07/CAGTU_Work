import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { ServiceOptionTypes } from "@/types/ServiceOptionTypes";
export const useServiceOption = (filter: string | null, enabled: boolean) => {
    return useQuery(
        ["service-options", filter],
        async () => {
            try {
                const { data } = await axiosClient.get<ServiceOptionTypes>(
                    `${urls.entity.service_options}?page=-1&category_id=${filter}`
                );
                const serviceItems = data.map((service) => ({
                    id: service?.id,
                    label: service?.title,
                    value: service?.id,
                    commission: service?.commission,
                }));
                return serviceItems;
            } catch (error) {
                console.log(
                    "🚀 ~ file: Filters.tsx:18 ~ const{data}=useQuery ~ error",
                    error
                );
            }
        },
        { enabled: !!filter || enabled }
    );
};
