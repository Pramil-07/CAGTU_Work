import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "utils/axiosClient";

import urls from "@/constants/urls";

export interface FollowMutationProps {
    user: string;
    follow: boolean;
}

export const useFollow = () => {
    return useMutation<void, Error, FollowMutationProps>((data) => {
        return axiosClient.post(urls.follow, data);
    });
};
