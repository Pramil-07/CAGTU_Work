import type { SelectItem } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

export type Language = {
    code: string;
    name: string;
}[];

export const useLanguageOptions = () => {
    return useQuery<any, Error, SelectItem[]>(
        ["language-options"],
        async () => {
            const { data } = await axiosClient.get<Language>(
                "/locale/language/options/?ordering=name"
            );
            const languageItems = data.map((language) => ({
                id: language?.code,
                label: language?.name,
                value: language?.code,
            }));
            return languageItems;
        }
    );
};
