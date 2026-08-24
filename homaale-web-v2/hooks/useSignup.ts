import { useMutation } from "@tanstack/react-query";

import urls from "@/constants/urls";
import type { SignUpProps } from "@/types/SignUpProps";
import { axiosClient } from "@/utils/axiosClient";

export interface LoginSuccessResponse {
    email: string;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    phone: string | null;
}

export const useSignup = () => {
    return useMutation<LoginSuccessResponse, Error, SignUpProps>(
        async (signupPayload) => {
            const { data } = await axiosClient.post<LoginSuccessResponse>(
                urls.auth.signup,
                signupPayload
            );
            return data;
        }
    );
};
