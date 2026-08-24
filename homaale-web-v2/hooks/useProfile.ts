import { useQuery } from "@tanstack/react-query";
import urls from "constants/urls";
import { axiosClient } from "utils/axiosClient";

import type { ProfileResponseProps } from "@/types/ProfileResponseProps";

import { useGetCookieUser } from "./useGetCookieUser";
import { useUser } from "./useUser";

export const useProfile = () => {
    const { data } = useUser();
    const user_id = useGetCookieUser();
    return useQuery<any, Error, ProfileResponseProps>(
        ["profile-data", data?.has_profile, user_id],
        async () => {
            const { data } = await axiosClient.get<ProfileResponseProps>(
                urls.tasker.profile
            );
            return data;
        },
        {
            onError: (e) => {
                console.log("🚀 ~ file: useProfile.ts:21 ~ useProfile ~ e:", e);
            },
            // staleTime: Infinity,
            // enabled: !!data?.has_profile,
        }
    );
};
