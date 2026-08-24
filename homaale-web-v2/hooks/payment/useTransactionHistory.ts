import { QueryClient, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "utils/axiosClient";

interface TransactionHistory {
    total_pages: number;
    result: Array<{
        id: string;
        payment_method: {
            id: number;
            name: string;
            slug: string;
            logo: string;
            type: string;
            thumbnail: any;
        };
        sender: {
            id: string;
            username: string;
            email: string;
            phone: any;
            full_name: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            profile_image: string;
            bio: string;
            created_at: string;
            designation: string;
            user_type: string;
            is_profile_verified: boolean;
            is_followed: boolean;
            is_following: boolean;
            badge: {
                id: number;
                image: string;
                title: string;
            };
        };
        receiver: {
            id: string;
            username: string;
            email: string;
            phone: any;
            full_name: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            profile_image: string;
            bio: string;
            created_at: string;
            designation: string;
            user_type: string;
            is_profile_verified: boolean;
            is_followed: boolean;
            is_following: boolean;
            badge: {
                id: number;
                image: string;
                title: string;
            };
        };
        currency: {
            code: string;
            name: string;
            symbol: string;
        };
        earning: boolean;
        created_at: string;
        status: string;
        description: any;
        amount: string;
        transaction_type: string;
        extra_data: {
            pidx: string;
            expires_at: string;
            expires_in: number;
            payment_url: string;
        };
        order: string;
    }>;
}

const queryClient = new QueryClient();
export const useTransactionHistory = (
    pageNumber?: number,
    pageSize?: string,
    query?: string
) => {
    return useQuery(
        ["GET-TRANSACTION", pageNumber, pageSize, query],
        async () => {
            try {
                const { data } = await axiosClient.get<TransactionHistory>(
                    `/payment/transaction/?page=${pageNumber}&page_size=${pageSize}${query}`
                );
                queryClient.invalidateQueries(["GET-TRANSACTION"]);
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
