import { useQuery } from "@tanstack/react-query";

import urls from "@/constants/urls";
import type { ReferralCodeProps } from "@/types/ReferralCodeProps";
import { axiosClient } from "@/utils/axiosClient";

export const useGetReferralCode = () => {
    return useQuery<any, Error, ReferralCodeProps>(
        ["my-referral-code"],
        async () => {
            const { data } = await axiosClient.get(urls.tasker.referral_code);
            return data;
        }
    );
};
