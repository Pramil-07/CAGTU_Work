import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

interface MyEarningsType {
    id: number;
    currency: string;
    last_received: number;
    last_paid: number;
    total_income: string;
    total_withdrawals: number;
    available_balance: string;
    frozen_amount: string;
    user: string;
    merchant: any;
    minimum_withdraw: number;
}

export const useMyWallet = () => {
    return useQuery(["my-earning"], async () => {
        const { data } = await axiosClient.get<MyEarningsType[]>(
            urls.wallet.mywallet
            
        );
        return data;
    });
};
