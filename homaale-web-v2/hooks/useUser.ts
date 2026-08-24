import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

import userService from "@/features/user/userService";
import type { User } from "@/types/UserProps";

export const useUser = () => {
    const refresh = Cookies.get("refresh");
    return useQuery<any, Error, User>(
        ["user-data", refresh],
        async () => await userService.fetchUser(refresh as string),
        {
            retry: 3,
            onError: (e) => {
                console.log("🚀 ~ file: useUser.ts:12 ~ useUser ~ e:", e);
            },
            enabled: !!refresh,
        }
    );
};
