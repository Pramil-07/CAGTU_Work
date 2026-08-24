import { useQuery } from "@tanstack/react-query";

import urls from "@/constants/urls";
import { axiosClient } from "@/utils/axiosClient";

interface AdProps {
    total_pages: number;
    count: number;
    current: number;
    next: string;
    previous: any;
    page_size: number;
    result: Array<{
        id: number;
        title: string;
        content: string;
        source: number;
        type: string;
        is_closable: boolean;
        mobile_shape: string;
        web_shape: string;
        behaviour: string;
        image: string;
        page_url: string;
        redirect_url: string;
        priority: number;
        is_active: boolean;
    }>;
}

/**
 *
 * @param page_url
 * @param type
 * @param behaviour
 * @param web_shape
 * @returns
 */
export const useGetAds = (
    page_url?: string,
    type?: string,
    behaviour?: string,
    web_shape?: string
) => {
    return useQuery(["ad", page_url, type, behaviour], async () => {
        const { data } = await axiosClient.get<AdProps>(
            `${urls.advertisement}?page_url=${page_url ?? ""}&behaviour=${
                behaviour ?? ""
            }&type=${type ?? ""}&web_shape=${web_shape ?? ""}`
        );
        return data;
    });
};
