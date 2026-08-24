import { QueryClient, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

interface EarningHistory {
    total_pages: number;
    result: Array<{
        id: number;
        sender: string;
        receiver: string;
        created_at: string;
        updated_at: string;
        amount: string;
        wallet: number;
        transaction: string;
        task_title: string[];
        currency:{
            code: string;
            name: string;
            symbol: string;
        }
    }>;
}

const queryClient = new QueryClient();
export const useEarnings = (
    pageNumber?: number,
    pageSize?: string,
    query?: string
) => {
    return useQuery(
        ["GET-EARNING-HISTORY", pageNumber, pageSize, query],
        async () => {
            try {
                const { data } = await axiosClient.get<EarningHistory>(
                    `${urls.wallet.history}?page=${pageNumber}&page_size=${pageSize}${query}`
                );
                queryClient.invalidateQueries(["GET-EARNING-HISTORY"]);
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    throw new Error(error?.response?.data?.message);
                }
                throw new Error("Something went wrong");
            }
        }
    );
};
