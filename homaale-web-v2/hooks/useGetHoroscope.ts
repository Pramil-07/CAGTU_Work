import { useQuery } from "@tanstack/react-query";

import urls from "@/constants/urls";
import { axiosClient } from "@/utils/axiosClient";

export type HoroscopeProps = Array<{
    id: number;
    sign: number;
    type: number;
    start_date?: string;
    end_date: string;
    description: string;
    is_nepali: boolean;
}>;

export const useGetHoroscope = (type: number, is_nepali: boolean) => {

    return useQuery(["horoscope", type, is_nepali], async () => {
        const { data } = await axiosClient.get<HoroscopeProps>(
            `${urls.horoscope}?is_nepali=${is_nepali}&type=${type}`
        );
        // console.log(data)
        return data;
    });
};
