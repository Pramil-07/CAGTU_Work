import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";
import type { KYCDocumentProps } from "@/types/kyc/KyCDocumentProps";

export const useGetKYCDocument = () => {
    const router = useRouter();
    const isKycTab = router?.query?.active_tab === "kyc-details";
    return useQuery<KYCDocumentProps>(
        ["kyc-document"],
        async () => {
            try {
                const { data } = await axiosClient.get<KYCDocumentProps>(
                    urls.kyc.kycDocument
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
