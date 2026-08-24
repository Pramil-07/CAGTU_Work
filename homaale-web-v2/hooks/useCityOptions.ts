import type { SelectItem } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { CityTypes } from "@/types/CityTypes";

export const useCityOption = (searchCity: string, is_name?: boolean) => {
    return useQuery<any, Error, SelectItem[]>(
        ["cities-options", searchCity],
        async () => {
            try {
                const { data } = await axiosClient.get<CityTypes[]>(
                    `${urls.locale.city}?search=${searchCity}`
                );
                const cityItems = data.map((city) => ({
                    id: city?.id,
                    label: city?.name,
                    value: is_name ? city?.name : city?.id.toString(),
                }));
                return cityItems;
            } catch (error) {
                console.log(error)
            }
        },
        {
            enabled:searchCity !== undefined,
        }
    );
};
