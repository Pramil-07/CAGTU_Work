import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export type BankWalletProps = {
    count: number;
    next: string;
    previous: string;
    result: Array<{
        id: number;
        bank_name: string;
        branch_name: string;
        is_wallet: string;
        logo: string;
        bank_account_name: string;
        bank_account_number: string;
        is_primary: boolean;
        is_verified: boolean;
    }>;
};

export const useBankWallet = () => {
    return useQuery<any, Error, BankWalletProps>(
        ["bank-wallet-listing"],
        async () => {
            const { data } = await axiosClient.get<BankWalletProps>(
                urls.profile.bank_account
            );
            return data;
        }
    );
};
