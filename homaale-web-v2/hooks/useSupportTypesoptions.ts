import type { SelectItem } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export type IssueTypesProps = Array<{
    id: number;
    name: string;
    slug: string;
}>;

export const useSupportTypesOptions = (target: string) => {
    return useQuery<any, Error, SelectItem[]>(
        ["support-types-options"],
        async () => {
            const { data } = await axiosClient.get<IssueTypesProps>(
                `${urls.report.issue_type}?target=${target}`
            );
            const issueTypes = data.map((item) => ({
                id: item?.id,
                label: item?.name,
                value: item?.slug,
            }));
            return issueTypes;
        }
    );
};
