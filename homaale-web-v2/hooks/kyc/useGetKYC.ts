import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";
import type { KYCResponse } from "@/types/kyc/KycResponse";

export const useGetKYC = () => {
    const router = useRouter();
    const isKycTab = router?.query?.active_tab === "kyc-details";

    // const isKycTab = router;
    return useQuery<KYCResponse>(
        ["get-kyc"],
        async () => {
            try {
                const { data } = await axiosClient.get<KYCResponse>(
                    urls.kyc.myKyc
                );
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    throw new Error(error?.response?.data?.message);
                }
                throw new Error("Something went wrong");
            }
        },
        { enabled: !!isKycTab }
    );
};
