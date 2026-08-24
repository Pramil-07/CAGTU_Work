import type { SelectItem } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export type BankBranchOptionProps = Array<{
    id: number;
    name: string;
}>;

export const useBankBranchOptions = (id: string) => {
    return useQuery<any, Error, SelectItem[]>(
        ["bank-branch-options", id],
        async () => {
            const { data } = await axiosClient.get<BankBranchOptionProps>(
                `${urls.payment.bank_branch_options}${id}/`
            );
            const branchItems = data.map((branch) => ({
                id: branch?.id,
                label: branch?.name,
                value: branch?.id.toString(),
            }));
            return branchItems;
        },
        { enabled: !!id }
    );
};
