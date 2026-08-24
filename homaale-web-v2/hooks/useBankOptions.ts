import type { SelectItem } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export type BankOptionProps = Array<{
    id: number;
    name: string;
    is_wallet: boolean;
}>;

export const useBankOptions = (is_wallet: boolean) => {
    return useQuery<any, Error, SelectItem[]>(
        ["bank-options", is_wallet],
        async () => {
            const { data } = await axiosClient.get<BankOptionProps>(
                `${urls.payment.bank_options}?is_wallet=${is_wallet}`
            );
            const bankItems = data.map((bank) => ({
                id: bank?.id,
                label: bank?.name,
                value: bank?.id.toString(),
            }));
            return bankItems;
        }
    );
};
