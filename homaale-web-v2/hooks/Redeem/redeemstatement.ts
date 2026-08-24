import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

interface RedeemStatements {
    total_pages: number;
    count: number;
    current: number;
    next: string;
    previous: any;
    page_size: number;
    result: Array<{
        created_at: string;
        points: number;
        status: string;
        object_repr: string;
    }>;
}

export const useRedeemstatement = (
    pageNumber?: number,
    pageSize?: string,
    query?: string
) => {
    return useQuery(
        ["REDEEM-STATEMENTS", pageNumber, pageSize, query],
        async () => {
            try {
                const { data } = await axiosClient.get<RedeemStatements>(
                    `${urls.redeem.statement}?page=${pageNumber}&page_size=${pageSize}${query}`
                );
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
