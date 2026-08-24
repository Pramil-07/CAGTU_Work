import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export interface changePasswordValueProps {
    old_password?: string | null | undefined;
    new_password: string;
    confirm_password: string;
}
export const useChangePassword = () => {
    return useMutation<any, Error, changePasswordValueProps>(
        async (changePasswordPayload) => {
            const { data } = await axiosClient.post(
                urls.auth.changePassword,
                changePasswordPayload
            );
            return data;
        }
    );
};
