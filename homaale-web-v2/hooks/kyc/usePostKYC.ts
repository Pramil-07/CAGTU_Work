import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export const usePostKYC = () => {
    return useMutation<{ id: number }, Error, FormData>(async (kycPayload) => {
        const { data } = await axiosClient.post(urls.kyc.postKyc, kycPayload);
        return data;
    });
};
