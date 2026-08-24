import { useMutation } from "@tanstack/react-query";
// import { AxiosError } from "axios";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export const usePostKycDocument = () => {
    return useMutation<void, Error, any>(async (kycDocumnetPayload) => {
        await axiosClient.post(urls.kyc.kycDocument, kycDocumnetPayload);
    });
};
