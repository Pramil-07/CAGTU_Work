import type { SelectItem } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

export type Category = {
    id: number;
    name: string;
}[];

export const useSkillsOptions = () => {
    return useQuery<any, Error, SelectItem[]>(["skills-options"], async () => {
        const { data } = await axiosClient.get<Category>(
            "/tasker/skill/options"
        );
        const categoryItems = data.map((skill) => ({
            id: skill?.id,
            label: skill?.name,
            value: skill?.id.toString(),
        }));
        return categoryItems;
    });
};
