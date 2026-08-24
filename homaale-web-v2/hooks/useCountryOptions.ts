import type { SelectItem } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

export type Country = Array<{
    code: string;
    name: string;
}>;

export const useCountryOptions = (searchCountry: string) => {
    return useQuery<any, Error, SelectItem[]>(
        ["country-options", searchCountry],
        async () => {
            const { data } = await axiosClient.get<Country>(
                "/locale/client/country/options/"
            );

            const countryItems = data.map((country) => ({
                id: country?.code,
                label: country?.name,
                value: country?.code.toString(),
            }));

            return countryItems;
        }
    );
};
