import type { SelectItem } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";
import urls from "@/constants/urls";
import {NestedCategoryProps} from "@/types/NestedCategoryProps";
import {NestedDropDownProps} from "@/types/NestedDropDownProps";

export type Category = {
    id: number;
    name: string;
    slug: string;
    icon: string;
}[];

export const useCategoryOptions = () => {
    return useQuery<any, Error, SelectItem[]>(
        [],
        async () => {

            const { data } = await axiosClient.get<NestedDropDownProps>(
                    `${urls.category.nested}`
                // "/task/cms/task-category/list/?ordering=name&has_service=true"
            );
            const categoryItems = data.map((category) => ({
                slug: category?.slug,
                label: category?.name,
                value: category?.id.toString(),
            }));
            return categoryItems;
        },
    // { enabled: !!filter }
    );
};
